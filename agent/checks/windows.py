"""
CIS Benchmark Checks — Windows 11
Each function checks ONE setting and returns a result dict.
We cover the most important Level 1 CIS controls.
"""

import subprocess
import winreg  # built-in — Windows registry access
import ctypes
import sys


# ── Helper ────────────────────────────────────────────────────────────

def result(check_id, title, description, status, severity, actual, expected, remediation):
    """Build a standard result dictionary."""
    return {
        "check_id":       check_id,
        "title":          title,
        "description":    description,
        "status":         status,       # PASS / FAIL / WARN / SKIP
        "severity":       severity,     # critical / high / medium / low
        "actual_value":   str(actual),
        "expected_value": str(expected),
        "remediation":    remediation,
    }


def run_powershell(command):
    """Run a PowerShell command and return the output string."""
    try:
        out = subprocess.check_output(
            ["powershell", "-NoProfile", "-Command", command],
            stderr=subprocess.DEVNULL,
            timeout=10
        )
        return out.decode(errors="ignore").strip()
    except Exception:
        return ""


def get_registry_value(hive, path, name):
    """Read a Windows Registry value. Returns None if not found."""
    try:
        key = winreg.OpenKey(hive, path)
        value, _ = winreg.QueryValueEx(key, name)
        winreg.CloseKey(key)
        return value
    except Exception:
        return None


# ── Account Policy Checks ─────────────────────────────────────────────

def check_password_min_length():
    """CIS 1.1.4 — Minimum password length should be 14+"""
    out = run_powershell("net accounts | Select-String 'Minimum password length'")
    try:
        length = int(out.split()[-1])
        status = "PASS" if length >= 14 else "FAIL"
    except Exception:
        length = "Unknown"
        status = "WARN"

    return result(
        "WIN-ACC-001",
        "Minimum Password Length",
        "Ensures users must create passwords of at least 14 characters.",
        status, "high",
        f"{length} characters", "14 or more characters",
        "Run: net accounts /minpwlen:14"
    )


def check_password_max_age():
    """CIS 1.1.2 — Maximum password age should be 365 days or less"""
    out = run_powershell("net accounts | Select-String 'Maximum password age'")
    try:
        age = out.split()[-1]
        age_int = int(age) if age != "Unlimited" else 9999
        status = "PASS" if age_int <= 365 else "FAIL"
    except Exception:
        age = "Unknown"
        status = "WARN"

    return result(
        "WIN-ACC-002",
        "Maximum Password Age",
        "Passwords should expire within 365 days to limit exposure.",
        status, "medium",
        f"{age} days", "365 days or fewer",
        "Run: net accounts /maxpwage:365"
    )


def check_account_lockout_threshold():
    """CIS 1.2.1 — Account lockout after 5 or fewer invalid attempts"""
    out = run_powershell("net accounts | Select-String 'Lockout threshold'")
    try:
        val = out.split()[-1]
        threshold = int(val) if val != "Never" else 9999
        status = "PASS" if 1 <= threshold <= 5 else "FAIL"
    except Exception:
        threshold = "Unknown"
        status = "WARN"

    return result(
        "WIN-ACC-003",
        "Account Lockout Threshold",
        "Accounts should lock after 5 or fewer failed login attempts.",
        status, "high",
        f"{threshold} attempts", "1–5 attempts",
        "Run: net accounts /lockoutthreshold:5"
    )


def check_account_lockout_duration():
    """CIS 1.2.2 — Lockout duration should be 15+ minutes"""
    out = run_powershell("net accounts | Select-String 'Lockout duration'")
    try:
        duration = int(out.split()[-1])
        status = "PASS" if duration >= 15 else "FAIL"
    except Exception:
        duration = "Unknown"
        status = "WARN"

    return result(
        "WIN-ACC-004",
        "Account Lockout Duration",
        "Locked accounts should remain locked for at least 15 minutes.",
        status, "medium",
        f"{duration} minutes", "15 minutes or more",
        "Run: net accounts /lockoutduration:15"
    )


# ── User Account Checks ───────────────────────────────────────────────

def check_guest_account_disabled():
    """CIS 2.3.1 — Guest account should be disabled"""
    out = run_powershell("Get-LocalUser -Name 'Guest' | Select-Object -ExpandProperty Enabled")
    enabled = out.strip().lower() == "true"
    status = "FAIL" if enabled else "PASS"

    return result(
        "WIN-USR-001",
        "Guest Account Disabled",
        "The built-in Guest account provides unauthenticated access and should be disabled.",
        status, "critical",
        "Enabled" if enabled else "Disabled", "Disabled",
        "Run: Disable-LocalUser -Name 'Guest'"
    )


