# ⚡ Quick Scanner Commands

## Option 1: Use the Batch Script (Easiest)

1. **Right-click** on `run-scanner.bat`
2. Select **"Run as administrator"**
3. Wait for scan to complete (30-60 seconds)
4. Check dashboard for results

---

## Option 2: Use PowerShell Script

1. **Right-click** on PowerShell
2. Select **"Run as administrator"**
3. Run:
   ```powershell
   cd "d:\projects\cis-audit-dashboard"
   .\run-scanner.ps1
   ```

---

## Option 3: Manual Commands (Copy-Paste)

### Step 1: Open PowerShell as Administrator

1. Press **Win + X**
2. Select **"Windows PowerShell (Admin)"** or **"Terminal (Admin)"**

### Step 2: Navigate to Downloads

```powershell
cd $env:USERPROFILE\Downloads
```

### Step 3: Set Token

```powershell
$env:CIS_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtazEzMTFzdXNlQGdtYWlsLmNvbSIsImV4cCI6MTc2MTE5NjYwNH0.MDpsUTKymP7SfFWuLmzWm_TMgsramWm6uERK5gI8E"
```

### Step 4: Download Scanner (if not already downloaded)

```powershell
Invoke-WebRequest -Uri "https://cis-audit-api.onrender.com/api/v1/downloads/agent/windows" -OutFile "cis-scanner-windows.exe"
```

### Step 5: Run Scanner

```powershell
.\cis-scanner-windows.exe
```

---

## Option 4: One-Line Command (Quick!)

Open **PowerShell as Administrator** and run:

```powershell
cd $env:USERPROFILE\Downloads; $env:CIS_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtazEzMTFzdXNlQGdtYWlsLmNvbSIsImV4cCI6MTc2MTE5NjYwNH0.MDpsUTKymP7SfFWuLmzWm_TMgsramWm6uERK5gI8E"; Invoke-WebRequest -Uri "https://cis-audit-api.onrender.com/api/v1/downloads/agent/windows" -OutFile "cis-scanner-windows.exe"; .\cis-scanner-windows.exe
```

---

## Option 5: Using CMD (Command Prompt)

Open **Command Prompt as Administrator** and run:

```cmd
cd %USERPROFILE%\Downloads
set CIS_TOKEN=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtazEzMTFzdXNlQGdtYWlsLmNvbSIsImV4cCI6MTc2MTE5NjYwNH0.MDpsUTKymP7SfFWuLmzWm_TMgsramWm6uERK5gI8E
cis-scanner-windows.exe
```

---

## What You'll See

### During Scan:
```
🔍 CIS Security Scanner
📊 Checking system compliance...
✓ Checking password policies
✓ Checking firewall settings
✓ Checking user accounts
✓ Checking system updates
...
✅ Scan complete!
📤 Uploading results...
✅ Results uploaded successfully!
```

### After Scan:
- Go to: https://cis-audit-dashboard.vercel.app
- Navigate to: **Scans** page
- You should see your new scan result
- Click on it to view detailed findings

---

## Troubleshooting

### Error: "Access Denied" or "Permission Denied"

**Solution**: Run PowerShell or CMD as **Administrator**

1. Press **Win + X**
2. Select **"Terminal (Admin)"** or **"PowerShell (Admin)"**

### Error: "Cannot download file"

**Solution**: Check internet connection or download manually

1. Go to: https://cis-audit-api.onrender.com/api/v1/downloads/agent/windows
2. Save to Downloads folder
3. Run with token set

### Error: "Token expired" or "Unauthorized"

**Solution**: Get fresh token from dashboard

1. Go to: https://cis-audit-dashboard.vercel.app/quick-scan
2. Copy the new token from Step 3
3. Replace token in command

### Scanner doesn't run

**Solution**: Check Windows Defender

1. Windows might block the scanner
2. Click "More info" → "Run anyway"
3. Or temporarily disable Windows Defender

---

## Quick Reference

| What | Command |
|------|---------|
| **Open Admin PowerShell** | Win + X → Terminal (Admin) |
| **Go to Downloads** | `cd $env:USERPROFILE\Downloads` |
| **Set Token** | `$env:CIS_TOKEN="<your_token>"` |
| **Run Scanner** | `.\cis-scanner-windows.exe` |
| **Check Results** | https://cis-audit-dashboard.vercel.app/scans |

---

## Your Token (Current)

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtazEzMTFzdXNlQGdtYWlsLmNvbSIsImV4cCI6MTc2MTE5NjYwNH0.MDpsUTKymP7SfFWuLmzWm_TMgsramWm6uERK5gI8E
```

**Note**: This token might expire. Get fresh token from:
https://cis-audit-dashboard.vercel.app/quick-scan

---

## Recommended Method

**🎯 Use Option 1 (Batch Script) - It's the easiest!**

Just right-click `run-scanner.bat` → Run as administrator

That's it! 🚀
