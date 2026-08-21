# ✅ Testing Checklist - CIS Audit Dashboard

This document provides a step-by-step checklist to verify all features are working correctly.

---

## 🌐 Environment

**Production URLs:**
- Frontend: https://cis-audit-dashboard.vercel.app
- Backend: https://cis-audit-api.onrender.com
- API Docs: https://cis-audit-api.onrender.com/api/docs

**Deployment:**
- Frontend: Vercel (Auto-deploys from main branch)
- Backend: Render.com (FastAPI Python app)
- Database: Render PostgreSQL (Internal connection)

---

## 1️⃣ Backend Health Check

### Test: API is Running

```bash
# Windows
curl https://cis-audit-api.onrender.com/api/health

# Expected Response:
# {"status":"ready","database":"connected"}
```

✅ **Pass Criteria:**
- Status code: 200
- `status`: "ready"
- `database`: "connected"

---

## 2️⃣ User Registration

### Test: Create New Account

**Steps:**
1. Go to: https://cis-audit-dashboard.vercel.app/register
2. Fill form:
   - Full Name: Test User
   - Work Email: test@example.com
   - Organization: Test Org
   - Password: Test123!@#
3. Click "Create workspace"

✅ **Pass Criteria:**
- No network errors
- Redirects to /dashboard
- Can see dashboard interface
- User info appears in header

**Verification:**
```bash
# Check user was created via API
curl https://cis-audit-api.onrender.com/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 3️⃣ User Login

### Test: Login with Existing Account

**Steps:**
1. Go to: https://cis-audit-dashboard.vercel.app/login
2. Enter email and password
3. Click "Sign in"

✅ **Pass Criteria:**
- No errors
- Redirects to /dashboard
- Session persists (refresh page, still logged in)
- Token stored in localStorage

**Verification:**
- Open DevTools (F12)
- Go to Application → Local Storage
- Verify `access_token` exists

---

## 4️⃣ Agent Installation

### Test: Agent Dependencies Install

**Windows:**
```powershell
cd agent
pip install -r requirements.txt
```

**Linux:**
```bash
cd agent
pip3 install -r requirements.txt
```

✅ **Pass Criteria:**
- All packages install successfully
- No dependency conflicts
- `requests` and `python-dotenv` installed

---

## 5️⃣ Run CIS Scan (Windows)

### Test: Windows Agent Scan

```powershell
cd agent
python scanner.py `
  --email your@email.com `
  --password your_password `
  --api-url https://cis-audit-api.onrender.com
```

✅ **Pass Criteria:**
- Agent starts without errors
- Detects OS as "windows"
- Runs 18+ checks
- Shows ✅ passed, ❌ failed, ⚠️ warnings
- Calculates score (0-100%)
- Sends to API successfully
- Shows: "✅ Scan saved — ID: ..."

**Expected Output:**
```
🛡️  CIS Audit Agent Starting...
   Time     : 2026-08-21 12:00:00
   Hostname : YOUR-PC
   OS       : windows — 10.0.19045
   IP       : 192.168.x.x

🔍 Running CIS checks...
  Running Windows 11 CIS Benchmark checks...
    ✅ WIN-ACC-001 — Minimum Password Length
    ❌ WIN-USR-001 — Guest Account Disabled
    ⚠️  WIN-RDP-002 — RDP Disabled If Unused
    ...

  ✔ 18 checks completed.

============================================================
         CIS BENCHMARK AUDIT RESULTS
============================================================
  Total Checks : 18
  ✅ Passed    : 12
  ❌ Failed    : 4
  ⚠️  Warnings  : 2
  📊 Score     : 66.67%
============================================================

📤 Sending results to dashboard API...
  ✅ Scan saved — ID: 123e4567-...  Score: 66.67%
✅ Results saved!
```

---

## 6️⃣ Run CIS Scan (Linux)

### Test: Linux Agent Scan

```bash
cd agent
sudo python3 scanner.py \
  --email your@email.com \
  --password your_password \
  --api-url https://cis-audit-api.onrender.com
```

✅ **Pass Criteria:**
- Agent starts without errors
- Detects OS as "linux"
- Runs 19+ checks
- SSH checks execute
- Firewall checks execute
- Password policy checks execute
- Sends to API successfully

**Common Linux Checks:**
- LNX-SSH-001: SSH Root Login Disabled
- LNX-FW-001: Firewall Active
- LNX-PWD-001: Maximum Password Age
- LNX-SYS-001: GRUB Bootloader Password

---

## 7️⃣ View Scan Results in Dashboard

### Test: Scan Appears in UI

**Steps:**
1. Go to: https://cis-audit-dashboard.vercel.app/dashboard
2. Check Overview Dashboard

✅ **Pass Criteria:**
- **Compliance Score** card shows percentage
- **Total Devices** shows 1 or more
- **Recent Scans** list shows your scan
- **Trend Chart** displays (may be flat if only 1 scan)
- **Critical Findings** shows count

**Verify:**
- Scan appears within 5 seconds of agent completion
- Score matches agent output
- Device hostname correct
- Timestamp recent

---

## 8️⃣ View Scan Details