def check_administrator_renamed():
    """CIS 2.3.2 — Built-in Administrator should be renamed"""
    out = run_powershell("Get-LocalUser | Where-Object {$_.SID -like '*-500'} | Select-Object -ExpandProperty Name")
    name = out.strip()
    status = "FAIL" if name.lower() == "administrator" else "PASS"

    return result(
        "WIN-USR-002",
        "Administrator Account Renamed",
        "The built-in Administrator account (SID *-500) should be renamed to reduce attack surface.",
        status, "medium",
        name, "Any name except 'Administrator'",
        "Rename via: Local Users and Groups → Users → Right-click Administrator → Rename"
    )


# ── Windows Firewall Checks ────────────────────────────────────────────

def check_firewall_domain():
    """CIS 9.1.1 — Windows Firewall should be ON for Domain profile"""
    val = get_registry_value(
        winreg.HKEY_LOCAL_MACHINE,
        r"SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\DomainProfile",
        "EnableFirewall"
    )
    status = "PASS" if val == 1 else "FAIL"
    return result(
        "WIN-FW-001", "Windows Firewall — Domain Profile",
        "Firewall must be enabled for the Domain network profile.",
        status, "critical",
        "Enabled" if val == 1 else "Disabled", "Enabled",
        "Enable via: Windows Defender Firewall → Turn Windows Defender Firewall on"
    )


def check_firewall_private():
    """CIS 9.2.1 — Windows Firewall should be ON for Private profile"""
    val = get_registry_value(
        winreg.HKEY_LOCAL_MACHINE,
        r"SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\StandardProfile",
        "EnableFirewall"
    )
    status = "PASS" if val == 1 else "FAIL"
    return result(
        "WIN-FW-002", "Windows Firewall — Private Profile",
        "Firewall must be enabled for Private network profile.",
        status, "critical",
        "Enabled" if val == 1 else "Disabled", "Enabled",
        "Enable via: Windows Defender Firewall settings"
    )


def check_firewall_public():
    """CIS 9.3.1 — Windows Firewall should be ON for Public profile"""
    val = get_registry_value(
        winreg.HKEY_LOCAL_MACHINE,
        r"SYSTEM\CurrentControlSet\Services\SharedAccess\Parameters\FirewallPolicy\PublicProfile",
        "EnableFirewall"
    )
    status = "PASS" if val == 1 else "FAIL"
    return result(
        "WIN-FW-003", "Windows Firewall — Public Profile",
        "Firewall must be enabled for Public network profile (most important — untrusted networks).",
        status, "critical",
        "Enabled" if val == 1 else "Disabled", "Enabled",
        "Enable via: Windows Defender Firewall settings"
    )


# ── Remote Access Checks ──────────────────────────────────────────────

def check_rdp_nla():
    """CIS 18.9.1 — RDP must require Network Level Authentication"""
    val = get_registry_value(
        winreg.HKEY_LOCAL_MACHINE,
        r"SYSTEM\CurrentControlSet\Control\Terminal Server\WinStations\RDP-Tcp",
        "UserAuthentication"
    )
    status = "PASS" if val == 1 else "FAIL"
    return result(
        "WIN-RDP-001", "RDP Network Level Authentication",
        "RDP connections must use NLA to verify user identity before a full session is established.",
        status, "high",
        "NLA Enabled" if val == 1 else "NLA Disabled", "NLA Enabled",
        "Enable NLA: System Properties → Remote → 'Allow connections only from computers running Remote Desktop with NLA'"
    )


def check_rdp_disabled_if_unused():
    """Check if RDP is enabled — warn if it is (should only be on if needed)"""
    val = get_registry_value(
        winreg.HKEY_LOCAL_MACHINE,
        r"SYSTEM\CurrentControlSet\Control\Terminal Server",
        "fDenyTSConnections"
    )
    # fDenyTSConnections = 1 means RDP is OFF (good if not needed)
    rdp_on = val == 0
    status = "WARN" if rdp_on else "PASS"
    return result(
        "WIN-RDP-002", "RDP Disabled If Unused",
        "Remote Desktop should be disabled if not actively needed.",
        status, "medium",
        "RDP Enabled" if rdp_on else "RDP Disabled",
        "RDP Disabled (or enabled with NLA + firewall rules)",
        "Disable RDP: System Properties → Remote → Uncheck 'Allow remote connections'"
    )


# ── Windows Update / Defender Checks ─────────────────────────────────

def check_windows_update_enabled():
    """CIS — Automatic Updates should be enabled"""
    val = get_registry_value(
        winreg.HKEY_LOCAL_MACHINE,
        r"SOFTWARE\Policies\Microsoft\Windows\WindowsUpdate\AU",
        "NoAutoUpdate"
    )
    # NoAutoUpdate = 0 or missing → updates ON
    status = "FAIL" if val == 1 else "PASS"
    return result(
        "WIN-UPD-001", "Automatic Windows Updates Enabled",
        "Windows Update should be enabled to receive security patches automatically.",
        status, "high",
        "Updates Disabled" if val == 1 else "Updates Enabled", "Updates Enabled",
        "Enable via: Settings → Windows Update → Advanced options → Automatic updates"
    )


