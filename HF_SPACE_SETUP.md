# 🚀 HUGGING FACE SPACE SETUP GUIDE

## 🐛 ISSUE IDENTIFIED

Your Hugging Face Space is returning `{"detail": "Not Found"}` for `/health` because:
1. **The Space is running old code** (not synced with GitHub)
2. **Missing proper Hugging Face configuration files**

## ✅ WHAT I FIXED

I just pushed the following files to properly configure Hugging Face Spaces:

### 1. **Dockerfile** (CRITICAL)
Hugging Face Spaces looks for this file to build your container:
- Uses Python 3.11
- Installs all dependencies from `backend/requirements.txt`
- Runs on port 7860 (HF Spaces requirement)
- Includes health checks
- Sets production environment

### 2. **.space.yaml**
Configuration metadata for HF Spaces:
- SDK: docker
- Port: 7860
- Title and emoji

### 3. **requirements.txt** (root level)
Copy of backend requirements for HF to detect dependencies

### 4. **backend/app.py**
Entry point that HF might look for

### 5. **backend/start.sh**
Alternative startup script

### 6. **README-HF-SPACE.md**
Documentation with HF Space metadata

---

## 🔧 HUGGING FACE SPACE CONFIGURATION

### Step 1: Check if Space is Linked to GitHub

1. Go to: https://huggingface.co/spaces/mk1311/cis-audit-api
2. Click **Settings** tab
3. Look for **"Repository"** section
4. Check if it's linked to: `https://github.com/sumit-prajapat/cis-audit-dashboard`

**If NOT linked**:
- Click "Link to GitHub" or "Connect Repository"
- Select your GitHub repo
- Enable automatic sync

**If already linked**:
- Space should auto-rebuild from the push I just made
- Look for "Building..." status

---

### Step 2: Force Rebuild (If Needed)

If the Space doesn't auto-rebuild:

1. Go to Space Settings
2. Look for "Factory reboot" or "Rebuild" button
3. Click it to force rebuild
4. Wait 3-5 minutes

---

### Step 3: Check Build Logs

1. Go to your Space page
2. Click "Logs" or "Container logs" tab
3. Look for errors during build
4. Check if it's using the new Dockerfile

**What to look for**:
- `Building...` status
- `Installing requirements...`
- `Starting uvicorn on 0.0.0.0:7860`
- `Application startup complete`

**Common errors**:
- Missing environment variables (DATABASE_URL, SECRET_KEY)
- Python package installation failures
- Port binding issues

---

## 🔑 REQUIRED ENVIRONMENT VARIABLES

Hugging Face Space needs these variables set in **Space Settings → Variables**:

### Critical Variables
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-secret-key-here
APP_ENV=production
```

### Optional Variables
```bash
FRONTEND_URL=https://cis-audit-dashboard.vercel.app
ALLOWED_ORIGINS=https://cis-audit-dashboard.vercel.app
COOKIE_SECURE=true
COOKIE_SAMESITE=none
RESEND_API_KEY=your-resend-key (optional)
STRIPE_SECRET_KEY=your-stripe-key (optional)
```

---

## 📋 COMPLETE SETUP CHECKLIST

### On Hugging Face Spaces:

- [ ] Space is linked to GitHub repository
- [ ] Environment variables are set (DATABASE_URL, SECRET_KEY)
- [ ] Space has rebuilt after latest push
- [ ] Logs show "Application startup complete"
- [ ] Space status shows "Running" (not "Building" or "Error")

### Test Endpoints:

After rebuild completes, test these URLs:

- [ ] Root: https://mk1311-cis-audit-api.hf.space/
  - Should return: `{"status":"ok","message":"CIS Audit SaaS API v3.0.0..."}`

- [ ] Health: https://mk1311-cis-audit-api.hf.space/health
  - Should return: `{"status":"alive"}`

- [ ] Ready: https://mk1311-cis-audit-api.hf.space/health/ready
  - Should return: `{"status":"ready","database":"connected"}`

- [ ] Docs: https://mk1311-cis-audit-api.hf.space/api/docs
  - Should show Swagger UI

---

## 🚨 IF SPACE STILL SHOWS "NOT FOUND"

### Option 1: Manual Rebuild
1. Go to Space Settings
2. Click "Factory reboot" or "Restart"
3. Wait for rebuild

### Option 2: Check if Files are in Correct Location
The Dockerfile expects files in this structure:
```
/
├── Dockerfile (root level - ✅ just added)
├── .space.yaml (root level - ✅ just added)
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── database.py
│   └── ... (all backend files)
```

### Option 3: Check Environment Variables
If the Space builds but endpoints fail:
- DATABASE_URL might be wrong
- SECRET_KEY might be missing
- Check Space logs for connection errors

### Option 4: Verify Port Configuration
Hugging Face Spaces MUST run on port 7860:
- Dockerfile CMD: `uvicorn main:app --host 0.0.0.0 --port 7860`
- .space.yaml: `app_port: 7860`

---

## 🔍 DEBUGGING STEPS

### Check Current Status
```bash
# Test if Space is responding at all
curl https://mk1311-cis-audit-api.hf.space/

