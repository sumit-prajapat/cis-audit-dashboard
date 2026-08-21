# 📖 CIS Audit Dashboard - User Guide

Complete guide to using the CIS Audit Dashboard for security compliance scanning and reporting.

---

## 🎯 Overview

The CIS Audit Dashboard helps you:
1. **Scan** Windows/Linux systems for CIS Benchmark compliance
2. **Monitor** compliance scores and trends
3. **Generate** professional PDF reports
4. **Track** devices and their security status
5. **Manage** team access and permissions

---

## 🚀 Quick Start

### Step 1: Register & Login

1. Go to: **https://cis-audit-dashboard.vercel.app/register**
2. Fill in:
   - **Full Name**: Your name
   - **Work Email**: Your email address
   - **Organization Name**: Your company name
   - **Password**: Strong password (min 8 chars)
3. Click **"Create workspace"**
4. You're in! 🎉

### Step 2: Run Your First Scan

You have **2 ways** to run scans:

---

## 📋 Method 1: Using the Agent (Recommended)

The **CIS Audit Agent** is a Python script that runs on the machine you want to audit.

### Install the Agent

```bash
# Clone the repository
git clone https://github.com/sumit-prajapat/cis-audit-dashboard.git
cd cis-audit-dashboard/agent

# Install dependencies
pip install -r requirements.txt
```

### Run a Scan

#### Option A: Using Email/Password

```bash
python scanner.py \
  --email your@email.com \
  --password your-password \
  --api-url https://cis-audit-api.onrender.com
```

#### Option B: Using Access Token

```bash
# Get your token from dashboard first
python scanner.py \
  --token your-access-token \
  --api-url https://cis-audit-api.onrender.com
```

### What Happens:

1. 🔍 **Agent detects** your OS (Windows or Linux)
2. 🧪 **Runs CIS checks** (100+ security checks)
3. 📊 **Calculates score** (% of passed checks)
4. 📤 **Sends results** to dashboard API
5. ✅ **Results appear** in your dashboard

### Sample Output:

```
🛡️  CIS Audit Agent Starting...
   Time     : 2026-08-21 12:00:00
   Hostname : DESKTOP-ABC123
   OS       : windows — 10.0.19045
   IP       : 192.168.1.100

🔍 Running CIS checks...

============================================================
         CIS BENCHMARK AUDIT RESULTS
============================================================
  Total Checks : 127
  ✅ Passed    : 98
  ❌ Failed    : 24
  ⚠️  Warnings  : 5
  📊 Score     : 77.17%
============================================================

  FAILED / WARNING CHECKS:
------------------------------------------------------------
  ❌ [HIGH] Ensure 'Password must meet complexity requirements' is set
       Expected : Enabled
       Found    : Disabled

  ⚠️  [MEDIUM] Windows Firewall: Domain Profile active
       Expected : Enabled
       Found    : Enabled

📤 Sending results to dashboard API...
✅ Results saved! Open https://cis-audit-dashboard.vercel.app to view your dashboard.
```

---

## 📋 Method 2: API Submission (Advanced)

You can also submit scan results directly via API if you have your own scanning tools.

### Endpoint

