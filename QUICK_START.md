# 🚀 Quick Start Guide - CIS Audit Dashboard

**Live Production URLs:**
- 🌐 Dashboard: https://cis-audit-dashboard.vercel.app
- 🔌 API: https://cis-audit-api.onrender.com
- 📚 API Docs: https://cis-audit-api.onrender.com/api/docs

---

## ⚡ 5-Minute Setup

### Step 1: Create Your Account (2 minutes)

1. **Go to**: https://cis-audit-dashboard.vercel.app/register
2. **Fill in**:
   - Full Name: `Your Name`
   - Work Email: `your@email.com`
   - Organization Name: `Your Company`
   - Password: `Strong_Password123!`
3. **Click** "Create workspace"
4. ✅ **Done!** You're logged in

---

### Step 2: Run Your First Scan (3 minutes)

#### Option A: Windows System

```powershell
# 1. Install Python (if not installed)
# Download from: https://www.python.org/downloads/

# 2. Clone repository
git clone https://github.com/your-username/cis-audit-dashboard.git
cd cis-audit-dashboard\agent

# 3. Install dependencies
pip install -r requirements.txt

# 4. Run the scan
python scanner.py ^
  --email your@email.com ^
  --password Your_Password ^
  --api-url https://cis-audit-api.onrender.com
```

#### Option B: Linux System

```bash
# 1. Clone repository
git clone https://github.com/your-username/cis-audit-dashboard.git
cd cis-audit-dashboard/agent

# 2. Install dependencies
pip3 install -r requirements.txt

# 3. Run the scan (requires sudo for some checks)
sudo python3 scanner.py \
  --email your@email.com \
  --password Your_Password \
  --api-url https://cis-audit-api.onrender.com
```

---

## 📊 View Your Results

1. **Go to Dashboard**: https://cis-audit-dashboard.vercel.app/dashboard
2. **See**:
   - ✅ Your compliance score (percentage)
   - 🖥️ Total devices scanned
   - 📊 Pass/Fail breakdown
   - ⚠️ Critical findings

3. **Click "Scans"** → See detailed results:
   - All checks run
   - Failed items with severity
   - Remediation instructions

4. **Download PDF Report**:
   - Click on any scan
   - Click "Download PDF Report" button
   - Professional compliance report downloads

---

## 🎯 What the Scanner Does

### Windows Scans (18+ Checks)
- ✅ Password policies (length, age, complexity)
- ✅ Account lockout settings
- ✅ Guest account disabled
- ✅ Windows Firewall enabled (all profiles)
- ✅ RDP security (NLA required)
- ✅ Windows Defender active
- ✅ Automatic updates enabled
- ✅ Audit policies (login tracking)
- ✅ Unnecessary services disabled (Telnet, etc.)

### Linux Scans (19+ Checks)
- ✅ SSH hardening (no root login, max auth tries)
- ✅ Firewall active (UFW/iptables)
- ✅ Password policies (length, age)
- ✅ GRUB bootloader password
- ✅ AppArmor/SELinux active
- ✅ Core dumps disabled
- ✅ Cron permissions
- ✅ No world-writable system files
- ✅ Unnecessary services disabled (FTP, Telnet, etc.)

**Sample Output:**
```
🛡️  CIS Audit Agent Starting...
   Time     : 2026-08-21 12:00:00
   Hostname : SERVER-01
   OS       : linux — Ubuntu 22.04
   IP       : 192.168.1.100

🔍 Running CIS checks...
  Running Linux CIS Benchmark checks (Parallel Execution)...
    ✅ LNX-SSH-001 — SSH Root Login Disabled
    ✅ LNX-FW-001 — Firewall Active (UFW/iptables)
    ❌ LNX-PWD-002 — Minimum Password Length
    ⚠️  LNX-SYS-001 — GRUB Bootloader Password

  ✔ 19 checks completed.

============================================================
         CIS BENCHMARK AUDIT RESULTS
============================================================
  Total Checks : 19
  ✅ Passed    : 14
  ❌ Failed    : 3
  ⚠️  Warnings  : 2
  📊 Score     : 73.68%
============================================================

📤 Sending results to dashboard API...
  ✅ Scan saved — ID: 123e4567-...  Score: 73.68%
✅ Results saved! Open https://cis-audit-dashboard.vercel.app to view your dashboard.
```

---

## 📄 Generating Reports

### Method 1: From Scan Details (Quickest)
1. Go to **Scans** page
2. Click on any scan
3. Click **"Download PDF Report"**
4. ✅ PDF downloads automatically

