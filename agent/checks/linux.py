"""
CIS Benchmark Checks — Linux (Ubuntu / Kali)
Each function checks ONE setting and returns a result dict.
Covers the most important Level 1 CIS controls for Linux.
"""

import subprocess
import os
import re


# ── Helper ────────────────────────────────────────────────────────────

def result(check_id, title, description, status, severity, actual, expected, remediation):
    """Build a standard result dictionary."""
    return {
        "check_id":       check_id,
        "title":          title,
        "description":    description,
        "status":         status,
        "severity":       severity,
        "actual_value":   str(actual),
        "expected_value": str(expected),
        "remediation":    remediation,
    }


def run_cmd(command):
    """Run a shell command and return output. Returns '' on failure."""
    try:
        out = subprocess.check_output(
            command, shell=True, stderr=subprocess.DEVNULL, timeout=10
        )
        return out.decode(errors="ignore").strip()
    except Exception:
        return ""


def file_contains(filepath, pattern):
    """Check if a file contains a line matching a regex pattern."""
    try:
        with open(filepath, "r") as f:
            for line in f:
                line = line.strip()
                if line.startswith("#"):
                    continue
                if re.search(pattern, line):
                    return True
    except Exception:
        pass
    return False


def get_file_value(filepath, key):
    """Get the value of a key=value pair from a config file."""
    try:
        with open(filepath, "r") as f:
            for line in f:
                line = line.strip()
                if line.startswith("#"):
                    continue
                if line.startswith(key):
                    parts = line.split()
                    return parts[-1] if parts else ""
    except Exception:
        pass
    return None


# ── SSH Configuration Checks ──────────────────────────────────────────

def check_ssh_root_login():
    """CIS 5.2.8 — SSH must not allow root login"""
    val = get_file_value("/etc/ssh/sshd_config", "PermitRootLogin")
    status = "PASS" if val in ("no", "without-password", "prohibit-password") else "FAIL"
    return result(
        "LNX-SSH-001", "SSH Root Login Disabled",
        "Allowing SSH root login is dangerous — attackers can directly brute-force root.",
        status, "critical",
        val or "Not set (default: may allow root)", "no",
        "Edit /etc/ssh/sshd_config: set 'PermitRootLogin no', then run: sudo systemctl restart sshd"
    )


def check_ssh_max_auth_tries():
    """CIS 5.2.7 — SSH MaxAuthTries should be 4 or less"""
    val = get_file_value("/etc/ssh/sshd_config", "MaxAuthTries")
    try:
        num = int(val)
        status = "PASS" if num <= 4 else "FAIL"
    except Exception:
        num = "Not set"
        status = "WARN"
    return result(
        "LNX-SSH-002", "SSH MaxAuthTries",
        "Limiting SSH authentication attempts reduces brute-force risk.",
        status, "high",
        val or "Not set (default: 6)", "4 or fewer",
        "Edit /etc/ssh/sshd_config: set 'MaxAuthTries 4', then: sudo systemctl restart sshd"
    )


def check_ssh_empty_passwords():
    """CIS 5.2.9 — SSH must not allow empty passwords"""
    val = get_file_value("/etc/ssh/sshd_config", "PermitEmptyPasswords")
    status = "PASS" if val == "no" or val is None else "FAIL"
    return result(
        "LNX-SSH-003", "SSH Empty Passwords Disabled",
        "Accounts with empty passwords must not be allowed SSH access.",
        status, "critical",
        val or "Not set (default: no)", "no",
        "Edit /etc/ssh/sshd_config: set 'PermitEmptyPasswords no'"
    )


def check_ssh_protocol():
    """SSH must use Protocol 2 only (Protocol 1 is broken)"""
    val = get_file_value("/etc/ssh/sshd_config", "Protocol")
    # Modern OpenSSH defaults to 2 — if not set explicitly that's fine
    status = "PASS" if val in ("2", None) else "FAIL"
    return result(
        "LNX-SSH-004", "SSH Protocol Version 2",
        "SSH Protocol 1 has critical vulnerabilities and must not be used.",
        status, "critical",
        val or "Not set (default: 2)", "2",
        "Edit /etc/ssh/sshd_config: set 'Protocol 2'"
    )


def check_ssh_idle_timeout():
    """CIS 5.2.13 — SSH sessions should time out after inactivity"""
    val = get_file_value("/etc/ssh/sshd_config", "ClientAliveInterval")
    try:
        num = int(val)
        status = "PASS" if 1 <= num <= 300 else "FAIL"
    except Exception:
        num = "Not set"
        status = "WARN"
    return result(
        "LNX-SSH-005", "SSH Idle Timeout",
        "Idle SSH sessions should be terminated after 300 seconds (5 minutes).",
        status, "medium",
        f"{val} seconds" if val else "Not set", "300 seconds or less",
        "Edit /etc/ssh/sshd_config: set 'ClientAliveInterval 300' and 'ClientAliveCountMax 0'"
    )


