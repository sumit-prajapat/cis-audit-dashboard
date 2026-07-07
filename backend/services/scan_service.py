"""
scan_service.py - CIS scan business logic and operations
"""
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from models import Device, Scan, ScanCheck, Organization
import json


class ScanService:
    """Handle scan operations, scoring, and analytics"""
    
    @staticmethod
    def create_scan(
        db: Session,
        device_id: str,
        org_id: str,
        checks: List[dict]
    ) -> Scan:
        """Create a new scan with check results"""
        
        device = db.query(Device).filter(Device.id == device_id, Device.org_id == org_id).first()
        if not device:
            raise ValueError("Device not found or access denied")
        
        # Create scan record
        scan = Scan(
            device_id=device_id,
            scan_timestamp=datetime.utcnow(),
            total_checks=len(checks),
            passed_checks=0,
            failed_checks=0,
            warned_checks=0,
            compliance_score=0
        )
        db.add(scan)
        db.flush()
        
        # Create check results
        passed = failed = warned = 0
        for check_data in checks:
            check = ScanCheck(
                scan_id=scan.id,
                check_id=check_data.get("check_id"),
                title=check_data.get("title"),
                description=check_data.get("description"),
                status=check_data.get("status", "SKIP"),
                severity=check_data.get("severity", "info"),
                actual_value=check_data.get("actual_value"),
                expected_value=check_data.get("expected_value"),
                remediation=check_data.get("remediation")
            )
            db.add(check)
            
            # Count results
            if check.status == "PASS":
                passed += 1
            elif check.status == "FAIL":
                failed += 1
            elif check.status == "WARN":
                warned += 1
        
        # Update scan summary
        scan.passed_checks = passed
        scan.failed_checks = failed
        scan.warned_checks = warned
        
        # Calculate compliance score: (passed + warned/2) / total * 100
        if len(checks) > 0:
            score = ((passed + (warned * 0.5)) / len(checks)) * 100
            scan.compliance_score = round(score, 2)
        
        # Update device last_scan info
        device.last_scan_timestamp = datetime.utcnow()
        device.compliance_score = scan.compliance_score
        device.last_scan_status = "completed"
        
        db.commit()
        db.refresh(scan)
        return scan
    
    @staticmethod
    def get_device_scans(
        db: Session,
        device_id: str,
        org_id: str,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[Scan], int]:
        """Get scan history for a device"""
        query = db.query(Scan).filter(
            and_(Scan.device_id == device_id)
        ).order_by(desc(Scan.scan_timestamp))
        
        total = query.count()
        scans = query.offset(skip).limit(limit).all()
        
        return scans, total
    
    @staticmethod
    def get_scan_details(db: Session, scan_id: str, org_id: str) -> Optional[dict]:
        """Get full scan details with all checks"""
        scan = db.query(Scan).filter(Scan.id == scan_id).first()
        if not scan:
            return None
        
        # Verify org access
        device = db.query(Device).filter(Device.id == scan.device_id).first()
        if not device or str(device.org_id) != str(org_id):
            return None
        
        checks = db.query(ScanCheck).filter(ScanCheck.scan_id == scan_id).all()
        
        return {
            "id": scan.id,
            "device_id": scan.device_id,
            "scan_timestamp": scan.scan_timestamp,
            "compliance_score": scan.compliance_score,
            "total_checks": scan.total_checks,
            "passed_checks": scan.passed_checks,
            "failed_checks": scan.failed_checks,
            "warned_checks": scan.warned_checks,
            "checks": [
                {
                    "id": check.id,
                    "check_id": check.check_id,
                    "title": check.title,
                    "status": check.status,
                    "severity": check.severity,
                    "description": check.description,
                    "remediation": check.remediation
                }
                for check in checks
            ]
        }
    
    @staticmethod
    def calculate_org_compliance(db: Session, org_id: str) -> dict:
        """Calculate organization-wide compliance metrics"""
        
        # Get all devices in org with latest scan
        devices = db.query(Device).filter(
            and_(Device.org_id == org_id, Device.is_active == True)
        ).all()
        
        if not devices:
            return {
                "org_compliance_score": 0,
                "device_count": 0,
                "avg_compliance": 0,
                "passed_checks": 0,
                "failed_checks": 0,
                "warned_checks": 0
            }
        
        total_compliance = 0
        total_passed = 0
        total_failed = 0
        total_warned = 0
        
        for device in devices:
            latest_scan = db.query(Scan).filter(
                Scan.device_id == device.id
            ).order_by(desc(Scan.scan_timestamp)).first()
            
            if latest_scan:
                total_compliance += latest_scan.compliance_score
                total_passed += latest_scan.passed_checks
                total_failed += latest_scan.failed_checks
                total_warned += latest_scan.warned_checks
        
        avg_compliance = total_compliance / len(devices) if devices else 0
        
        return {
            "org_compliance_score": round(avg_compliance, 2),
            "device_count": len(devices),
            "avg_compliance": round(avg_compliance, 2),
            "passed_checks": total_passed,
            "failed_checks": total_failed,
            "warned_checks": total_warned
        }
    
    @staticmethod
    def get_compliance_trend(
        db: Session,
        device_id: str,
        org_id: str,
        days: int = 30
    ) -> List[dict]:
        """Get compliance score trend over time"""
        from datetime import timedelta
        
        start_date = datetime.utcnow() - timedelta(days=days)
        
        scans = db.query(Scan).filter(
            and_(
                Scan.device_id == device_id,
                Scan.scan_timestamp >= start_date
            )
        ).order_by(Scan.scan_timestamp).all()
        
        return [
            {
                "date": scan.scan_timestamp.isoformat(),
                "compliance_score": scan.compliance_score,
                "passed": scan.passed_checks,
                "failed": scan.failed_checks,
                "warned": scan.warned_checks
            }
            for scan in scans
        ]