def check_defender_realtime():
    """Check Windows Defender real-time protection is ON"""
    val = get_registry_value(
        winreg.HKEY_LOCAL_MACHINE,
        r"SOFTWARE\Microsoft\Windows Defender\Real-Time Protection",
        "DisableRealtimeMonitoring"
    )
    # DisableRealtimeMonitoring = 0 or missing → protection ON
    status = "FAIL" if val == 1 else "PASS"
    return result(
        "WIN-AV-001", "Windows Defender Real-Time Protection",
        "Real-time antivirus protection should always be active.",
        status, "critical",
        "Disabled" if val == 1 else "Enabled", "Enabled",
        "Enable via: Windows Security → Virus & threat protection → Real-time protection"
    )


# ── Audit Policy Checks ───────────────────────────────────────────────

def check_audit_logon_events():
    """CIS — Logon events should be audited"""
    out = run_powershell("auditpol /get /subcategory:'Logon' | Select-String 'Logon'")
    has_audit = "success" in out.lower() or "failure" in out.lower()
    status = "PASS" if has_audit else "FAIL"
    return result(
        "WIN-AUD-001", "Audit Logon Events",
        "Windows should log both successful and failed logon attempts.",
        status, "high",
        out.strip() if out else "No auditing", "Success and Failure",
        "Enable via: Local Security Policy → Audit Policy → Audit logon events"
    )


def check_audit_account_logon():
    """CIS — Account logon events should be audited"""
    out = run_powershell("auditpol /get /subcategory:'Credential Validation' | Select-String 'Credential'")
    has_audit = "success" in out.lower() or "failure" in out.lower()
    status = "PASS" if has_audit else "FAIL"
    return result(
        "WIN-AUD-002", "Audit Account Logon Events",
        "Credential validation events should be logged.",
        status, "high",
        out.strip() if out else "No auditing", "Success and Failure",
        "Enable via: Local Security Policy → Advanced Audit Policy → Account Logon"
    )


# ── Unnecessary Services Checks ───────────────────────────────────────

def check_service_disabled(service_name, check_id, title, description):
    """Generic helper to check if a risky service is disabled."""
    out = run_powershell(f"Get-Service -Name '{service_name}' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty StartType")
    running = "disabled" not in out.lower() if out else False
    status = "WARN" if running else "PASS"
    return result(
        check_id, title, description,
        status, "medium",
        out.strip() if out else "Not found",
        "Disabled",
        f"Disable via: services.msc → find '{service_name}' → Properties → Startup type: Disabled"
    )


# ── Main Entry Point ──────────────────────────────────────────────────

def run_windows_checks():
    """Run all Windows CIS checks and return a list of results."""
    print("  Running Windows 11 CIS Benchmark checks...")

    checks = [
        # Account policy
        check_password_min_length,
        check_password_max_age,
        check_account_lockout_threshold,
        check_account_lockout_duration,
        # User accounts
        check_guest_account_disabled,
        check_administrator_renamed,
        # Firewall
        check_firewall_domain,
        check_firewall_private,
        check_firewall_public,
        # Remote access
        check_rdp_nla,
        check_rdp_disabled_if_unused,
        # Updates & AV
        check_windows_update_enabled,
        check_defender_realtime,
        # Auditing
        check_audit_logon_events,
        check_audit_account_logon,
    ]

    # Unnecessary services
    risky_services = [
        ("Telnet",   "WIN-SVC-001", "Telnet Service Disabled",   "Telnet transmits data in plaintext — must be disabled."),
        ("RemoteRegistry", "WIN-SVC-002", "Remote Registry Disabled", "Remote Registry allows remote editing of the registry."),
        ("SNMP",     "WIN-SVC-003", "SNMP Service Disabled",     "SNMP v1/v2 have known vulnerabilities."),
    ]

    results = []

    for check_fn in checks:
        try:
            res = check_fn()
            icon = "✅" if res["status"] == "PASS" else ("❌" if res["status"] == "FAIL" else "⚠️ ")
            print(f"    {icon} {res['check_id']} — {res['title']}")
            results.append(res)
        except Exception as e:
            print(f"    ⚠️  Check failed with error: {e}")

    for svc_name, cid, title, desc in risky_services:
        try:
            res = check_service_disabled(svc_name, cid, title, desc)
            icon = "✅" if res["status"] == "PASS" else "⚠️ "
            print(f"    {icon} {res['check_id']} — {res['title']}")
            results.append(res)
        except Exception as e:
            print(f"    ⚠️  Service check failed: {e}")

    print(f"\n  ✔ {len(results)} checks completed.")
    return results
