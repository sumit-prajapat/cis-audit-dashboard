import requests
import os
import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)

def send_slack_notification(webhook_url: str, message: str, severity: str = "info") -> bool:
    """Send an alert to Slack."""
    color_map = {
        "critical": "#ff0000",
        "high": "#ff9900",
        "medium": "#ffff00",
        "low": "#36a64f",
        "info": "#439fe0"
    }
    
    payload = {
        "attachments": [
            {
                "color": color_map.get(severity.lower(), color_map["info"]),
                "text": message
            }
        ]
    }
    
    try:
        response = requests.post(webhook_url, json=payload, timeout=5)
        response.raise_for_status()
        return True
    except Exception as e:
        logger.error(f"Failed to send Slack notification: {str(e)}")
        return False

def send_teams_notification(webhook_url: str, message: str, severity: str = "info") -> bool:
    """Send an alert to Microsoft Teams."""
    color_map = {
        "critical": "FF0000",
        "high": "FF9900",
        "medium": "FFFF00",
        "low": "36A64F",
        "info": "439FE0"
    }
    
    payload = {
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        "themeColor": color_map.get(severity.lower(), color_map["info"]),
        "summary": "CIS Audit Dashboard Alert",
        "sections": [{
            "activityTitle": "Security Alert",
            "text": message
        }]
    }
    
    try:
        response = requests.post(webhook_url, json=payload, timeout=5)
        response.raise_for_status()
        return True
    except Exception as e:
        logger.error(f"Failed to send Teams notification: {str(e)}")
        return False

def notify_scan_completion(device_name: str, score: float, critical_count: int, org_metadata: Dict[str, Any]):
    """
    Check if the org has webhooks configured and send notifications.
    org_metadata could contain 'slack_webhook' or 'teams_webhook'.
    """
    if critical_count > 0:
        message = f"🚨 *CRITICAL ALERT:* Scan completed for `{device_name}`.\nCompliance Score: *{score}%*\nCritical Findings: *{critical_count}*"
        severity = "critical"
    else:
        message = f"✅ Scan completed for `{device_name}`.\nCompliance Score: *{score}%*\nNo critical findings."
        severity = "info"
        
    slack_webhook = org_metadata.get("slack_webhook")
    teams_webhook = org_metadata.get("teams_webhook")
    
    if slack_webhook:
        send_slack_notification(slack_webhook, message, severity)
        
    if teams_webhook:
        send_teams_notification(teams_webhook, message, severity)