# ── Firewall Checks ───────────────────────────────────────────────────

def check_ufw_active():
    """CIS 3.5.1 — UFW firewall should be active"""
    out = run_cmd("ufw status 2>/dev/null || iptables -L 2>/dev/null | head -1")
    active = "active" in out.lower() or "chain" in out.lower()
    status = "PASS" if active else "FAIL"
    return result(
        "LNX-FW-001", "Firewall Active (UFW/iptables)",
        "A firewall must be active to filter network traffic.",
        status, "critical",
        "Active" if active else "Inactive / Not configured", "Active",
        "Enable UFW: sudo ufw enable  |  Or configure iptables rules"
    )


def check_ufw_default_deny():
    """UFW default policy should deny incoming traffic"""
    out = run_cmd("ufw status verbose 2>/dev/null")
    has_deny = "deny (incoming)" in out.lower() or "deny" in out.lower()
    status = "PASS" if has_deny else "WARN"
    return result(
        "LNX-FW-002", "UFW Default Deny Incoming",
        "Default incoming policy should be DENY — only explicitly allowed ports should be open.",
        status, "high",
        "Deny" if has_deny else "Allow or Not set", "deny (incoming)",
        "Run: sudo ufw default deny incoming && sudo ufw default allow outgoing"
    )


# ── Password Policy Checks ─────────────────────────────────────────────

def check_password_max_age():
    """CIS 5.4.1.1 — Password max age should be 365 days or less"""
    val = get_file_value("/etc/login.defs", "PASS_MAX_DAYS")
    try:
        days = int(val)
        status = "PASS" if days <= 365 else "FAIL"
    except Exception:
        days = "Not set"
        status = "WARN"
    return result(
        "LNX-PWD-001", "Maximum Password Age",
        "Passwords should expire within 365 days.",
        status, "medium",
        f"{val} days" if val else "Not set", "365 days or fewer",
        "Edit /etc/login.defs: set 'PASS_MAX_DAYS 365'"
    )


def check_password_min_length():
    """CIS 5.4.1 — Password minimum length"""
    val = get_file_value("/etc/login.defs", "PASS_MIN_LEN")
    try:
        length = int(val)
        status = "PASS" if length >= 14 else "FAIL"
    except Exception:
        length = "Not set"
        status = "WARN"
    return result(
        "LNX-PWD-002", "Minimum Password Length",
        "Passwords must be at least 14 characters.",
        status, "high",
        f"{val} characters" if val else "Not set", "14 characters",
        "Edit /etc/login.defs: set 'PASS_MIN_LEN 14'  |  Also configure libpam-pwquality"
    )


def check_password_min_days():
    """CIS 5.4.1.2 — Minimum days between password changes"""
    val = get_file_value("/etc/login.defs", "PASS_MIN_DAYS")
    try:
        days = int(val)
        status = "PASS" if days >= 1 else "FAIL"
    except Exception:
        days = "Not set"
        status = "WARN"
    return result(
        "LNX-PWD-003", "Minimum Password Age",
        "Users should not be able to change their password more than once per day.",
        status, "low",
        f"{val} days" if val else "Not set", "1 day or more",
        "Edit /etc/login.defs: set 'PASS_MIN_DAYS 1'"
    )


# ── System Checks ─────────────────────────────────────────────────────

def check_grub_password():
    """CIS 1.4.2 — GRUB bootloader should be password protected"""
    has_pw = (
        file_contains("/etc/grub.d/40_custom", "password_pbkdf2") or
        file_contains("/boot/grub/grub.cfg", "password_pbkdf2") or
        os.path.exists("/etc/grub.d/01_password")
    )
    status = "PASS" if has_pw else "WARN"
    return result(
        "LNX-SYS-001", "GRUB Bootloader Password",
        "GRUB should require a password to prevent unauthorized boot parameter changes.",
        status, "high",
        "Password set" if has_pw else "No password found", "Password set",
        "Run: grub-mkpasswd-pbkdf2 → add result to /etc/grub.d/40_custom → update-grub"
    )


def check_selinux_or_apparmor():
    """CIS 1.6 — SELinux or AppArmor should be active"""
    apparmor = run_cmd("apparmor_status 2>/dev/null | head -1")
    selinux   = run_cmd("sestatus 2>/dev/null | head -1")
    active = "profiles are loaded" in apparmor.lower() or "enabled" in selinux.lower()
    status = "PASS" if active else "WARN"
    return result(
        "LNX-SYS-002", "AppArmor / SELinux Active",
        "Mandatory Access Control (AppArmor or SELinux) adds an extra layer of process isolation.",
        status, "high",
        apparmor.split("\n")[0] if apparmor else selinux or "Not active",
        "AppArmor or SELinux enabled and enforcing",
        "Enable AppArmor: sudo systemctl enable apparmor && sudo systemctl start apparmor"
    )


