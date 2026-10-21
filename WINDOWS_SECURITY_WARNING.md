# 🛡️ Windows SmartScreen Warning - How to Handle

## What You're Seeing

When you download and run `cis-scanner-windows.exe`, Windows shows:

```
Windows protected your PC
Microsoft Defender SmartScreen prevented an unrecognized app from starting.
Running this app might put your PC at risk.

App: cis-scanner-windows (2).exe
Publisher: Unknown Publisher
```

## Why This Happens

This is **NORMAL** and expected for:
- ✅ Newly built executables
- ✅ Executables without code signing certificate
- ✅ Executables from "Unknown Publisher"

**This does NOT mean the file is dangerous!**

---

## How to Run the Scanner Anyway

### Option 1: Click "More info" → "Run anyway"

1. Click **"More info"** link
2. Click **"Run anyway"** button
3. Scanner will start normally

### Option 2: Right-click → Properties → Unblock

1. **Right-click** on `cis-scanner-windows.exe`
2. Select **"Properties"**
3. Check **"Unblock"** checkbox at the bottom
4. Click **"Apply"** → **"OK"**
5. Now double-click to run (no warning)

### Option 3: Add to Windows Defender Exclusions

1. Open **Windows Security** (search in Start menu)
2. Go to **"Virus & threat protection"**
3. Click **"Manage settings"**
4. Scroll to **"Exclusions"**
5. Click **"Add or remove exclusions"**
6. Click **"Add an exclusion"** → **"File"**
7. Browse to `cis-scanner-windows.exe`
8. Click **"Open"**
9. Now you can run without warnings

---

## Why We Can't Remove This Warning

### Code Signing Certificates Cost Money

To remove this warning permanently, we would need:
- **Code Signing Certificate**: $100-$400/year
- **EV (Extended Validation) Certificate**: $300-$800/year
- **Reputation Building**: Even with certificate, takes time

### For Free/Open Source Projects

Most free tools show this warning because:
- Developers don't want to pay annual certificate fees
- Users understand and accept it
- Alternative verification methods exist (open source, checksums)

---

## Is the Scanner Actually Safe?

### ✅ Yes, It's Safe Because:

1. **Open Source**: You can review the code
   - Source: `backend/agent/launcher.py`
   - Checks: `backend/agent/checks/windows.py`
   - Build: `backend/agent/build_launcher.py`

