# 🔍 CIS Scanning Options - Easy Methods

Multiple ways to scan your systems - choose what works best for you!

---

## 🎯 Quick Comparison

| Method | Difficulty | Best For | Setup Time |
|--------|-----------|----------|------------|
| **Web Dashboard Scan** | ⭐ Easy | Single Windows PC | 2 minutes |
| **One-Click Installer** | ⭐⭐ Medium | Multiple systems | 5 minutes |
| **Docker Agent** | ⭐⭐ Medium | Servers with Docker | 3 minutes |
| **Cloud Connector** | ⭐⭐⭐ Advanced | AWS/Azure/GCP | 10 minutes |
| **Python Script** | ⭐⭐⭐ Advanced | Custom setups | 5 minutes |

---

## 🌐 Option 1: Web Dashboard Scan (Easiest!)

**Best for:** Windows PCs, one-time scans, testing

### How It Works:
1. Go to dashboard
2. Click "Scan This Computer"
3. Download tiny launcher (1 MB)
4. Run launcher
5. Results appear automatically

### Step-by-Step:

#### For Windows:

1. **Go to Dashboard**
   - Open: https://cis-audit-dashboard.vercel.app/dashboard

2. **Click "Quick Scan" Button**
   - Located in top-right corner
   - Or go to: https://cis-audit-dashboard.vercel.app/quick-scan

3. **Download Launcher**
   ```
   File: cis-scanner-windows.exe (1.2 MB)
   ```

4. **Run the Launcher**
   - Double-click `cis-scanner-windows.exe`
   - Windows Defender may ask for confirmation (click "Allow")
   - Launcher auto-detects your login token from browser

5. **Scan Runs Automatically**
   ```
   🛡️  CIS Quick Scan Starting...
   📊 Running checks... [████████████] 100%
   ✅ Complete! View results in dashboard.
   ```

6. **View Results**
   - Automatically opens dashboard
   - Results appear in 5 seconds

✅ **Benefits:**
- No Python installation needed
- No command line
- Auto-authenticates from browser
- One-click operation

---

## 📦 Option 2: One-Click Agent Installer

**Best for:** Installing on multiple systems, automated scanning

### Windows Installer:

```powershell
# Download installer
Invoke-WebRequest -Uri "https://cis-audit-api.onrender.com/downloads/install-windows.ps1" -OutFile install.ps1

# Run installer (as Administrator)
powershell -ExecutionPolicy Bypass -File install.ps1
```

**What it does:**
1. ✅ Installs CIS agent to `C:\Program Files\CIS-Agent`
2. ✅ Creates Windows service (auto-starts on boot)
3. ✅ Adds to startup
4. ✅ Configures daily scans (2 AM)
5. ✅ Registers with your dashboard account

**Interactive Setup:**
```
🛡️  CIS Agent Installer

Enter your details:
  Email: your@email.com
  Password: ********
  Scan Schedule: [Daily at 2 AM]

Installing...
✅ Agent installed successfully!
✅ Service created: CIS-Agent-Service
✅ First scan scheduled for: 2026-08-22 02:00

Dashboard: https://cis-audit-dashboard.vercel.app
```

### Linux Installer:

```bash
# Download and run installer
curl -fsSL https://cis-audit-api.onrender.com/downloads/install-linux.sh | sudo bash
```

**Interactive Setup:**
```bash
sudo cis-agent setup
# Follow prompts to enter credentials and schedule
```

✅ **Benefits:**
- One command installation
- Automatic scheduling
- Runs in background
- No manual intervention needed

---

## 🐳 Option 3: Docker Agent (Recommended for Servers)

**Best for:** Servers, containerized environments, DevOps teams

### Quick Start:

```bash
# Pull the agent image
docker pull ghcr.io/your-username/cis-agent:latest

# Run scan (one-time)
docker run --rm \
  -e CIS_EMAIL="your@email.com" \
  -e CIS_PASSWORD="your_password" \
  -e CIS_API_URL="https://cis-audit-api.onrender.com" \
  --privileged \
  ghcr.io/your-username/cis-agent:latest
```

### With Docker Compose:

