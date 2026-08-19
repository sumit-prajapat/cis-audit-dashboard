"""
routes/orgs.py — Organization and team management
Endpoints:
  GET  /orgs/me               → current org details + member list
  PUT  /orgs/me               → update org name
  POST /orgs/invite           → invite user by email
  GET  /orgs/invite/:token    → get invite info (public, no auth)
  POST /orgs/invite/:token/accept → accept invite (creates user if needed)
  DELETE /orgs/members/:user_id → remove member from org
  PUT  /orgs/members/:user_id/role → change member role
"""
import os
import secrets
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks, Response
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from database import get_db
from models import Organization, User, OrgMember, OrgInvite, Device
from routes.auth import get_current_user, get_password_hash, _normalize_role
from services.auth_service import AuthService

router = APIRouter()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
INVITE_TTL_HOURS = 72  # invites expire after 72 hours


# ── Schemas ───────────────────────────────────────────────
class UpdateOrgRequest(BaseModel):
    name: str

class InviteRequest(BaseModel):
    email: EmailStr
    role: str = "read_only"   # read_only | auditor | admin

class ChangeRoleRequest(BaseModel):
    role: str


def normalize_role(role: str) -> str:
    return _normalize_role(role)


# ── GET /orgs/me ──────────────────────────────────────────
@router.get("/me")
def get_my_org(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return org details, members, invite links, and device/plan info."""
    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Members with user details
    members = []
    for m in org.members:
        user = db.query(User).filter(User.id == m.user_id).first()
        if user:
            members.append({
                "user_id":    m.user_id,
                "email":      user.email,
                "full_name":  user.full_name,
                "role":       m.role,
                "joined_at":  m.created_at.isoformat(),
                "is_current": m.user_id == current_user.id,
            })

    # Pending invites
    pending_invites = []
    now = datetime.utcnow()
    for inv in org.invites:
        if not inv.accepted and inv.expires_at > now:
            pending_invites.append({
                "id":         inv.id,
                "email":      inv.email,
                "role":       inv.role,
                "expires_at": inv.expires_at.isoformat(),
                "invite_url": f"{FRONTEND_URL}/invite/{inv.token}",
            })

    device_count = db.query(Device).filter(
        Device.org_id == org.id, Device.is_active == True
    ).count()

    return {
        "id":           org.id,
        "name":         org.name,
        "slug":         org.slug,
        "plan":         org.plan,
        "plan_label":   org.get_plan_label(),
        "device_limit": org.device_limit,
        "device_count": device_count,
        "created_at":   org.created_at.isoformat(),
        "members":      members,
        "pending_invites": pending_invites,
    }


# ── PUT /orgs/me ──────────────────────────────────────────
@router.put("/me")
def update_org(
    body: UpdateOrgRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update org name. Only owners/admins can do this."""
    if current_user.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only owners and admins can update org settings")

    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.name = body.name.strip()
    db.commit()
    db.refresh(org)
    return {"message": "Organization updated", "name": org.name}


# ── POST /orgs/invite ─────────────────────────────────────
@router.post("/invite")
def invite_member(
    body: InviteRequest,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Send an invite to a new team member.
    Creates a secure invite token, stores it, and sends email via background task.
    On free plan, no invites allowed (only 1 user).
    """
    if current_user.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only owners and admins can invite members")

    org = db.query(Organization).filter(Organization.id == current_user.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Free plan: no team members
    if org.plan == "free":
        raise HTTPException(
            status_code=402,
            detail="Upgrade to a paid plan to invite team members"
        )

    # Validate role
    role = normalize_role(body.role)
    if role not in ("admin", "auditor", "read_only"):
        raise HTTPException(status_code=400, detail="Role must be 'admin', 'auditor', or 'read_only'")

    # Check if user already a member
    existing_user = db.query(User).filter(User.email == body.email).first()
    if existing_user:
        existing_member = db.query(OrgMember).filter(
            OrgMember.org_id == org.id,
            OrgMember.user_id == existing_user.id
        ).first()
        if existing_member:
            raise HTTPException(status_code=400, detail="User is already a member of this organization")

    # Check for existing pending invite
    existing_invite = db.query(OrgInvite).filter(
        OrgInvite.org_id == org.id,
        OrgInvite.email == body.email,
        OrgInvite.accepted == False,
        OrgInvite.expires_at > datetime.utcnow()
    ).first()
    if existing_invite:
        raise HTTPException(status_code=400, detail="Invite already pending for this email")

    # Create invite
    token = secrets.token_urlsafe(32)
    invite = OrgInvite(
        org_id     = org.id,
        email      = body.email,
        role       = role,
        token      = token,
        invited_by = current_user.id,
        expires_at = datetime.utcnow() + timedelta(hours=INVITE_TTL_HOURS),
    )
    db.add(invite)
    db.commit()

    invite_url = f"{FRONTEND_URL}/invite/{token}"

    # Background task: send email (implement send_invite_email separately)
    background_tasks.add_task(_send_invite_email, body.email, org.name, invite_url, current_user.email)

    return {
        "message":    f"Invite sent to {body.email}",
        "invite_url": invite_url,
        "expires_at": invite.expires_at.isoformat(),
    }


# ── GET /orgs/invite/:token (public) ─────────────────────
@router.get("/invite/{token}")
def get_invite_info(token: str, db: Session = Depends(get_db)):
    """Get invite details from token. Public endpoint — no auth required."""
    invite = db.query(OrgInvite).filter(OrgInvite.token == token).first()

    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found or expired")

    if invite.accepted:
        raise HTTPException(status_code=400, detail="This invite has already been used")

    if invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Invite has expired")

    org = db.query(Organization).filter(Organization.id == invite.org_id).first()

    return {
        "org_name":  org.name if org else "Unknown",
        "email":     invite.email,
        "role":      invite.role,
        "expires_at": invite.expires_at.isoformat(),
        "token":     token,
    }


# ── POST /orgs/invite/:token/accept ──────────────────────
class AcceptInviteRequest(BaseModel):
    full_name: str
    password: str


@router.post("/invite/{token}/accept")
def accept_invite(
    token: str,
    body: AcceptInviteRequest,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Accept an invite and join the org.
    If user with that email already exists, they're added to the org.
    If not, a new user is created with the provided password.
    Returns a JWT token so they're immediately logged in.
    """
    invite = db.query(OrgInvite).filter(OrgInvite.token == token).first()

    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
    if invite.accepted:
        raise HTTPException(status_code=400, detail="Invite already used")
    if invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Invite expired")

    org = db.query(Organization).filter(Organization.id == invite.org_id).first()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    # Get or create user
    user = db.query(User).filter(User.email == invite.email).first()
    if not user:
        user = User(
            email           = invite.email,
            hashed_password = get_password_hash(body.password),
            full_name       = body.full_name,
            org_id          = org.id,
            role            = normalize_role(invite.role),
            password_changed_at = datetime.utcnow(),
        )
        db.add(user)
        db.flush()
    else:
        # Update existing user's org context
        user.org_id = org.id
        user.role   = normalize_role(invite.role)

    # Create OrgMember record
    member = OrgMember(
        org_id     = org.id,
        user_id    = user.id,
        role       = invite.role,
        invited_by = invite.invited_by,
    )
    db.add(member)

    # Mark invite as accepted
    invite.accepted = True

    session, access_token, refresh_token, csrf_token = AuthService.create_auth_session(
        db,
        user,
        remember_me=False,
        user_agent=None,
        ip_address=None,
    )

    db.commit()

    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite=os.getenv("COOKIE_SAMESITE", "lax"), secure=os.getenv("COOKIE_SECURE", "false").lower() in {"1", "true", "yes"}, path="/auth")
    response.set_cookie("csrf_token", csrf_token, httponly=False, samesite=os.getenv("COOKIE_SAMESITE", "lax"), secure=os.getenv("COOKIE_SECURE", "false").lower() in {"1", "true", "yes"}, path="/")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type":   "bearer",
        "org_name":     org.name,
        "role":         normalize_role(user.role),
        "session_id":    session.session_id,
        "csrf_token":    csrf_token,
    }


