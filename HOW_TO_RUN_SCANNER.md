# 🛡️ How to Run CIS Security Scanner

## Overview

The CIS Scanner is now **user-friendly** and will prompt you for your authentication token when you run it.

---

## 🚀 Method 1: Double-Click (Easiest)

### Download the Scanner

1. Go to: https://cis-audit-dashboard.vercel.app/quick-scan
2. Click: **"Download Windows Launcher"** button
3. Save to your Downloads folder

### Run the Scanner

1. **Find** `cis-scanner-windows.exe` in your Downloads folder
2. **Right-click** on it
3. Select: **"Run as administrator"**
4. When prompted, **paste your token** from the Quick Scan page
5. Wait for scan to complete (30-60 seconds)
6. Results automatically upload to dashboard

---

## 🎯 Method 2: Use Helper Scripts

### Option A: Batch Script

1. **Right-click** on `run-scanner.bat`
2. Select: **"Run as administrator"**
3. Follow on-screen instructions

### Option B: PowerShell Script

1. **Right-click** on `run-scanner.ps1`
2. Select: **"Run with PowerShell"**
3. If needed, allow execution: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`
4. Follow on-screen instructions

---

## 💻 Method 3: Command Line (Advanced)

### With Token Prompt (Interactive)

```powershell
# Open PowerShell as Administrator
cd $env:USERPROFILE\Downloads
.\cis-scanner-windows.exe
```

The scanner will prompt you for the token.

### With Token in Command

```powershell
# Open PowerShell as Administrator
cd $env:USERPROFILE\Downloads
.\cis-scanner-windows.exe --token YOUR_TOKEN_HERE
```

### With Environment Variable

```powershell
# Open PowerShell as Administrator
cd $env:USERPROFILE\Downloads
$env:CIS_TOKEN = "YOUR_TOKEN_HERE"
.\cis-scanner-windows.exe
```

---

## 🔑 Getting Your Authentication Token

### From Quick Scan Page (Recommended)

1. Go to: https://cis-audit-dashboard.vercel.app/quick-scan
2. You'll see your token displayed in **Step 3**
3. Click **"Copy Token"** button
4. Paste when scanner prompts you

### Token Format

Your token looks like this:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyQGV4YW1wbGUuY29tIiwi...
```

It's a long string (about 200+ characters) starting with `eyJ`.

---

## 📋 What Happens When You Run the Scanner

### Step 1: Scanner Starts

```
============================================================
  🛡️  CIS AUDIT QUICK SCAN
============================================================
  Time: 2026-10-21 13:16:14
  Host: mk
  OS:   windows — 10.0.26300
  IP:   10.5.50.121
============================================================
```

### Step 2: Authentication

If no token is found, you'll see:

```
❌ No authentication token found!

To authenticate, either:
  1. Download Launcher from dashboard (auto-authenticated)
  2. Set CIS_TOKEN environment variable
  3. Pass --token flag

Would you like to enter your token now? (y/n):
```

Type **`y`** and press Enter, then paste your token.

### Step 3: Running Checks

```
✅ Authentication token validated

🔍 Running CIS checks...
   This may take 30-60 seconds...
```

### Step 4: Results Summary

```
============================================================
  📊 SCAN COMPLETE
============================================================
  Total Checks: 45
  ✅ Passed:    32
  ❌ Failed:    10
  ⚠️  Warnings:  3
  📈 Score:     71.11%
============================================================
```

### Step 5: Upload Results

```
📤 Uploading results to dashboard...
✅ Success! Scan ID: 12345

🌐 View results:
   https://cis-audit-dashboard.vercel.app/dashboard
   https://cis-audit-dashboard.vercel.app/scans/12345

✅ Dashboard opened in browser!
```

### Step 6: Exit

```
============================================================
Press Enter to exit...
```

---

## ⚠️ Troubleshooting

### Issue 1: "Windows protected your PC" or SmartScreen Warning

**What you see:**
```
Windows Defender SmartScreen prevented an unrecognized app from starting.
Running this app might put your PC at risk.
```

**Solution:**
1. Click **"More info"**
2. Click **"Run anyway"**
3. This is normal for newly built executables

### Issue 2: "This app has been blocked by your administrator"

**Solution:**
1. Check with your IT administrator
2. Or temporarily disable Windows Defender:
   - Windows Security → Virus & threat protection → Manage settings
   - Turn off "Real-time protection" temporarily
   - Run scanner
   - Turn protection back on

### Issue 3: "Access Denied" or "Permission Denied"

**Solution:**
- Must run as **Administrator**
- Right-click → "Run as administrator"
- Some security checks require admin privileges