```yaml
# docker-compose.agent.yml
version: '3.8'

services:
  cis-agent:
    image: ghcr.io/your-username/cis-agent:latest
    container_name: cis-agent
    privileged: true
    environment:
      - CIS_TOKEN=${CIS_TOKEN}
      - CIS_API_URL=https://cis-audit-api.onrender.com
      - SCAN_SCHEDULE=0 2 * * *  # Daily at 2 AM
    volumes:
      - /:/host:ro  # Read-only access to host system
    restart: unless-stopped
```

**Run:**
```bash
# Set your token
export CIS_TOKEN="your-access-token"

# Start agent
docker-compose -f docker-compose.agent.yml up -d

# View logs
docker-compose -f docker-compose.agent.yml logs -f
```

✅ **Benefits:**
- Isolated environment
- Easy updates (pull new image)
- Portable across systems
- Integrates with existing Docker workflows

---

## ☁️ Option 4: Cloud Connector

**Best for:** AWS, Azure, GCP infrastructure, cloud-native deployments

### AWS (Using SSM):

```bash
# Install agent on EC2 instances via Systems Manager

# 1. Create SSM document
aws ssm create-document \
  --name "CIS-Agent-Install" \
  --document-type "Command" \
  --content file://ssm-install-cis.json

# 2. Run on all instances with tag "scan:enabled"
aws ssm send-command \
  --document-name "CIS-Agent-Install" \
  --targets "Key=tag:scan,Values=enabled" \
  --parameters "token=YOUR_TOKEN,apiUrl=https://cis-audit-api.onrender.com"
```

### Azure (Using Custom Script Extension):

```bash
# Deploy agent to Azure VMs

az vm extension set \
  --resource-group YourResourceGroup \
  --vm-name YourVM \
  --name CustomScriptExtension \
  --publisher Microsoft.Compute \
  --settings '{"fileUris": ["https://cis-audit-api.onrender.com/downloads/install-linux.sh"]}' \
  --protected-settings '{"commandToExecute": "bash install-linux.sh --token YOUR_TOKEN"}'
```

### Kubernetes Deployment:

```yaml
# cis-agent-daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: cis-agent
  namespace: security
spec:
  selector:
    matchLabels:
      app: cis-agent
  template:
    metadata:
      labels:
        app: cis-agent
    spec:
      hostNetwork: true
      hostPID: true
      containers:
      - name: cis-agent
        image: ghcr.io/your-username/cis-agent:latest
        securityContext:
          privileged: true
        env:
        - name: CIS_TOKEN
          valueFrom:
            secretKeyRef:
              name: cis-credentials
              key: token
        - name: CIS_API_URL
          value: "https://cis-audit-api.onrender.com"
        - name: SCAN_SCHEDULE
          value: "0 2 * * *"
        volumeMounts:
        - name: host-root
          mountPath: /host
          readOnly: true
      volumes:
      - name: host-root
        hostPath:
          path: /
```

**Deploy:**
```bash
# Create secret
kubectl create secret generic cis-credentials \
  --from-literal=token=YOUR_TOKEN \
  -n security

# Deploy daemonset
kubectl apply -f cis-agent-daemonset.yaml

# Verify
kubectl get pods -n security
```

✅ **Benefits:**
- Centralized deployment
- Scales to hundreds/thousands of servers
- Integrates with cloud-native tools
- Automated updates

---

## 🔐 Option 5: Agentless Scan (Remote)

**Best for:** Systems you can SSH/RDP into but can't install software

### SSH-Based Scan (Linux):

From your dashboard or local machine:

```bash
# Scan remote Linux server via SSH
curl -fsSL https://cis-audit-api.onrender.com/downloads/remote-scan.sh | \
  ssh user@remote-host "bash -s -- --token YOUR_TOKEN"
```

**What happens:**
1. Script uploads to remote system
2. Runs checks
3. Sends results to API
4. Cleans up (no files left behind)

### PowerShell Remoting (Windows):