### Method 2: From Reports Page
1. Go to **Reports** page
2. Click **"Generate Report"**
3. Fill form:
   - Title: "Monthly Compliance Report"
   - Type: "CIS Audit Report"
   - Format: PDF
   - Framework: CIS Benchmark
4. Click **"Generate"**
5. Download when ready

### PDF Report Contents:
- 📊 Executive summary with compliance score
- 🖥️ Device information (hostname, OS, IP)
- ❌ Failed checks with severity levels
- ⚠️ Warnings requiring attention
- 📋 Complete check-by-check results table
- 🔧 Remediation instructions for all failures
- 🎨 Professional dark theme design
- 📈 Visual compliance gauge

---

## 🔐 Advanced: Using Access Tokens

**Why use tokens?**
- No need to pass email/password in commands
- More secure for automation
- Token-based authentication

**How to get your token:**

1. **Login to dashboard**
2. **Open browser console** (F12)
3. **Go to Application tab** → **Local Storage**
4. **Copy** the `access_token` value

**Use token in scans:**
```bash
python scanner.py \
  --token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... \
  --api-url https://cis-audit-api.onrender.com
```

**Or set environment variable:**
```bash
# Linux/Mac
export CIS_AUTH_TOKEN="your-token-here"
export CIS_API_URL="https://cis-audit-api.onrender.com"
python scanner.py

# Windows
set CIS_AUTH_TOKEN=your-token-here
set CIS_API_URL=https://cis-audit-api.onrender.com
python scanner.py
```

---

## 🔄 Regular Scanning Schedule

### Recommended Scanning Frequency:

| System Type | Frequency | Why |
|------------|-----------|-----|
| **Production Servers** | Weekly | High risk, needs close monitoring |
| **Critical Systems** | Daily | Maximum security, detect changes fast |
| **Development/Test** | Monthly | Lower risk, less frequent needed |
| **Workstations** | Bi-weekly | Balance security and overhead |

### Automation Options:

#### Windows Task Scheduler
```powershell
# Create scheduled task to run daily at 2 AM
schtasks /create /tn "CIS_Audit_Scan" /tr "python C:\path\to\agent\scanner.py --token YOUR_TOKEN --api-url https://cis-audit-api.onrender.com" /sc daily /st 02:00
```

#### Linux Cron Job
```bash
# Add to crontab: Run every day at 2 AM
0 2 * * * cd /path/to/agent && python3 scanner.py --token YOUR_TOKEN --api-url https://cis-audit-api.onrender.com >> /var/log/cis-scan.log 2>&1
```

---

## 📱 Dashboard Features

### Overview Dashboard
- 📈 Overall compliance score
- 🖥️ Total devices count
- 🔍 Recent scans list
- 📉 Compliance trend chart
- ⚠️ Critical findings summary

### Scans Page
- 📋 List all scans with scores
- 🔍 Filter by device or date
- 📊 View detailed check results
- ⚠️ See failed/warning checks
- 📄 Download PDF reports

### Devices Page
- 🖥️ All registered devices
- ✅ Device status (active/inactive)
- 📊 Last scan score
- 🕐 Last seen timestamp
- 📈 Scan history per device

### Reports Page
- 📄 Generated PDF reports list
- ⬇️ Download reports
- 📅 Report generation history
- 📊 Report status tracking

---

## 🛠️ Troubleshooting

### Problem: "Login failed"

**Solutions:**
1. ✅ Verify email/password are correct
2. ✅ Check you created an account first
3. ✅ Try getting token from dashboard
4. ✅ Use `--token` instead of email/password

### Problem: "Cannot connect to API"

**Solutions:**
1. ✅ Check internet connection
2. ✅ Verify API URL: `https://cis-audit-api.onrender.com`
3. ✅ Test API health: `curl https://cis-audit-api.onrender.com/api/health`
4. ✅ Check firewall not blocking HTTPS

### Problem: "No checks are running"

**Solutions:**
1. ✅ Verify Python 3.8+ installed: `python --version`
2. ✅ Install dependencies: `pip install -r requirements.txt`
3. ✅ Run with admin/sudo privileges
4. ✅ Check OS detection works

### Problem: "Scan not appearing in dashboard"

**Solutions:**
1. ✅ Check agent output shows "Scan saved"
2. ✅ Refresh browser page
3. ✅ Verify logged into correct account
4. ✅ Check organization matches