```
POST https://cis-audit-api.onrender.com/api/scans
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

### Request Body

```json
{
  "device": {
    "hostname": "server-01",
    "os_type": "linux",
    "os_version": "Ubuntu 22.04",
    "ip_address": "192.168.1.50"
  },
  "results": [
    {
      "check_id": "1.1.1.1",
      "title": "Ensure mounting of cramfs filesystems is disabled",
      "description": "The cramfs filesystem type is a compressed read-only Linux filesystem",
      "severity": "HIGH",
      "status": "PASS",
      "expected_value": "disabled",
      "actual_value": "disabled",
      "remediation": "Edit /etc/modprobe.d/cramfs.conf...",
      "references": ["CIS Linux Benchmark v2.0", "Section 1.1.1.1"]
    }
  ]
}
```

### Get Your Access Token

1. Login to dashboard
2. Open browser console (F12)
3. Go to **Application** → **Local Storage**
4. Copy the **`access_token`** value

---

## 📊 Dashboard Features

### 1. Overview Dashboard

**URL**: `/dashboard`

Shows:
- 📈 **Compliance Score** - Overall security posture
- 🖥️ **Total Devices** - Number of scanned systems
- 🔍 **Recent Scans** - Latest audit results
- 📉 **Trend Chart** - Compliance over time
- ⚠️ **Critical Findings** - High-priority issues

### 2. Scans Page

**URL**: `/scans`

**Features**:
- **List all scans** with scores and dates
- **Filter by device** or date range
- **View scan details** - Click on any scan
- **See all checks** - Passed, failed, warnings
- **Download PDF** - Export scan report

**How to View a Scan**:
1. Click **"Scans"** in sidebar
2. See list of all scans
3. Click on any scan to view details
4. See breakdown of:
   - ✅ Passed checks
   - ❌ Failed checks
   - ⚠️ Warnings
   - 📋 Check details with remediation steps

### 3. Devices Page

**URL**: `/devices`

**Features**:
- **View all devices** in your organization
- **Device status** - Active, inactive, agent status
- **Last seen** - When device last checked in
- **Scan history** - All scans for each device
- **OS information** - Type, version, IP

**Device Auto-Registration**:
- Devices are **automatically registered** when first scan runs
- No manual device addition needed
- Agent sends device info during scan

### 4. Reports Page

**URL**: `/reports`

**Features**:
- **Generate PDF reports** from scans
- **List all reports** with status
- **Download reports** - Click download button
- **Schedule reports** (coming soon)
- **Filter by type** - Scan report, compliance report

---

## 📄 Generating PDF Reports

### Method 1: From Dashboard

1. **Go to Reports** page
2. **Click "Generate Report"**
3. **Fill form**:
   - Title: "Monthly Compliance Report"
   - Type: "CIS Audit Report"
   - Format: PDF
   - Framework: CIS Benchmark
4. **Click "Generate"**
5. **Download** when ready

### Method 2: From Scan Details

1. **Go to Scans** page
2. **Click on a scan**
3. **Click "Download PDF Report"** button
4. **PDF downloads** automatically

### Method 3: Via API

```bash
GET https://cis-audit-api.onrender.com/api/reports/{scan_id}/pdf
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### PDF Report Contains:

- **Executive Summary**
  - Overall compliance score
  - Total checks run
  - Pass/fail/warning counts
  - Compliance trend

- **Device Information**
  - Hostname
  - Operating system
  - IP address
  - Last scan date

- **Detailed Findings**
  - Failed checks with severity
  - Expected vs actual values
  - Remediation steps
  - References to CIS Benchmark sections

- **Check-by-Check Results**
  - All checks with status
  - Color-coded by severity
  - Evidence and recommendations

---

## 👥 Team Management

### Invite Team Members

1. **Go to Settings** → **Team**
2. **Click "Invite Member"**
3. **Enter email** and **select role**:
   - **Owner** - Full access (you)
   - **Admin** - Manage users, view all
   - **Member** - Run scans, view results
   - **Read-only** - View only, no changes
4. **Click "Send Invite"**
5. **Team member receives email** with invite link

### Manage Permissions

**Roles & Permissions**:

| Action | Owner | Admin | Member | Read-only |
|--------|-------|-------|--------|-----------|
| Run scans | ✅ | ✅ | ✅ | ❌ |
| View results | ✅ | ✅ | ✅ | ✅ |
| Generate reports | ✅ | ✅ | ✅ | ❌ |
| Download PDFs | ✅ | ✅ | ✅ | ✅ |
| Invite members | ✅ | ✅ | ❌ | ❌ |
| Remove members | ✅ | ✅ | ❌ | ❌ |
| Manage billing | ✅ | ❌ | ❌ | ❌ |
| Delete organization | ✅ | ❌ | ❌ | ❌ |

---

## 🔄 Compliance Monitoring

### Tracking Compliance Over Time

The dashboard automatically tracks your compliance trend:

1. **Run regular scans** (daily, weekly, monthly)
2. **View trend chart** on dashboard
3. **See improvement** or degradation
4. **Identify patterns** in failures

### Compliance Metrics

**Overall Score**: Percentage of passed checks
```
Score = (Passed Checks / Total Checks) × 100
```

**Severity Breakdown**:
- 🔴 **Critical** - Immediate action required
- 🟠 **High** - Address soon
- 🟡 **Medium** - Plan remediation
- 🟢 **Low** - Monitor

### Setting Goals

**Recommended targets**:
- **Basic**: 70%+ compliance
- **Good**: 85%+ compliance
- **Excellent**: 95%+ compliance
- **Perfect**: 100% compliance (rare)

---

## 🔍 Understanding Check Results

### Check Status Types

**PASS** ✅
- Check passed
- Configuration meets CIS Benchmark
- No action needed

**FAIL** ❌
- Check failed
- Security risk identified
- Action required

**WARN** ⚠️
- Check partially passed
- Manual review recommended
- May need attention

**MANUAL** 📝
- Cannot be automated
- Requires manual verification
- Review documentation

### Severity Levels

**CRITICAL** 🔴
- Severe security risk
- Immediate remediation required
- High probability of exploit