def check_core_dumps_disabled():
    """CIS 1.5.1 — Core dumps should be restricted"""
    val = run_cmd("ulimit -c")
    status = "PASS" if val == "0" else "WARN"
    return result(
        "LNX-SYS-003", "Core Dumps Restricted",
        "Core dumps can expose sensitive data from memory. They should be disabled for regular users.",
        status, "medium",
        f"ulimit -c = {val}", "0 (disabled)",
        "Add to /etc/security/limits.conf: '* hard core 0'  |  Add to /etc/sysctl.conf: 'fs.suid_dumpable = 0'"
    )


def check_world_writable_files():
    """Check for world-writable files in common dirs (security risk)"""
    out = run_cmd("find /etc /usr /bin /sbin -xdev -type f -perm -0002 2>/dev/null | head -10")
    count = len(out.splitlines()) if out else 0
    status = "PASS" if count == 0 else "WARN"
    return result(
        "LNX-SYS-004", "No World-Writable Files in System Dirs",
        "World-writable files in system directories can be modified by any user.",
        status, "high",
        f"{count} world-writable files found" if count > 0 else "None found",
        "0 world-writable files",
        "Fix permissions: chmod o-w <filename>  |  Review each file found"
    )


def check_cron_permissions():
    """CIS 5.1.2 — /etc/crontab should only be accessible by root"""
    out = run_cmd("stat -c '%a %U %G' /etc/crontab 2>/dev/null")
    parts = out.split() if out else []
    if len(parts) == 3:
        perms, owner, group = parts
        status = "PASS" if perms in ("600", "400") and owner == "root" else "FAIL"
    else:
        perms = "Unknown"
        status = "WARN"
    return result(
        "LNX-CRON-001", "/etc/crontab Permissions",
        "/etc/crontab should only be readable/writable by root (600 or 400).",
        status, "medium",
        out or "Could not read", "600 root root",
        "Run: sudo chmod 600 /etc/crontab && sudo chown root:root /etc/crontab"
    )


# ── Unnecessary Services ──────────────────────────────────────────────

def check_service_inactive(service, check_id, title, description):
    """Generic check — a risky service should NOT be running."""
    out = run_cmd(f"systemctl is-active {service} 2>/dev/null")
    running = out.strip() == "active"
    status = "WARN" if running else "PASS"
    return result(
        check_id, title, description,
        status, "medium",
        "Running" if running else "Not running / Not installed",
        "Inactive or not installed",
        f"Disable: sudo systemctl disable --now {service}"
    )


# ── Main Entry Point ──────────────────────────────────────────────────

def run_linux_checks():
    """Run all Linux CIS checks and return a list of results."""
    print("  Running Linux CIS Benchmark checks...")

    checks = [
        # SSH
        check_ssh_root_login,
        check_ssh_max_auth_tries,
        check_ssh_empty_passwords,
        check_ssh_protocol,
        check_ssh_idle_timeout,
        # Firewall
        check_ufw_active,
        check_ufw_default_deny,
        # Passwords
        check_password_max_age,
        check_password_min_length,
        check_password_min_days,
        # System
        check_grub_password,
        check_selinux_or_apparmor,
        check_core_dumps_disabled,
        check_world_writable_files,
        check_cron_permissions,
    ]

    risky_services = [
        ("telnet",  "LNX-SVC-001", "Telnet Disabled",  "Telnet sends data in plaintext — replace with SSH."),
        ("rsh",     "LNX-SVC-002", "RSH Disabled",     "RSH (remote shell) is insecure — use SSH instead."),
        ("vsftpd",  "LNX-SVC-003", "FTP Disabled",     "FTP transmits credentials in plaintext — use SFTP."),
        ("nfs",     "LNX-SVC-004", "NFS Disabled",     "NFS should be disabled if not explicitly needed."),
    ]

    results = []

    for check_fn in checks:
        try:
            res = check_fn()
            icon = "✅" if res["status"] == "PASS" else ("❌" if res["status"] == "FAIL" else "⚠️ ")
            print(f"    {icon} {res['check_id']} — {res['title']}")
            results.append(res)
        except Exception as e:
            print(f"    ⚠️  Check failed: {e}")

    for svc_name, cid, title, desc in risky_services:
        try:
            res = check_service_inactive(svc_name, cid, title, desc)
            icon = "✅" if res["status"] == "PASS" else "⚠️ "
            print(f"    {icon} {res['check_id']} — {res['title']}")
            results.append(res)
        except Exception as e:
            print(f"    ⚠️  Service check failed: {e}")

    print(f"\n  ✔ {len(results)} checks completed.")
    return results