### Problem: "Can't download PDF"

**Solutions:**
1. ✅ Try different browser
2. ✅ Disable popup blocker
3. ✅ Try from Reports page instead
4. ✅ Check scan completed successfully

---

## 🎯 Understanding Your Score

### Score Calculation
```
Score = (Passed Checks / Total Checks) × 100
```

### Score Ratings

| Score | Rating | Status | Action |
|-------|--------|--------|--------|
| **95-100%** | 🟢 Excellent | Very secure | Maintain current state |
| **85-94%** | 🟢 Good | Secure | Minor improvements needed |
| **70-84%** | 🟡 Fair | Moderate risk | Address high-severity items |
| **50-69%** | 🟠 Poor | High risk | Urgent remediation required |
| **0-49%** | 🔴 Critical | Severe risk | Immediate action needed |

### Severity Levels

**CRITICAL** 🔴
- Severe security vulnerability
- Exploitable by attackers
- **Fix immediately** (within 24 hours)
- Examples: Guest account enabled, no firewall

**HIGH** 🟠
- Significant security risk
- Could lead to compromise
- **Fix soon** (within 7 days)
- Examples: Weak passwords, no audit logging

**MEDIUM** 🟡
- Moderate security concern
- Defense-in-depth measure
- **Plan remediation** (within 30 days)
- Examples: Service not disabled, idle timeout not set

**LOW** 🟢
- Minor security improvement
- Best practice recommendation
- **Address during maintenance**
- Examples: Admin account not renamed

---

## 👥 Team Collaboration

### Invite Team Members

1. **Go to Settings** → **Team**
2. **Click "Invite Member"**
3. **Enter email** and **select role**
4. **Send invite**

### Roles & Permissions

| Feature | Owner | Admin | Member | Read-only |
|---------|-------|-------|--------|-----------|
| Run scans | ✅ | ✅ | ✅ | ❌ |
| View results | ✅ | ✅ | ✅ | ✅ |
| Generate reports | ✅ | ✅ | ✅ | ❌ |
| Download PDFs | ✅ | ✅ | ✅ | ✅ |
| Invite members | ✅ | ✅ | ❌ | ❌ |
| Manage billing | ✅ | ❌ | ❌ | ❌ |

---

## 📊 Compliance Monitoring Best Practices

### 1. Establish Baseline
- Run initial scan on all systems
- Document current compliance state
- Identify quick wins vs. long-term fixes

### 2. Set Goals
- **Minimum target**: 70% compliance
- **Good target**: 85% compliance
- **Excellent target**: 95% compliance

### 3. Prioritize Remediation
1. **Critical** findings first
2. **High** severity next
3. **Medium** in next maintenance window
4. **Low** as time permits

### 4. Track Progress
- Run regular scans (weekly/monthly)
- Monitor trend chart
- Celebrate improvements
- Document changes

### 5. Report to Stakeholders
- Generate monthly PDF reports
- Share compliance scores with management
- Highlight improvements made
- Plan for remaining work

---

## 🔒 Security & Privacy

**What We Collect:**
- ✅ Device hostnames, OS info, IP addresses
- ✅ Configuration check results
- ✅ User account information

**What We DON'T Collect:**
- ❌ File contents
- ❌ Personal user data on systems
- ❌ Passwords or credentials
- ❌ Network traffic

**Security Features:**
- 🔐 HTTPS encryption everywhere
- 🔐 JWT token authentication
- 🔐 Database encryption at rest
- 🔐 Role-based access control
- 🔐 Audit logging of all actions

---

## 📞 Need More Help?

- 📖 **Full User Guide**: See `USER_GUIDE.md`
- 📚 **API Documentation**: https://cis-audit-api.onrender.com/api/docs
- 🏗️ **Architecture**: See `docs/deployment/ARCHITECTURE.md`
- 📂 **Project Structure**: See `PROJECT_STRUCTURE.md`

---

## ✨ Next Steps

1. ✅ **Run your first scan** (see Step 2 above)
2. ✅ **View results** in dashboard
3. ✅ **Download PDF report** for your records
4. ✅ **Fix critical findings** first
5. ✅ **Schedule regular scans** for monitoring
6. ✅ **Invite team members** for collaboration
7. ✅ **Track compliance over time** with trend charts

---

**🎉 You're all set! Start securing your systems with CIS Benchmarks!**

**Dashboard**: https://cis-audit-dashboard.vercel.app  
**API**: https://cis-audit-api.onrender.com