**HIGH** 🟠
- Significant security risk
- Remediate within 7 days
- Could lead to compromise

**MEDIUM** 🟡
- Moderate security risk
- Plan remediation within 30 days
- Defense-in-depth

**LOW** 🟢
- Minor security concern
- Address during maintenance
- Best practice recommendation

---

## 📱 Using the Dashboard

### Navigation

**Sidebar Menu**:
- 🏠 **Dashboard** - Overview & metrics
- 🔍 **Scans** - All scan results
- 🖥️ **Devices** - Managed systems
- 📄 **Reports** - Generated reports
- ⚙️ **Settings** - Account & organization
- 👥 **Team** - User management (admins only)
- 💳 **Billing** - Subscription (owners only)

### Keyboard Shortcuts

- `Ctrl/Cmd + K` - Global search
- `Esc` - Close modals
- `↑↓` - Navigate lists
- `Enter` - Select/open

### Filtering & Search

**On Scans page**:
- Filter by device
- Filter by date range
- Filter by status
- Sort by score, date, hostname

**On Devices page**:
- Filter by OS type
- Filter by status
- Search by hostname
- Sort by last seen, score

---

## 🛠️ Troubleshooting

### Agent Issues

**Problem**: Agent can't connect to API

**Solutions**:
1. Check API URL is correct
2. Verify network connectivity
3. Check firewall settings
4. Ensure token/credentials valid

**Problem**: "Login failed"

**Solutions**:
1. Verify email/password correct
2. Check account is activated
3. Try getting token from dashboard
4. Use `--token` instead of email/password

**Problem**: No checks are running

**Solutions**:
1. Check you have Python 3.8+ installed
2. Verify all dependencies installed: `pip install -r requirements.txt`
3. Run with admin/root privileges
4. Check OS detection is correct

### Dashboard Issues

**Problem**: Scans not appearing

**Solutions**:
1. Check scan was sent successfully (agent output)
2. Refresh the page
3. Check you're logged into correct organization
4. Verify API connection

**Problem**: Can't download PDF

**Solutions**:
1. Check scan has completed
2. Try a different browser
3. Check popup blocker settings
4. Try from Reports page instead

**Problem**: No data showing

**Solutions**:
1. Run at least one scan first
2. Check organization has devices
3. Verify you have permissions to view
4. Refresh browser

---

## 📈 Best Practices

### Scanning Strategy

1. **Initial Baseline**
   - Run scan on all devices
   - Document current state
   - Identify priorities

2. **Regular Scans**
   - Weekly for production
   - Daily for critical systems
   - After any changes

3. **Remediation Cycle**
   - Fix critical findings first
   - Address high severity next
   - Plan for medium/low

4. **Continuous Monitoring**
   - Track trend over time
   - Set compliance goals
   - Review regularly

### Report Management

1. **Generate monthly reports** for management
2. **Include in audits** - Compliance evidence
3. **Archive important scans** - Keep history
4. **Share with team** - Distribute PDF reports

### Team Workflow

1. **Security team** - Run scans, analyze results
2. **System admins** - Implement fixes
3. **Management** - Review reports
4. **Auditors** - Verify compliance

---

## 🔐 Security & Privacy

### Data Security

- ✅ **Encrypted in transit** - HTTPS everywhere
- ✅ **Encrypted at rest** - Database encryption
- ✅ **Secure authentication** - JWT tokens with rotation
- ✅ **Role-based access** - Granular permissions
- ✅ **Audit logging** - All actions tracked

### Data Privacy

- **What we collect**:
  - Device hostnames, OS versions, IP addresses
  - Scan results (configuration checks)
  - User account information

- **What we DON'T collect**:
  - File contents
  - Personal user data
  - Passwords or credentials
  - Network traffic

- **Data retention**:
  - Scans: Kept indefinitely (you can delete)
  - Reports: Kept indefinitely
  - Audit logs: 90 days

---

## 💡 Tips & Tricks

1. **Run scans during maintenance windows** to avoid performance impact
2. **Use descriptive hostnames** for easy device identification
3. **Tag critical systems** in device notes
4. **Schedule weekly reports** to track progress
5. **Share compliance dashboard** with stakeholders
6. **Document remediation steps** in notes
7. **Compare scans** to see what changed
8. **Export PDF for auditors** - Professional reports

---

## 📞 Need Help?

- **Documentation**: See `/docs` folder
- **API Docs**: https://cis-audit-api.onrender.com/api/docs
- **GitHub Issues**: Report bugs or request features
- **Email**: support@example.com

---

**🎉 You're all set! Start scanning and improving your security posture!**