### Test: Scan Detail Page

**Steps:**
1. Go to: https://cis-audit-dashboard.vercel.app/scans
2. Click on your scan

✅ **Pass Criteria:**
- Scan details page loads
- Shows all checks (passed, failed, warnings)
- Check cards display:
  - Check ID (e.g., WIN-ACC-001)
  - Title
  - Status badge (PASS/FAIL/WARN)
  - Severity badge (CRITICAL/HIGH/MEDIUM/LOW)
- Failed checks show:
  - Actual value
  - Expected value
  - Remediation steps

---

## 9️⃣ View Devices

### Test: Device Auto-Registration

**Steps:**
1. Go to: https://cis-audit-dashboard.vercel.app/devices

✅ **Pass Criteria:**
- Device appears in list
- Shows correct:
  - Hostname
  - OS Type (windows/linux)
  - OS Version
  - IP Address
  - Last Seen timestamp
  - Compliance Score
  - Status: Active

---

## 🔟 Generate PDF Report (Method 1)

### Test: Download from Scan Details

**Steps:**
1. Go to Scans page
2. Click on a scan
3. Click "Download PDF Report" button

✅ **Pass Criteria:**
- PDF downloads immediately
- Filename: `cis-report-HOSTNAME-DATE.pdf`
- PDF opens successfully
- Contains:
  - Cover page with score gauge
  - Device information
  - Summary statistics
  - Failed checks section (red)
  - Warnings section (yellow)
  - Complete checks table
  - Remediation summary
- Dark theme styling
- Professional layout
- All text readable

**Verify PDF Contents:**
- [ ] Title: "CIS BENCHMARK Compliance Audit Report"
- [ ] Score ring shows correct percentage
- [ ] Device metadata (hostname, OS, IP, date)
- [ ] Summary stats (total, passed, failed, warnings, score)
- [ ] Failed checks with severity badges
- [ ] Each failed check shows:
  - Check ID
  - Title
  - Severity (CRITICAL/HIGH/MEDIUM/LOW)
  - Found vs Expected values
  - Remediation steps (💡 icon)
- [ ] Warnings section
- [ ] Complete checks table
- [ ] Remediation summary (🔧 icon)
- [ ] Header on every page
- [ ] Footer with page numbers

---

## 1️⃣1️⃣ Generate PDF Report (Method 2)

### Test: Generate from Reports Page

**Steps:**
1. Go to: https://cis-audit-dashboard.vercel.app/reports
2. Click "Generate Report" button
3. Fill form:
   - Title: "Monthly Compliance Report"
   - Type: "CIS Audit Report"
   - Format: "PDF"
   - Framework: "CIS Benchmark"
4. Click "Generate"
5. Report appears in list
6. Click Download button

✅ **Pass Criteria:**
- Report generates successfully
- Appears in reports list
- Status: "completed"
- Can download PDF
- PDF content matches scan report

---

## 1️⃣2️⃣ API Direct Testing

### Test: Submit Scan via API

```bash
# 1. Login to get token
curl -X POST https://cis-audit-api.onrender.com/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=your@email.com&password=yourpassword&remember_me=true"

# Response: {"access_token":"eyJ...","token_type":"bearer"}

# 2. Submit scan
curl -X POST https://cis-audit-api.onrender.com/api/scans \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "device": {
      "hostname": "test-server",
      "os_type": "linux",
      "os_version": "Ubuntu 22.04",
      "ip_address": "192.168.1.100"
    },
    "results": [
      {
        "check_id": "TEST-001",
        "title": "Test Check",
        "description": "This is a test",
        "severity": "HIGH",
        "status": "PASS",
        "expected_value": "enabled",
        "actual_value": "enabled",
        "remediation": "No action needed"
      }
    ]
  }'
```

✅ **Pass Criteria:**
- Status: 201 Created
- Returns scan object with ID
- Scan appears in dashboard
- Device auto-created if new

---

## 1️⃣3️⃣ Compliance Metrics

### Test: Organization Metrics

```bash
curl https://cis-audit-api.onrender.com/api/scans/compliance-metrics \
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ **Pass Criteria:**
- Returns:
  - `org_compliance_score`: average across all devices
  - `total_devices`: count
  - `total_scans`: count
  - `passed_checks`: sum
  - `failed_checks`: sum
  - `critical_findings`: count
  - `high_findings`: count
  - `medium_findings`: count
  - `low_findings`: count
  - `recent_scans`: array of 5 most recent

---

## 1️⃣4️⃣ Device Stats

### Test: Device Statistics

```bash
curl https://cis-audit-api.onrender.com/api/devices/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ **Pass Criteria:**
- Returns:
  - `total_devices`
  - `active_devices`
  - `offline_devices`
  - `os_breakdown`: array of {os_type, count}

---

## 1️⃣5️⃣ Compliance Trend

### Test: Device Compliance Over Time

