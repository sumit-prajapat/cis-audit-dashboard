"""
organization_service.py - Organization and multi-tenancy business logic
"""
from datetime import datetime
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import and_
from models import Organization, OrgMember, User
import re


class OrganizationService:
    """Handle organization creation, management, and multi-tenancy"""
    
    @staticmethod
    def create_organization(
        db: Session,
        name: str,
        slug: Optional[str] = None,
        owner_id: str = None
    ) -> Organization:
        """Create a new organization"""
        
        # Generate slug if not provided
        if not slug:
            slug = re.sub(r'[^a-z0-9-]', '', name.lower().replace(' ', '-'))
            # Ensure uniqueness
            existing = db.query(Organization).filter(Organization.slug == slug).first()
            if existing:
                slug = f"{slug}-{datetime.utcnow().timestamp()}"
        
        # Check slug uniqueness
        if db.query(Organization).filter(Organization.slug == slug).first():
            raise ValueError("Organization slug already exists")
        
        org = Organization(
            name=name,
            slug=slug,
            plan="free",
            device_limit=1
        )
        
        db.add(org)
        db.flush()
        
        # Add owner as member
        if owner_id:
            member = OrgMember(
                org_id=org.id,
                user_id=owner_id,
                role="owner"
            )
            db.add(member)
            
            # Update user's org_id
            user = db.query(User).filter(User.id == owner_id).first()
            if user:
                user.org_id = org.id
                user.role = "owner"
        
        db.commit()
        db.refresh(org)
        return org
    
    @staticmethod
    def get_org_by_slug(db: Session, slug: str) -> Optional[Organization]:
        """Get organization by slug"""
        return db.query(Organization).filter(Organization.slug == slug).first()
    
    @staticmethod
    def get_org_members(
        db: Session,
        org_id: str,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[Dict], int]:
        """Get organization members"""
        
        query = db.query(OrgMember).filter(OrgMember.org_id == org_id)
        total = query.count()
        members = query.offset(skip).limit(limit).all()
        
        return [
            {
                "id": member.id,
                "user_id": member.user_id,
                "email": member.user.email if member.user else None,
                "full_name": member.user.full_name if member.user else None,
                "role": member.role,
                "created_at": member.created_at
            }
            for member in members
        ], total
    
    @staticmethod
    def add_member_to_org(
        db: Session,
        org_id: str,
        user_id: str,
        role: str = "member"
    ) -> OrgMember:
        """Add a user to an organization"""
        
        # Check membership doesn't exist
        existing = db.query(OrgMember).filter(
            and_(OrgMember.org_id == org_id, OrgMember.user_id == user_id)
        ).first()
        
        if existing:
            return existing
        
        member = OrgMember(
            org_id=org_id,
            user_id=user_id,
            role=role
        )
        
        db.add(member)
        db.commit()
        db.refresh(member)
        return member
    
    @staticmethod
    def update_member_role(
        db: Session,
        org_id: str,
        user_id: str,
        new_role: str
    ) -> OrgMember:
        """Update member role"""
        
        member = db.query(OrgMember).filter(
            and_(OrgMember.org_id == org_id, OrgMember.user_id == user_id)
        ).first()
        
        if not member:
            raise ValueError("Member not found in organization")
        
        member.role = new_role
        db.commit()
        db.refresh(member)
        return member
    
    @staticmethod
    def remove_member_from_org(
        db: Session,
        org_id: str,
        user_id: str
    ) -> bool:
        """Remove a member from organization"""
        
        member = db.query(OrgMember).filter(
            and_(OrgMember.org_id == org_id, OrgMember.user_id == user_id)
        ).first()
        
        if not member:
            return False
        
        db.delete(member)
        db.commit()
        return True
    
    @staticmethod
    def upgrade_org_plan(
        db: Session,
        org_id: str,
        new_plan: str,
        stripe_customer_id: Optional[str] = None,
        stripe_subscription_id: Optional[str] = None
    ) -> Organization:
        """Upgrade organization plan"""
        from models import PLANS
        
        if new_plan not in PLANS:
            raise ValueError(f"Invalid plan: {new_plan}")
        
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            raise ValueError("Organization not found")
        
        org.plan = new_plan
        org.device_limit = PLANS[new_plan]["device_limit"]
        
        if stripe_customer_id:
            org.stripe_customer_id = stripe_customer_id
        if stripe_subscription_id:
            org.stripe_subscription_id = stripe_subscription_id
        
        org.updated_at = datetime.utcnow()
        
        db.commit()
        db.refresh(org)
        return org
    
    @staticmethod
    def user_can_access_org(
        db: Session,
        user_id: str,
        org_id: str
    ) -> bool:
        """Check if user has access to organization"""
        
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return False
        
        if str(user.org_id) == str(org_id):
            return True
        
        # Check OrgMember table
        member = db.query(OrgMember).filter(
            and_(OrgMember.org_id == org_id, OrgMember.user_id == user_id)
        ).first()
        
        return member is not None
