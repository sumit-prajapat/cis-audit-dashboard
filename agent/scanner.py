"""
CIS Audit Agent — scanner.py
Entry point. Detects the OS, runs the right checks, and sends results to the API.
Run this script on any machine you want to audit.
"""

import platform
import socket
import json
from datetime import datetime
from checks.windows import run_windows_checks
from checks.linux import run_linux_checks
from reporter import send_results


def get_device_info():
    """Collect basic info about the machine being scanned."""
    return {
        "hostname": socket.gethostname(),
        "os_type": "windows" if platform.system() == "Windows" else "linux",
        "os_version": platform.version(),
        "ip_address": socket.gethostbyname(socket.gethostname()),
    }


def calculate_score(results):
    """Calculate overall compliance score as a percentage."""
    total = len(results)
    if total == 0:
        return 0.0
    passed = sum(1 for r in results if r["status"] == "PASS")
    return round((passed / total) * 100, 2)


def print_summary(results, score):
    """Print a nice summary table to the terminal."""
    passed  = sum(1 for r in results if r["status"] == "PASS")
    failed  = sum(1 for r in results if r["status"] == "FAIL")
    warned  = sum(1 for r in results if r["status"] == "WARN")

    print("\n" + "=" * 60)
    print("         CIS BENCHMARK AUDIT RESULTS")
    print("=" * 60)
    print(f"  Total Checks : {len(results)}")
    print(f"  ✅ Passed    : {passed}")
    print(f"  ❌ Failed    : {failed}")
    print(f"  ⚠️  Warnings  : {warned}")
    print(f"  📊 Score     : {score}%")
    print("=" * 60)

    print("\n  FAILED / WARNING CHECKS:")
    print("-" * 60)
    for r in results:
        if r["status"] in ("FAIL", "WARN"):
            icon = "❌" if r["status"] == "FAIL" else "⚠️ "
            print(f"  {icon} [{r['severity'].upper()}] {r['title']}")
            print(f"       Expected : {r['expected_value']}")
            print(f"       Found    : {r['actual_value']}")
            print()


def main():
    print("\n🛡️  CIS Audit Agent Starting...")
    print(f"   Time     : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    # Step 1 — Get device info
    device = get_device_info()
    print(f"   Hostname : {device['hostname']}")
    print(f"   OS       : {device['os_type']} — {device['os_version']}")
    print(f"   IP       : {device['ip_address']}")
    print("\n🔍 Running CIS checks...\n")

    # Step 2 — Run the right checks based on OS
    if device["os_type"] == "windows":
        results = run_windows_checks()
    else:
        results = run_linux_checks()

    # Step 3 — Calculate score
    score = calculate_score(results)

    # Step 4 — Print summary to terminal
    print_summary(results, score)

    # Step 5 — Send results to the API
    print("\n📤 Sending results to dashboard API...")
    success = send_results(device, results)

    if success:
        print("✅ Results saved! Open http://localhost:3000 to view your dashboard.\n")
    else:
        print("⚠️  Could not reach the API. Results printed above but NOT saved.\n")
        # Save locally as backup
        backup = {
            "device": device,
            "score": score,
            "scanned_at": datetime.now().isoformat(),
            "results": results
        }
        with open("scan_backup.json", "w") as f:
            json.dump(backup, f, indent=2)
        print("💾 Backup saved to scan_backup.json\n")


if __name__ == "__main__":
    main()
