"""
CIS Audit Launcher — Minimal one-click scanner
This is a simplified version designed to be bundled as a portable executable.
Automatically detects auth token from browser localStorage or environment.
"""

import platform
import socket
import json
import sys
import os
from datetime import datetime

# Try to import requests, if not available, provide installation instructions
try:
    import requests
except ImportError:
    print("❌ Missing 'requests' library.")
    print("Please install: pip install requests")
    sys.exit(1)


def get_device_info():
    """Collect basic info about the machine being scanned."""
    return {
        "hostname": socket.gethostname(),
        "os_type": "windows" if platform.system() == "Windows" else "linux",
        "os_version": platform.version(),
        "ip_address": socket.gethostbyname(socket.gethostname()),
    }


def run_checks():
    """Run CIS checks based on detected OS."""
    device = get_device_info()
    
    if device["os_type"] == "windows":
        from checks.windows import run_windows_checks
        return run_windows_checks()
    else:
        from checks.linux import run_linux_checks
        return run_linux_checks()


def calculate_score(results):
    """Calculate overall compliance score as a percentage."""
    total = len(results)
    if total == 0:
        return 0.0
    passed = sum(1 for r in results if r["status"] == "PASS")
    return round((passed / total) * 100, 2)


def get_token_from_browser():
    """
    Try to extract access_token from browser localStorage.
    This works when the launcher is downloaded from the authenticated dashboard.
    """
    # On Windows, Chrome stores localStorage in:
    # %LOCALAPPDATA%\Google\Chrome\User Data\Default\Local Storage\leveldb
    # This is complex to parse, so we'll use a different approach:
    # Pass token via command line or environment variable
    
    # Check environment first
    token = os.getenv("CIS_TOKEN") or os.getenv("CIS_AUTH_TOKEN")
    if token:
        return token
    
    # Check for token file (created by dashboard download)
    token_file = os.path.join(os.path.dirname(__file__), ".cis-token")
    if os.path.exists(token_file):
        with open(token_file, "r") as f:
            return f.read().strip()
    
    return None


def send_results(device, results, api_url, token):
    """POST scan results to the backend API."""
    payload = {
        "device": device,
        "results": results,
    }
    
    headers = {"Authorization": f"Bearer {token}"}
    
    try:
        response = requests.post(
            f"{api_url}/api/scans",
            json=payload,
            headers=headers,
            timeout=15,
        )
        if response.status_code == 201:
            data = response.json()
            return True, data
        else:
            return False, f"API returned {response.status_code}: {response.text}"
    except Exception as e:
        return False, f"Error: {e}"


def main():
    """Main launcher entry point."""
    
    # Configuration
    API_URL = os.getenv("CIS_API_URL", "https://cis-audit-api.onrender.com").rstrip("/")
    DASHBOARD_URL = os.getenv("CIS_DASHBOARD_URL", "https://cis-audit-dashboard.vercel.app")
    
    print("\n" + "="*60)
    print("  🛡️  CIS AUDIT QUICK SCAN")
    print("="*60)
    print(f"  Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Get device info
    device = get_device_info()
    print(f"  Host: {device['hostname']}")
    print(f"  OS:   {device['os_type']} — {device['os_version']}")
    print(f"  IP:   {device['ip_address']}")
    print("="*60)
    
    # Get authentication token
    token = get_token_from_browser()
    if not token:
        print("\n❌ No authentication token found!")
        print("\nTo authenticate, either:")
        print("  1. Download launcher from dashboard (auto-authenticated)")
        print("  2. Set CIS_TOKEN environment variable")
        print("  3. Pass --token flag")
        print("\nExample:")
        print(f"  python launcher.py --token YOUR_TOKEN")
        print(f"\nDashboard: {DASHBOARD_URL}")
        input("\nPress Enter to exit...")
        sys.exit(1)
    
    # Run checks
    print("\n🔍 Running CIS checks...\n")
    try:
        results = run_checks()
    except Exception as e:
        print(f"\n❌ Error running checks: {e}")
        input("\nPress Enter to exit...")
        sys.exit(1)
    
    # Calculate score
    score = calculate_score(results)
    total = len(results)
    passed = sum(1 for r in results if r["status"] == "PASS")
    failed = sum(1 for r in results if r["status"] == "FAIL")
    warned = sum(1 for r in results if r["status"] == "WARN")
    
    # Print summary
    print("\n" + "="*60)
    print("  📊 SCAN COMPLETE")
    print("="*60)
    print(f"  Total Checks: {total}")
    print(f"  ✅ Passed:    {passed}")
    print(f"  ❌ Failed:    {failed}")
    print(f"  ⚠️  Warnings:  {warned}")
    print(f"  📈 Score:     {score}%")
    print("="*60)
    
    # Send to API
    print("\n📤 Uploading results to dashboard...")
    success, result = send_results(device, results, API_URL, token)
    
    if success:
        print(f"✅ Success! Scan ID: {result.get('id', 'unknown')}")
        print(f"\n🌐 View results:")
        print(f"   {DASHBOARD_URL}/dashboard")
        print(f"   {DASHBOARD_URL}/scans/{result.get('id', '')}")
        
        # Try to open browser automatically
        try:
            import webbrowser
            webbrowser.open(f"{DASHBOARD_URL}/dashboard")
            print("\n✅ Dashboard opened in browser!")
        except:
            pass
    else:
        print(f"❌ Upload failed: {result}")
        print("\nResults have been displayed above but not saved to dashboard.")
    
    print("\n" + "="*60)
    input("\nPress Enter to exit...")


if __name__ == "__main__":
    # Support command line args
    if len(sys.argv) > 1:
        if "--token" in sys.argv:
            idx = sys.argv.index("--token")
            if idx + 1 < len(sys.argv):
                os.environ["CIS_TOKEN"] = sys.argv[idx + 1]
        if "--api-url" in sys.argv:
            idx = sys.argv.index("--api-url")
            if idx + 1 < len(sys.argv):
                os.environ["CIS_API_URL"] = sys.argv[idx + 1]
    
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n⚠️  Scan cancelled by user.")
        sys.exit(0)
    except Exception as e:
        print(f"\n\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        input("\nPress Enter to exit...")
        sys.exit(1)