### Issue 4: "Token is invalid" or "Authentication failed"

**Possible causes:**
- Token expired (tokens last 24 hours)
- Token copied incorrectly (extra spaces or incomplete)
- You're logged out of the dashboard

**Solution:**
1. Log in to dashboard again
2. Go to Quick Scan page
3. Copy fresh token
4. Try again

### Issue 5: "Cannot connect to API" or "Upload failed"

**Possible causes:**
- No internet connection
- Firewall blocking connection
- API is temporarily down

**Solution:**
1. Check internet connection
2. Check firewall settings
3. Results are still saved locally in `scan_backup.json`
4. Try uploading again later

### Issue 6: Scanner exits immediately without doing anything

**Solution:**
1. Run from Command Prompt or PowerShell (not double-click)
2. You'll see error messages that way
3. Check if you need to run as Administrator

---

## 🔒 Security Notes

### Is the Scanner Safe?

✅ **Yes!** The scanner:
- Is **open source** - you can review the code
- Only **reads** system settings (doesn't modify anything)
- Requires **admin rights** only for reading security policies
- Doesn't install anything permanently
- Sends data **only to your dashboard** (encrypted HTTPS)

### What Data is Collected?

The scanner collects:
- ✅ System hostname
- ✅ OS version
- ✅ IP address
- ✅ Security settings (password policies, firewall, etc.)
- ❌ **NO** passwords
- ❌ **NO** personal files
- ❌ **NO** browsing history

### Token Security

- Tokens expire after 24 hours
- Tokens are tied to your user account
- Don't share your token with others
- Get a fresh token for each scan (or reuse for 24h)

---

## 📊 Viewing Results

### After Scan Completes

1. **Dashboard opens automatically** in your browser
2. Or manually go to: https://cis-audit-dashboard.vercel.app
3. Navigate to: **Scans** page
4. Click on your latest scan to see details

### What You'll See

- **Overall Score**: Percentage of checks passed
- **Check Details**: Each security check with pass/fail status
- **Severity**: High, Medium, Low risk levels
- **Recommendations**: How to fix failed checks
- **Trends**: Compare with previous scans

---

## 🎯 Best Practices

### Before Running Scanner

1. ✅ Close unnecessary applications
2. ✅ Run as Administrator
3. ✅ Have your token ready
4. ✅ Ensure stable internet connection

### Regular Scanning

- 📅 Scan **weekly** for production systems
- 📅 Scan **monthly** for development systems
- 📅 Scan **after major updates** or configuration changes
- 📅 Scan **before security audits**

### After Scanning

1. ✅ Review failed checks in dashboard
2. ✅ Prioritize by severity (High → Medium → Low)
3. ✅ Implement fixes
4. ✅ Re-scan to verify fixes
5. ✅ Document changes

---

## 📞 Getting Help

### Quick Links

- **Dashboard**: https://cis-audit-dashboard.vercel.app
- **Quick Scan**: https://cis-audit-dashboard.vercel.app/quick-scan
- **Documentation**: See `backend/docs/USER_GUIDE.md`

### Common Questions

**Q: How long does a scan take?**
A: Usually 30-60 seconds depending on system size.

**Q: Can I scan multiple computers?**
A: Yes! Run the scanner on each computer. All results appear in your dashboard.

**Q: Do I need to install anything?**
A: No! The scanner is portable - just download and run.

**Q: Can I schedule automated scans?**
A: Yes! Use Windows Task Scheduler with the command line method.

**Q: Does it work on Linux?**
A: Yes! There's also a Linux version. See Quick Scan page for download.

---

## 🔄 Quick Reference

| Action | Method |
|--------|--------|
| **Download scanner** | https://cis-audit-dashboard.vercel.app/quick-scan |
| **Get token** | https://cis-audit-dashboard.vercel.app/quick-scan |
| **Run scanner** | Right-click → Run as administrator |
| **View results** | https://cis-audit-dashboard.vercel.app/scans |
| **Easiest method** | Use `run-scanner.bat` script |
| **Command line** | `.\cis-scanner-windows.exe --token YOUR_TOKEN` |

---

## ✅ Success Checklist

Before asking for help, verify:

- [ ] Running as **Administrator**
- [ ] Have valid **authentication token**
- [ ] Token copied **completely** (no extra spaces)
- [ ] Internet connection is **working**
- [ ] Windows Defender/firewall **allows** the scanner
- [ ] Scanner executable **not blocked** by SmartScreen

---

**You're all set! Run the scanner and get your security compliance score! 🚀**