```bash
curl https://cis-audit-api.onrender.com/api/devices/DEVICE_ID/compliance-trend?days=30 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

✅ **Pass Criteria:**
- Returns array of scans with:
  - `date`: timestamp
  - `score`: compliance percentage
  - `passed`: count
  - `failed`: count
- Data sorted by date ascending
- Covers requested time range

---

## 1️⃣6️⃣ Security Testing

### Test: Authentication Required

```bash
# Try without token
curl https://cis-audit-api.onrender.com/api/scans

# Expected: 401 Unauthorized
```

✅ **Pass Criteria:**
- Returns 401 status
- Error message: "Not authenticated" or similar

### Test: Invalid Token

```bash
curl https://cis-audit-api.onrender.com/api/scans \
  -H "Authorization: Bearer invalid_token_here"

# Expected: 401 Unauthorized
```

✅ **Pass Criteria:**
- Returns 401 status
- Token validation fails

### Test: CORS Enabled

```bash
curl -I https://cis-audit-api.onrender.com/api/health \
  -H "Origin: https://cis-audit-dashboard.vercel.app"

# Check headers include:
# Access-Control-Allow-Origin: https://cis-audit-dashboard.vercel.app
```

✅ **Pass Criteria:**
- CORS headers present
- Frontend domain allowed

---

## 1️⃣7️⃣ Error Handling

### Test: Invalid Login

**Steps:**
1. Go to login page
2. Enter wrong password
3. Submit

✅ **Pass Criteria:**
- Shows error message
- Does not crash
- Can retry login

### Test: Network Error Handling

**Steps:**
1. Disconnect internet
2. Try to load dashboard
3. Reconnect

✅ **Pass Criteria:**
- Shows user-friendly error
- Retries when connection restored
- No data loss

---

## 1️⃣8️⃣ Browser Compatibility

### Test: Multiple Browsers

**Test in:**
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

✅ **Pass Criteria:**
- Dashboard loads correctly
- All features work
- Styling consistent
- No console errors

---

## 1️⃣9️⃣ Mobile Responsiveness

### Test: Mobile View

**Steps:**
1. Open dashboard on phone or use DevTools mobile emulation
2. Check all pages

✅ **Pass Criteria:**
- Layout adapts to small screens
- Navigation accessible
- Tables scrollable
- Buttons reachable
- Text readable

---

## 2️⃣0️⃣ Performance

### Test: Load Times

**Measure:**
- Dashboard initial load: < 3 seconds
- Scans page load: < 2 seconds
- Scan details load: < 2 seconds
- PDF generation: < 5 seconds

✅ **Pass Criteria:**
- All pages load within acceptable time
- No long hanging requests
- Smooth scrolling

---

## 📊 Testing Summary

| Test | Status | Notes |
|------|--------|-------|
| Backend Health | ⬜ | |
| User Registration | ⬜ | |
| User Login | ⬜ | |
| Agent Install | ⬜ | |
| Windows Scan | ⬜ | |
| Linux Scan | ⬜ | |
| View Results | ⬜ | |
| Scan Details | ⬜ | |
| Device List | ⬜ | |
| PDF Download (Scan) | ⬜ | |
| PDF Generate (Reports) | ⬜ | |
| API Direct | ⬜ | |
| Compliance Metrics | ⬜ | |
| Device Stats | ⬜ | |
| Compliance Trend | ⬜ | |
| Auth Required | ⬜ | |
| CORS Working | ⬜ | |
| Error Handling | ⬜ | |
| Browser Compat | ⬜ | |
| Mobile Responsive | ⬜ | |
| Performance | ⬜ | |

**Legend:** ⬜ Not tested | ✅ Pass | ❌ Fail

---

## 🐛 Known Issues / Limitations

### Current Limitations:
1. **Free Tier Delays**: Render.com free tier may have cold starts (15-30 seconds on first request)
2. **Scan Storage**: All scans stored indefinitely (no auto-cleanup yet)
3. **Email Notifications**: Not yet implemented
4. **Scheduled Reports**: Not yet implemented
5. **Multi-factor Auth**: Not yet implemented

### Workarounds:
- **Cold Start**: First API request may be slow, subsequent ones fast
- **Storage**: Manually delete old scans if needed
- **Notifications**: Check dashboard regularly
- **Reports**: Generate manually on-demand
- **MFA**: Use strong passwords

---

## 🚀 Post-Testing Actions

After completing all tests:

1. ✅ **Document any failures** in GitHub Issues
2. ✅ **Update this checklist** with results
3. ✅ **Fix critical bugs** immediately
4. ✅ **Plan improvements** for next sprint
5. ✅ **Update user documentation** if behavior changed

---

## 📞 Reporting Issues

**When reporting bugs, include:**
- Test number and name
- Expected behavior
- Actual behavior
- Error messages (screenshots)
- Browser/OS information
- Steps to reproduce

**Create GitHub Issue with:**
```
Title: [BUG] Test #X - Brief Description

Environment:
- Browser: Chrome 120.0
- OS: Windows 11
- Frontend: https://cis-audit-dashboard.vercel.app
- Backend: https://cis-audit-api.onrender.com

Steps to Reproduce:
1. ...
2. ...
3. ...

Expected Result:
...

Actual Result:
...

Screenshots:
[attach if relevant]
```

---

**✅ All tests passing = Production Ready!**