```powershell
# Scan remote Windows server
Invoke-Command -ComputerName RemoteServer -ScriptBlock {
  $token = "YOUR_TOKEN"
  $url = "https://cis-audit-api.onrender.com"
  
  # Download and run scanner
  Invoke-WebRequest "$url/downloads/scanner.ps1" -OutFile scanner.ps1
  powershell -ExecutionPolicy Bypass -File scanner.ps1 -Token $token -ApiUrl $url
  Remove-Item scanner.ps1
}
```

✅ **Benefits:**
- No permanent installation
- Scan systems without modifying them
- Great for compliance audits
- Quick one-time checks

---

## 📱 Option 6: Mobile App Triggered Scan

**Best for:** On-the-go scanning, field technicians

### How It Works:

1. **Install Mobile App** (future feature)
   - iOS/Android app
   - Login with dashboard credentials

2. **Generate QR Code**
   - Dashboard → Quick Scan → Generate QR
   - Shows QR code on screen

3. **Scan QR on Target Computer**
   - Point phone camera at screen
   - App triggers scan on that computer
   - Results appear in app and dashboard

4. **Alternative: SMS Trigger**
   - Text "SCAN" to your device number
   - Registered devices run scan immediately
   - Get SMS back with results

✅ **Benefits:**
- Remote triggering
- No physical access needed
- Real-time notifications
- Great for distributed teams

---

## 🎯 Recommended Setup by Use Case

### Home User / Small Office
✅ **Use:** Web Dashboard Scan (Option 1)
- Easiest to use
- No installation
- Perfect for 1-5 computers

### IT Department / SMB
✅ **Use:** One-Click Installer (Option 2)
- Install once on each system
- Automated daily scans
- Minimal maintenance

### DevOps / Cloud Teams
✅ **Use:** Docker Agent (Option 3) + Cloud Connector (Option 4)
- Containerized deployment
- Scales easily
- CI/CD integration

### Enterprise / Large Scale
✅ **Use:** Cloud Connector (Option 4) + Agentless (Option 5)
- Centralized management
- Thousands of systems
- Compliance-focused

### Security Auditors
✅ **Use:** Agentless Scan (Option 5)
- No installation needed
- Quick assessment
- Non-invasive

---

## 🛠️ Implementation Roadmap

Here's what we'll build to enable these options:

### Phase 1: Web Dashboard Scan (Week 1-2)
- [ ] Create Windows/Linux launcher executables
- [ ] Add "Quick Scan" button to dashboard
- [ ] Build token auto-detection from browser
- [ ] Package agent as portable executable

### Phase 2: Installers (Week 3-4)
- [ ] Create Windows MSI installer
- [ ] Create Linux deb/rpm packages
- [ ] Build installer scripts (PowerShell, Bash)
- [ ] Add Windows service wrapper
- [ ] Create systemd service for Linux

### Phase 3: Docker & Cloud (Week 5-6)
- [ ] Build Docker image
- [ ] Publish to GitHub Container Registry
- [ ] Create Kubernetes manifests
- [ ] Write AWS/Azure deployment scripts
- [ ] Document cloud connector setup

### Phase 4: Remote Scan (Week 7)
- [ ] Create agentless SSH scan script
- [ ] Build PowerShell remoting version
- [ ] Add cleanup/no-trace mode
- [ ] Test on various Linux distros

### Phase 5: Mobile (Future)
- [ ] Design mobile app
- [ ] QR code trigger system
- [ ] SMS integration
- [ ] Push notifications

---

## 💻 Quick Implementation: Web Dashboard Scan

Let me create the foundation for the easiest option right now:

### Files to Create:

1. **`frontend/src/pages/QuickScan.jsx`** - Dashboard scan page
2. **`backend/routes/downloads.py`** - Serve launcher files
3. **`agent/build-launcher.py`** - Build portable executables
4. **`agent/launcher.py`** - Minimal launcher script

This will let users:
- Click "Quick Scan" button in dashboard
- Download tiny launcher (auto-authenticated)
- Run scan with one click
- See results immediately

---

## 🚀 Want me to implement the Web Dashboard Scan now?

I can create:
1. ✅ Quick Scan page in dashboard
2. ✅ Downloadable Windows launcher
3. ✅ Auto-token detection
4. ✅ One-click scan execution

This will make scanning **10x easier** than the current Python script method!

Should I proceed with implementation?