# Test health endpoint
curl https://mk1311-cis-audit-api.hf.space/health

# Check if API docs are accessible
curl https://mk1311-cis-audit-api.hf.space/api/docs
```

### Read Space Logs
1. Go to HF Space page
2. Click "Logs" tab
3. Look for:
   - Build errors
   - Runtime errors
   - Port binding issues
   - Database connection failures

### Common Error Messages:

**"Detail: Not Found"**
- Endpoint doesn't exist in current code
- Space hasn't rebuilt with new code
- Routes not properly registered

**"Internal Server Error"**
- Database connection failed
- Missing environment variables
- Python exception in code

**"Service Unavailable"**
- Space is building
- Container crashed
- Out of resources

---

## ⏱️ TIMELINE

| Time | Action |
|------|--------|
| Now | ✅ Pushed HF configuration files to GitHub |
| +1 min | 🔄 HF Space detects GitHub push |
| +2 min | 🏗️ Space starts rebuilding |
| +3-5 min | ⏳ Installing dependencies |
| +5-7 min | ✅ Space running with new code |
| +7 min | 🧪 Test endpoints - should work! |

---

## 🎯 EXPECTED OUTCOME

After Space rebuilds (5-7 minutes):

### Root Endpoint (/)
```bash
curl https://mk1311-cis-audit-api.hf.space/
```
Returns:
```json
{
  "status": "ok",
  "message": "CIS Audit SaaS API v3.0.0 - Production Ready",
  "version": "3.0.0",
  "environment": "production",
  "features": [
    "Multi-Tenancy",
    "RBAC",
    "Audit Logging",
    "Service Layer Architecture",
    "Enterprise Error Handling",
    "Database Migrations (Alembic)"
  ]
}
```

### Health Endpoint (/health)
```bash
curl https://mk1311-cis-audit-api.hf.space/health
```
Returns:
```json
{
  "status": "alive"
}
```

### Readiness Endpoint (/health/ready)
```bash
curl https://mk1311-cis-audit-api.hf.space/health/ready
```
Returns:
```json
{
  "status": "ready",
  "database": "connected"
}
```

---

## 🆘 IF STILL NOT WORKING AFTER 10 MINUTES

### Send Me:
1. **Screenshot** of Hugging Face Space main page (showing status)
2. **Screenshot** of Space Logs tab
3. **Screenshot** of Space Settings → Variables page
4. **Tell me**: Is the Space linked to your GitHub repo?
5. **Tell me**: What status does the Space show? (Building/Running/Error)

### Alternative: Create New Space
If the current Space is misconfigured, we can:
1. Create a brand new HF Space from scratch
2. Link it to your GitHub repo
3. Set environment variables
4. Let it build with the correct Dockerfile

---

## 📝 SUMMARY

**What was wrong**:
- Hugging Face Space didn't have proper Docker configuration
- Space was running old/different code
- Missing configuration files (.space.yaml, Dockerfile)

**What I fixed**:
- ✅ Added proper Dockerfile for HF Spaces
- ✅ Added .space.yaml configuration
- ✅ Added all necessary setup files
- ✅ Pushed everything to GitHub

**What happens next**:
1. Space detects GitHub push (automatic)
2. Space rebuilds with new Dockerfile (5-7 min)
3. Health endpoints start working
4. Frontend can connect to backend
5. Everything works! 🎉

---

## ⚡ QUICK FIX COMMANDS

```bash
# Test all endpoints after rebuild
curl https://mk1311-cis-audit-api.hf.space/
curl https://mk1311-cis-audit-api.hf.space/health
curl https://mk1311-cis-audit-api.hf.space/health/ready
curl https://mk1311-cis-audit-api.hf.space/api/docs
```

---

**Status**: ✅ All HF Space configuration files pushed  
**Next**: Wait 5-7 minutes for Space to rebuild  
**Then**: Test health endpoints - should work!  
**Finally**: Test frontend → backend connection 🚀
