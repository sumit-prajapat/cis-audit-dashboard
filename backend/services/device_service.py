"""
device_service.py - Device and asset management business logic
"""
from datetime import datetime, timedelta
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc, func
from models import Device, Organization
import uuid


class DeviceService:
    """Manage device inventory and lifecycle"""
    
    @staticmethod
    def register_device(
        db: Session,
        org_id: str,
        hostname: str,
        os_type: str,
        os_version: Optional[str] = None,
        ip_address: Optional[str] = None,
        agent_version: Optional[str] = None
    ) -> Device:
        """Register a new device in the organization"""
        
        # Check org exists
        org = db.query(Organization).filter(Organization.id == org_id).first()
        if not org:
            raise ValueError("Organization not found")
        
        # Check device limit
        if org.is_at_device_limit():
            raise ValueError(f"Device limit reached for {org.plan} plan")
        
        # Check for existing device
        existing = db.query(Device).filter(
            and_(Device.org_id == org_id, Device.hostname == hostname)
        ).first()
        
        if existing:
            return existing
        
        device = Device(
            org_id=org_id,
            device_id=str(uuid.uuid4()),
            hostname=hostname,
            os_type=os_type,
            os_version=os_version,
            ip_address=ip_address,
            agent_version=agent_version,
            is_active=True,
            first_seen=datetime.utcnow(),
            last_seen=datetime.utcnow()
        )
        
        db.add(device)
        db.commit()
        db.refresh(device)
        return device
    
    @staticmethod
    def get_org_devices(
        db: Session,
        org_id: str,
        skip: int = 0,
        limit: int = 50,
        filters: Optional[Dict] = None
    ) -> tuple[List[Device], int]:
        """Get all devices in organization with filtering"""
        
        query = db.query(Device).filter(Device.org_id == org_id)
        
        # Apply filters
        if filters:
            if filters.get("is_active") is not None:
                query = query.filter(Device.is_active == filters.get("is_active"))
            
            if filters.get("os_type"):
                query = query.filter(Device.os_type == filters.get("os_type"))
            
            if filters.get("status"):
                if filters.get("status") == "healthy":
                    threshold = datetime.utcnow() - timedelta(hours=24)
                    query = query.filter(Device.last_seen >= threshold)
                elif filters.get("status") == "offline":
                    threshold = datetime.utcnow() - timedelta(hours=24)
                    query = query.filter(Device.last_seen < threshold)
        
        total = query.count()
        devices = query.offset(skip).limit(limit).all()
        
        return devices, total
    
    @staticmethod
    def update_device_heartbeat(
        db: Session,
        device_id: str,
        org_id: str,
        agent_version: Optional[str] = None
    ) -> Device:
        """Update device last seen timestamp (heartbeat)"""
        
        device = db.query(Device).filter(
            and_(Device.device_id == device_id, Device.org_id == org_id)
        ).first()
        
        if not device:
            raise ValueError("Device not found")
        
        device.last_seen = datetime.utcnow()
        if agent_version:
            device.agent_version = agent_version
        
        db.commit()
        db.refresh(device)
        return device
    
    @staticmethod
    def deactivate_device(
        db: Session,
        device_id: str,
        org_id: str
    ) -> Device:
        """Deactivate a device"""
        
        device = db.query(Device).filter(
            and_(Device.id == device_id, Device.org_id == org_id)
        ).first()
        
        if not device:
            raise ValueError("Device not found")
        
        device.is_active = False
        db.commit()
        db.refresh(device)
        return device
    
    @staticmethod
    def get_device_stats(db: Session, org_id: str) -> Dict:
        """Get organization device statistics"""
        
        total_devices = db.query(func.count(Device.id)).filter(
            Device.org_id == org_id
        ).scalar() or 0
        
        active_devices = db.query(func.count(Device.id)).filter(
            and_(Device.org_id == org_id, Device.is_active == True)
        ).scalar() or 0
        
        # Count OS types
        os_breakdown = db.query(
            Device.os_type,
            func.count(Device.id).label("count")
        ).filter(Device.org_id == org_id).group_by(Device.os_type).all()
        
        # Count online/offline
        threshold = datetime.utcnow() - timedelta(hours=24)
        online_devices = db.query(func.count(Device.id)).filter(
            and_(
                Device.org_id == org_id,
                Device.is_active == True,
                Device.last_seen >= threshold
            )
        ).scalar() or 0
        
        offline_devices = active_devices - online_devices
        
        return {
            "total_devices": total_devices,
            "active_devices": active_devices,
            "inactive_devices": total_devices - active_devices,
            "online_devices": online_devices,
            "offline_devices": offline_devices,
            "os_breakdown": [
                {"os_type": os_type, "count": count}
                for os_type, count in os_breakdown
            ]
        }
    
    @staticmethod
    def search_devices(
        db: Session,
        org_id: str,
        search_term: str,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[Device], int]:
        """Search devices by hostname or IP"""
        from sqlalchemy import or_
        
        query = db.query(Device).filter(
            and_(
                Device.org_id == org_id,
                or_(
                    Device.hostname.ilike(f"%{search_term}%"),
                    Device.ip_address.ilike(f"%{search_term}%")
                )
            )
        )
        
        total = query.count()
        devices = query.offset(skip).limit(limit).all()
        
        return devices, total
