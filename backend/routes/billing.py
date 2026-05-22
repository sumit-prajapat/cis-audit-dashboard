"""
routes/billing.py — Stripe billing integration
Endpoints:
  POST /billing/checkout       → create Stripe Checkout session
  POST /billing/portal         → create Stripe Customer Portal session
  POST /billing/webhook        → handle Stripe webhook events
  GET  /billing/status         → get current org billing status
"""
import os
import stripe
from fastapi import APIRouter, Depends, HTTPException, Request, Header
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import Organization, User, PLANS
from routes.auth import get_current_user

router = APIRouter()

# Stripe configuration
stripe.api_key = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

# ── Plan → Stripe price ID mapping ───────────────────────
# Set these in your Stripe dashboard and add to .env
STRIPE_PRICE_IDS = {
    "starter":  os.getenv("STRIPE_PRICE_STARTER",  "price_starter_monthly"),
    "growth":   os.getenv("STRIPE_PRICE_GROWTH",   "price_growth_monthly"),
    "team":     os.getenv("STRIPE_PRICE_TEAM",     "price_team_monthly"),
}


def _get_or_create_stripe_customer(org: Organization, user: User) -> str:
    """Get existing or create new Stripe customer for this org."""
    if org.stripe_customer_id:
        return org.stripe_customer_id

    customer = stripe.Customer.create(
        email=user.email,
        name=org.name,
        metadata={
            "org_id":   org.id,
            "org_slug": org.slug,
        }
    )
    return customer.id


# ── GET /billing/status ───────────────────────────────────
@router.get("/status")
def get_billing_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return current plan, device usage, and billing details."""
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    from models import Device
    device_count = db.query(Device).filter(
        Device.org_id == org.id, Device.is_active == True
    ).count()

    plan_info = PLANS.get(org.plan, PLANS["free"])

    return {
        "plan":                    org.plan,
        "plan_label":              org.get_plan_label(),
        "device_limit":            org.device_limit,
        "device_count":            device_count,
        "devices_remaining":       max(0, org.device_limit - device_count) if org.device_limit != -1 else -1,
        "stripe_subscription_id":  org.stripe_subscription_id,
        "subscription_status":     org.stripe_subscription_status,
        "current_period_end":      org.stripe_current_period_end.isoformat() if org.stripe_current_period_end else None,
        "has_billing":             bool(org.stripe_customer_id),
    }


# ── POST /billing/checkout ────────────────────────────────
@router.post("/checkout")
def create_checkout_session(
    plan: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a Stripe Checkout session for plan upgrade.
    Redirects to Stripe hosted page, then back to /billing on success.
    """
    if plan not in STRIPE_PRICE_IDS:
        raise HTTPException(status_code=400, detail=f"Invalid plan: {plan}. Must be one of: {list(STRIPE_PRICE_IDS.keys())}")

    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Billing not configured (STRIPE_SECRET_KEY missing)")

    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # If already on this plan, skip
    if org.plan == plan and org.stripe_subscription_status == "active":
        raise HTTPException(status_code=400, detail="Already subscribed to this plan")

    try:
        customer_id = _get_or_create_stripe_customer(org, current_user)

        # Save customer ID immediately in case we need it before webhook
        if not org.stripe_customer_id:
            org.stripe_customer_id = customer_id
            db.commit()

        # If upgrading (already has active subscription), use billing portal instead
        if org.stripe_subscription_id and org.stripe_subscription_status == "active":
            portal = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=f"{FRONTEND_URL}/billing",
            )
            return {"url": portal.url, "type": "portal"}

        # New subscription — create Checkout session
        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            mode="subscription",
            line_items=[{
                "price":    STRIPE_PRICE_IDS[plan],
                "quantity": 1,
            }],
            success_url=f"{FRONTEND_URL}/billing?checkout=success&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/billing?checkout=canceled",
            metadata={
                "org_id": org.id,
                "plan":   plan,
            },
            subscription_data={
                "metadata": {
                    "org_id": org.id,
                    "plan":   plan,
                }
            },
            allow_promotion_codes=True,
        )

        return {"url": session.url, "type": "checkout", "session_id": session.id}

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=402, detail=str(e))