# ── DELETE /orgs/members/:user_id ────────────────────────
@router.delete("/members/{user_id}")
def remove_member(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Remove a member from the org. Owners cannot be removed."""
    if current_user.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only owners and admins can remove members")

    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot remove yourself")

    member = db.query(OrgMember).filter(
        OrgMember.org_id  == current_user.org_id,
        OrgMember.user_id == user_id,
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if member.role == "owner":
        raise HTTPException(status_code=403, detail="Cannot remove the org owner")

    db.delete(member)

    # Clear org_id from user
    user = db.query(User).filter(User.id == user_id).first()
    if user and user.org_id == current_user.org_id:
        user.org_id = None
        user.role   = None

    db.commit()
    return {"message": "Member removed"}


# ── PUT /orgs/members/:user_id/role ──────────────────────
@router.put("/members/{user_id}/role")
def change_member_role(
    user_id: str,
    body: ChangeRoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Change a member's role. Only owners can make admins."""
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Only owners can change member roles")

    role = normalize_role(body.role)
    if role not in ("admin", "auditor", "read_only"):
        raise HTTPException(status_code=400, detail="Role must be 'admin', 'auditor', or 'read_only'")

    member = db.query(OrgMember).filter(
        OrgMember.org_id  == current_user.org_id,
        OrgMember.user_id == user_id,
    ).first()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if member.role == "owner":
        raise HTTPException(status_code=403, detail="Cannot change the owner's role")

    member.role = role

    # Sync role to user record
    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.role = role

    db.commit()
    return {"message": f"Role updated to {role}"}


# ── DELETE /orgs/invite/:invite_id ───────────────────────
@router.delete("/invite/{invite_id}")
def revoke_invite(
    invite_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke a pending invite."""
    if current_user.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Only owners and admins can revoke invites")

    invite = db.query(OrgInvite).filter(
        OrgInvite.id     == invite_id,
        OrgInvite.org_id == current_user.org_id,
    ).first()

    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")

    db.delete(invite)
    db.commit()
    return {"message": "Invite revoked"}


# ── Background tasks ──────────────────────────────────────
def _send_invite_email(to_email: str, org_name: str, invite_url: str, from_email: str):
    """Send invite email via Resend"""
    from services.email_service import send_team_invite_email
    
    # Extract token from URL
    token = invite_url.split("/")[-1]
    send_team_invite_email(
        email=to_email,
        token=token,
        org_name=org_name,
        invited_by=from_email,
        role="team member"
    )