2. **No Malicious Behavior**:
   - ✅ Only **reads** system settings (doesn't modify)
   - ✅ Requires admin for reading security policies (read-only)
   - ✅ Doesn't install anything
   - ✅ Doesn't access personal files
   - ✅ Doesn't run in background
   - ✅ Deletes itself when you want

3. **What It Actually Does**:
   ```python
   # Read password policies
   subprocess.run(["net", "accounts"])
   
   # Check firewall status
   subprocess.run(["netsh", "advfirewall", "show", "allprofiles"])
   
   # Check Windows Updates
   Get-WindowsUpdateLog
   
   # Upload results to YOUR dashboard
   requests.post(api_url, json=results, headers={"Authorization": token})
   ```

4. **Transparent**:
   - All actions printed to console
   - Source code available on GitHub
   - No hidden network connections
   - Token-based authentication (you control access)

---

## Verifying the Scanner

### Method 1: Check File Hash (Advanced)

```powershell
# Get SHA256 hash of the downloaded file
Get-FileHash .\cis-scanner-windows.exe -Algorithm SHA256

# Compare with official hash (from GitHub releases or website)
```

### Method 2: Review Source Code

1. Go to: https://github.com/sumit-prajapat/cis-audit-dashboard
2. Navigate to: `backend/agent/launcher.py`
3. Review the code (it's only ~200 lines)
4. Check `checks/windows.py` for what it scans

### Method 3: Scan with Antivirus

```powershell
# Scan with Windows Defender
Start-MpScan -ScanPath "C:\Downloads\cis-scanner-windows.exe" -ScanType CustomScan
```

Most antivirus software will show **0 threats** because:
- No malicious code
- No suspicious behavior
- Standard Python executable built with PyInstaller

---

## What Data is Collected?

### ✅ Data Collected (Security Settings Only)

```json
{
  "hostname": "YOUR-PC-NAME",
  "os_type": "windows",
  "os_version": "10.0.26300",
  "ip_address": "192.168.1.100",
  "checks": [
    {
      "id": "WIN-PWD-001",
      "title": "Password Complexity Enabled",
      "status": "PASS",
      "expected_value": "Enabled",
      "actual_value": "Enabled"
    }
    // ... more security checks
  ]
}
```

### ❌ Data NOT Collected

- ❌ Passwords or credentials
- ❌ Personal files or documents
- ❌ Browser history
- ❌ Email contents
- ❌ Banking information
- ❌ Photos or videos
- ❌ Installed software list
- ❌ Network traffic
- ❌ Keystrokes

---

## Comparison with Other Tools

| Tool | SmartScreen Warning? | Safe? |
|------|---------------------|-------|
| **Python** | ✅ First time | ✅ Yes |
| **Node.js** | ✅ First time | ✅ Yes |
| **VS Code** (first release) | ✅ Yes | ✅ Yes |
| **Git for Windows** | ✅ First time | ✅ Yes |
| **Our Scanner** | ✅ Yes | ✅ Yes |

Even major software shows this warning when:
- First downloaded
- New version released
- Certificate expired

---

## For System Administrators

### Group Policy to Allow

If you're deploying to multiple machines:

1. **Create AppLocker Rule**:
   ```
   Publisher: N/A
   Path: C:\Path\To\cis-scanner-windows.exe
   File Hash: <SHA256 hash>
   Action: Allow
   ```

2. **Or Use Software Restriction Policies**:
   - Create hash rule for the EXE
   - Set to "Unrestricted"

3. **Or Disable SmartScreen for Specific Path**:
   ```powershell
   Set-MpPreference -AttackSurfaceReductionOnlyExclusions "C:\Tools\cis-scanner-windows.exe"
   ```

### Sign the EXE Yourself (Enterprise)

If your organization has a code signing certificate:

```powershell
# Sign with your certificate
signtool sign /f your-cert.pfx /p password /t http://timestamp.digicert.com cis-scanner-windows.exe

# Verify signature
signtool verify /pa cis-scanner-windows.exe
```

---

## Alternative: Build from Source

If you don't trust the pre-built EXE:

### Step 1: Install Python & Dependencies

```powershell
# Install Python 3.11+
winget install Python.Python.3.11

# Install dependencies
cd backend/agent
pip install -r requirements.txt
pip install pyinstaller
```

### Step 2: Build Your Own EXE

```powershell
# Build the scanner yourself
python build_launcher.py --windows

# Your EXE is now in: dist/cis-scanner-windows.exe
```

### Step 3: Run Your Own Build

```powershell
# Run the EXE you just built
cd dist
.\cis-scanner-windows.exe --token YOUR_TOKEN
```

**This will have the same SmartScreen warning** (unless you sign it with your own certificate).

---

## Understanding SmartScreen

### How SmartScreen Works

1. **Reputation-Based**: Checks file against Microsoft's cloud database
2. **Download Count**: New files = low reputation = warning
3. **Publisher**: Unsigned = "Unknown Publisher" = warning
4. **Age**: Older files with many downloads = higher reputation

### Building Reputation

To remove the warning naturally:
- Thousands of downloads over months/years
- No reported security issues
- Code signing certificate (paid)
- Microsoft validation (enterprise only)

### Why Even Safe Software Gets Flagged

```
New EXE → 0 downloads → Unknown → ⚠️ Warning
Same EXE → 10K downloads → Known → ✅ No warning
```

---

## FAQ

### Q: Will this warning ever go away?

**A:** Yes, but only if:
1. We buy a code signing certificate ($100-800/year)
2. Thousands of people download and run it (builds reputation)
3. Microsoft whitelists the file (very rare)

### Q: Does this mean the file has a virus?

**A:** No! It means:
- File is new (not widely downloaded yet)
- File is not signed with a paid certificate
- Windows is being cautious (which is good!)

### Q: Can I trust this more than other files?

**A:** Actually, yes because:
- Open source (you can review code)
- Specific purpose (security scanning)
- No persistence (doesn't install)
- No network code beyond API calls
- Token-based (you control access)

### Q: Should I be worried?

**A:** No, unless:
- You downloaded from unofficial source (not GitHub or official dashboard)
- File size is drastically different
- File hash doesn't match (if published)
- Your antivirus actually detects something (not just SmartScreen)

### Q: What if my company policy blocks it?

**A:** Options:
1. Ask IT to add exception (show them this document)
2. Run from USB/external drive (different security zone)
3. Use PowerShell version instead (no compilation needed)
4. Build from source on your machine
5. Request IT to sign the EXE with company certificate

---

## Quick Decision Tree

```
Downloaded cis-scanner-windows.exe?
│
├─ From official source (GitHub/Dashboard)? ─── YES ──→ ✅ Safe to run
│                                              │
│                                              NO ──→ ❌ Don't run, re-download
│
├─ Windows shows SmartScreen warning? ───────── Normal for new files
│
├─ Antivirus detects actual threat? ──────────  YES ──→ ❌ Don't run, report issue
│                                              │
│                                              NO ──→ ✅ Safe to run
│
└─ Click "More info" → "Run anyway" ─────────── ✅ Scanner starts
```

---

## Trust Indicators

### ✅ Good Signs

- Downloaded from official GitHub repo
- File size: ~14-15 MB (PyInstaller bundle)
- Console window shows during execution
- Asks for admin permissions (needs it for security checks)
- Exits when done (doesn't stay running)
- No unexpected network connections
- Source code matches binary behavior

### ❌ Red Flags (Report These!)

- Downloaded from random website
- File size very different (<5 MB or >50 MB)
- Runs silently (no console window)
- Stays running after scan
- Makes unexpected network connections
- Asks for passwords or credentials
- Modifies system files
- Real antivirus (not SmartScreen) detects threat

---

## Contact & Reporting

### Report Security Issues

- **GitHub Issues**: https://github.com/sumit-prajapat/cis-audit-dashboard/issues
- **Email**: security@your-domain.com (if available)

### Get Help

- **Documentation**: See `HOW_TO_RUN_SCANNER.md`
- **Troubleshooting**: See `SCANNER_FIXED_SUMMARY.md`

---

## Summary

🛡️ **Windows SmartScreen warning is NORMAL for this scanner**

✅ **The scanner is safe** - It's open source and only reads security settings

🔧 **To run**: Click "More info" → "Run anyway"

📖 **To verify**: Check source code on GitHub

🎯 **Purpose**: Scan Windows security compliance (CIS benchmarks)

---

**Bottom line: The warning is annoying but doesn't mean the file is dangerous. Click "Run anyway" and continue with your scan!** 🚀
