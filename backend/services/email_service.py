"""Email service using Resend API"""
import os
import logging
from typing import Optional
import resend

logger = logging.getLogger(__name__)

# Configure Resend
resend.api_key = os.getenv("RESEND_API_KEY", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "noreply@cisaudit.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


def send_email(to: str, subject: str, html: str) -> bool:
    """Send email via Resend"""
    if not resend.api_key:
        logger.warning(f"Email not sent (no API key): {subject} to {to}")
        logger.info(f"Email content:\n{html}")
        return False
    
    try:
        resend.Emails.send({
            "from": FROM_EMAIL,
            "to": to,
            "subject": subject,
            "html": html
        })
        logger.info(f"Email sent successfully to {to}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to}: {e}")
        return False


def send_password_reset_email(email: str, token: str, user_name: Optional[str] = None) -> bool:
    """Send password reset email"""
    reset_link = f"{FRONTEND_URL}/reset-password?token={token}"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #1a1a2e; color: white; padding: 20px; text-align: center; }}
            .content {{ background: #f4f4f4; padding: 30px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #4f46e5; color: white; 
                       text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛡️ CIS Audit Dashboard</h1>
            </div>
            <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hello{f" {user_name}" if user_name else ""},</p>
                <p>We received a request to reset your password. Click the button below to create a new password:</p>
                <p style="text-align: center;">
                    <a href="{reset_link}" class="button">Reset Password</a>
                </p>
                <p>Or copy this link: <br><code>{reset_link}</code></p>
                <p><strong>This link expires in 1 hour.</strong></p>
                <p>If you didn't request this, please ignore this email.</p>
            </div>
            <div class="footer">
                <p>CIS Audit & Compliance Dashboard</p>
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, "Reset Your Password - CIS Audit Dashboard", html)


def send_verification_email(email: str, token: str, user_name: Optional[str] = None) -> bool:
    """Send email verification"""
    verify_link = f"{FRONTEND_URL}/verify-email?token={token}"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #1a1a2e; color: white; padding: 20px; text-align: center; }}
            .content {{ background: #f4f4f4; padding: 30px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #10b981; color: white; 
                       text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛡️ CIS Audit Dashboard</h1>
            </div>
            <div class="content">
                <h2>Verify Your Email</h2>
                <p>Hello{f" {user_name}" if user_name else ""},</p>
                <p>Thank you for registering! Please verify your email address by clicking the button below:</p>
                <p style="text-align: center;">
                    <a href="{verify_link}" class="button">Verify Email</a>
                </p>
                <p>Or copy this link: <br><code>{verify_link}</code></p>
                <p><strong>This link expires in 24 hours.</strong></p>
            </div>
            <div class="footer">
                <p>CIS Audit & Compliance Dashboard</p>
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, "Verify Your Email - CIS Audit Dashboard", html)


def send_team_invite_email(email: str, token: str, org_name: str, invited_by: str, role: str) -> bool:
    """Send team invitation email"""
    invite_link = f"{FRONTEND_URL}/accept-invite?token={token}"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #1a1a2e; color: white; padding: 20px; text-align: center; }}
            .content {{ background: #f4f4f4; padding: 30px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #6366f1; color: white; 
                       text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .info-box {{ background: white; padding: 15px; border-left: 4px solid #6366f1; margin: 15px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛡️ CIS Audit Dashboard</h1>
            </div>
            <div class="content">
                <h2>You're Invited!</h2>
                <p><strong>{invited_by}</strong> has invited you to join their organization on CIS Audit Dashboard.</p>
                
                <div class="info-box">
                    <strong>Organization:</strong> {org_name}<br>
                    <strong>Your Role:</strong> {role.title()}
                </div>
                
                <p>Click the button below to accept the invitation:</p>
                <p style="text-align: center;">
                    <a href="{invite_link}" class="button">Accept Invitation</a>
                </p>
                <p>Or copy this link: <br><code>{invite_link}</code></p>
                <p><strong>This invitation expires in 7 days.</strong></p>
            </div>
            <div class="footer">
                <p>CIS Audit & Compliance Dashboard</p>
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    return send_email(email, f"Invitation to join {org_name} - CIS Audit Dashboard", html)


def send_scan_alert_email(email: str, device_name: str, score: float, 
                          critical_count: int, org_name: str) -> bool:
    """Send scan completion alert"""
    dashboard_link = f"{FRONTEND_URL}/dashboard"
    
    severity_color = "#ef4444" if critical_count > 0 else "#10b981"
    status_icon = "🚨" if critical_count > 0 else "✅"
    
    html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #1a1a2e; color: white; padding: 20px; text-align: center; }}
            .content {{ background: #f4f4f4; padding: 30px; }}
            .alert-box {{ background: {severity_color}; color: white; padding: 20px; 
                          border-radius: 8px; text-align: center; margin: 20px 0; }}
            .stats {{ background: white; padding: 20px; border-radius: 8px; margin: 15px 0; }}
            .stat {{ display: inline-block; width: 45%; text-align: center; padding: 10px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #4f46e5; color: white; 
                       text-decoration: none; border-radius: 5px; margin: 20px 0; }}
            .footer {{ text-align: center; padding: 20px; color: #666; font-size: 12px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🛡️ CIS Audit Dashboard</h1>
            </div>
            <div class="content">
                <div class="alert-box">
                    <h2>{status_icon} Scan Completed</h2>
                    <h3>{device_name}</h3>
                </div>
                
                <div class="stats">
                    <div class="stat">
                        <h2 style="margin: 0; color: {severity_color};">{score}%</h2>
                        <p style="margin: 5px 0; color: #666;">Compliance Score</p>
                    </div>
                    <div class="stat">
                        <h2 style="margin: 0; color: {severity_color};">{critical_count}</h2>
                        <p style="margin: 5px 0; color: #666;">Critical Issues</p>
                    </div>
                </div>
                
                <p><strong>Organization:</strong> {org_name}</p>
                
                {"<p>⚠️ <strong>Action Required:</strong> This device has critical security issues that need immediate attention.</p>" if critical_count > 0 else "<p>✓ No critical issues found. Device is compliant.</p>"}
                
                <p style="text-align: center;">
                    <a href="{dashboard_link}" class="button">View Dashboard</a>
                </p>
            </div>
            <div class="footer">
                <p>CIS Audit & Compliance Dashboard - {org_name}</p>
                <p>This is an automated email, please do not reply.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    subject = f"🚨 Critical Security Alert - {device_name}" if critical_count > 0 else f"✅ Scan Complete - {device_name}"
    return send_email(email, subject, html)