# ── POST /billing/portal ──────────────────────────────────
@router.post("/portal")
def create_portal_session(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a Stripe Customer Portal session.
    Allows users to manage payment methods, cancel, and see invoices.
    """
    if not stripe.api_key:
        raise HTTPException(status_code=503, detail="Billing not configured")

    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org or not org.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No billing account found. Subscribe to a plan first.")

    try:
        portal = stripe.billing_portal.Session.create(
            customer=org.stripe_customer_id,
            return_url=f"{FRONTEND_URL}/billing",
        )
        return {"url": portal.url}

    except stripe.error.StripeError as e:
        raise HTTPException(status_code=402, detail=str(e))


# ── POST /billing/webhook ─────────────────────────────────
@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None, alias="stripe-signature"),
    db: Session = Depends(get_db),
):
    """
    Handle Stripe webhook events.
    Verify signature, then update org plan/status accordingly.

    Events handled:
      checkout.session.completed       → activate subscription
      customer.subscription.updated   → plan change / status change
      customer.subscription.deleted   → downgrade to free
      invoice.payment_failed           → mark past_due
    """
    payload = await request.body()

    if not STRIPE_WEBHOOK_SECRET:
        # Dev mode — skip signature verification
        try:
            event = stripe.Event.construct_from(
                stripe.util.convert_to_stripe_object(
                    stripe.util.json.loads(payload)
                ), stripe.api_key
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    else:
        try:
            event = stripe.Webhook.construct_event(
                payload, stripe_signature, STRIPE_WEBHOOK_SECRET
            )
        except stripe.error.SignatureVerificationError:
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

    # ── Route events ─────────────────────────────────────
    if event.type == "checkout.session.completed":
        _handle_checkout_completed(event.data.object, db)

    elif event.type in ("customer.subscription.created", "customer.subscription.updated"):
        _handle_subscription_updated(event.data.object, db)

    elif event.type == "customer.subscription.deleted":
        _handle_subscription_deleted(event.data.object, db)

    elif event.type == "invoice.payment_failed":
        _handle_payment_failed(event.data.object, db)

    return JSONResponse({"received": True})


# ── Webhook event handlers ────────────────────────────────

def _plan_from_price_id(price_id: str) -> str:
    """Reverse lookup: Stripe price ID → plan name."""
    for plan_name, pid in STRIPE_PRICE_IDS.items():
        if pid == price_id:
            return plan_name
    return "pro"  # fallback


def _handle_checkout_completed(session, db: Session):
    """Checkout session completed → link subscription to org."""
    org_id = session.get("metadata", {}).get("org_id")
    plan   = session.get("metadata", {}).get("plan", "starter")

    if not org_id:
        return

    org = db.query(Organization).filter(Organization.id == org_id).first()
    if not org:
        return

    # Retrieve full subscription for period details
    subscription = stripe.Subscription.retrieve(session.subscription)

    org.stripe_subscription_id     = subscription.id
    org.stripe_subscription_status = subscription.status
    org.stripe_customer_id         = session.customer
    org.plan                        = plan
    org.device_limit                = PLANS.get(plan, PLANS["free"])["device_limit"]
    org.stripe_current_period_end   = datetime.fromtimestamp(subscription.current_period_end)

    db.commit()


def _handle_subscription_updated(subscription, db: Session):
    """Subscription created/updated → sync plan and status."""
    org_id = subscription.get("metadata", {}).get("org_id")

    # Fallback: find org by customer ID
    if not org_id:
        org = db.query(Organization).filter(
            Organization.stripe_customer_id == subscription.customer
        ).first()
    else:
        org = db.query(Organization).filter(Organization.id == org_id).first()

    if not org:
        return

    # Determine plan from first line item's price ID
    plan = "starter"
    if subscription.get("items") and subscription["items"].get("data"):
        price_id = subscription["items"]["data"][0]["price"]["id"]
        plan = _plan_from_price_id(price_id)

    org.stripe_subscription_id     = subscription.id
    org.stripe_subscription_status = subscription.status
    org.plan                        = plan
    org.device_limit                = PLANS.get(plan, PLANS["free"])["device_limit"]

    if subscription.get("current_period_end"):
        org.stripe_current_period_end = datetime.fromtimestamp(subscription.current_period_end)

    db.commit()


def _handle_subscription_deleted(subscription, db: Session):
    """Subscription cancelled → downgrade to free."""
    org = db.query(Organization).filter(
        Organization.stripe_subscription_id == subscription.id
    ).first()

    if not org:
        return

    org.plan                        = "free"
    org.device_limit                = PLANS["free"]["device_limit"]
    org.stripe_subscription_status = "canceled"
    org.stripe_subscription_id     = None

    db.commit()


def _handle_payment_failed(invoice, db: Session):
    """Payment failed → mark subscription as past_due."""
    if not invoice.get("subscription"):
        return

    org = db.query(Organization).filter(
        Organization.stripe_subscription_id == invoice["subscription"]
    ).first()

    if not org:
        return

    org.stripe_subscription_status = "past_due"
    db.commit()
