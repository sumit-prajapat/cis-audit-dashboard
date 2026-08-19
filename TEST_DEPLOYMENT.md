# 🔍 DEPLOYMENT TROUBLESHOOTING

## Issue Analysis

You said you added `VITE_API_URL` in Vercel and redeployed, but still getting "Network Error".

## Possible Root Causes

### 1. ❌ Environment Variable Not Applied
**Symptom**: Same error after redeploy  
**Cause**: Vercel didn't pick up the environment variable

**Verify**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Confirm `VITE_API_URL` is listed with value: `https://mk1311-cis-audit-api.hf.space`
3. Check if it's enabled for **Production** environment
4. Look at deployment logs - should show environment variable during build

**Fix**:
- Delete the variable and re-add it
- Make sure to select "Production" checkbox
- Redeploy from Deployments tab, not just push to Git

---

### 2. ❌ Backend Blocking Requests (TrustedHostMiddleware)
**Symptom**: Frontend can't reach backend  
**Cause**: Backend's TrustedHostMiddleware only allows localhost

**I JUST FIXED THIS** in `backend/main.py`:
- Changed TrustedHostMiddleware to allow all hosts in production
- This was blocking Hugging Face Space requests

**You need to**:
1. Commit and push the changes I just made to `backend/main.py`
2. Hugging Face Space will auto-rebuild

---

### 3. ❌ CORS Issues
**Symptom**: CORS error in browser console  
**Cause**: Backend not allowing Vercel origin

**Status**: Already configured correctly in backend
- `https://cis-audit-dashboard.vercel.app` is in CORS origins
- Should not be the issue

---

### 4. ❌ Cookie/CSRF Issues
**Symptom**: Login seems to work but then fails  
**Cause**: Cross-origin cookie settings

**Status**: Already configured for production
- `COOKIE_SECURE=true`
- `COOKIE_SAMESITE=none` 
- Should work for cross-origin

---

## 🔧 REQUIRED ACTIONS

### Action 1: Push Backend Fix (CRITICAL)
The TrustedHostMiddleware fix I just made MUST be deployed to Hugging Face:

```bash
cd d:\projects\cis-audit-dashboard
git add backend/main.py
git commit -m "Fix: Allow all hosts in production (TrustedHostMiddleware)"
git push origin main
```

After pushing, Hugging Face Space will auto-rebuild (takes 2-3 minutes).

---

### Action 2: Verify Vercel Environment Variable

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Check**:
- [ ] Variable name is EXACTLY: `VITE_API_URL` (case-sensitive!)
- [ ] Value is EXACTLY: `https://mk1311-cis-audit-api.hf.space` (no trailing slash!)
- [ ] Environment is checked: **Production** ✅
- [ ] Variable is not hidden/secret (should be visible)

If anything is wrong:
1. Delete the variable
2. Add it again with correct values
3. Make sure "Production" is checked
4. Click Save

---

### Action 3: Force Redeploy on Vercel

After confirming env var is correct:

1. Go to: Deployments tab
2. Find latest deployment
3. Click 3-dot menu → **Redeploy**
4. **IMPORTANT**: Check "Use existing Build Cache" is **UNCHECKED**
5. Click Redeploy
6. Wait for build to complete (1-2 minutes)
7. Check build logs - should see: "Environment: production"

---

### Action 4: Test Backend Directly

Before testing frontend, verify backend is working:

**Test 1: Health Check**
```bash
curl https://mk1311-cis-audit-api.hf.space/health
```
Expected: `{"status":"alive"}`

**Test 2: Registration (Direct API Call)**
```bash
curl -X POST https://mk1311-cis-audit-api.hf.space/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPassword123!@#",
    "full_name": "Test User",
    "org_name": "Test Org"
  }'
```

Expected: Should return user object with `access_token`

**Test 3: CORS Preflight**
```bash
curl -X OPTIONS https://mk1311-cis-audit-api.hf.space/auth/login \
  -H "Origin: https://cis-audit-dashboard.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -v
```

Expected: Should see `Access-Control-Allow-Origin: https://cis-audit-dashboard.vercel.app` in response headers

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console
1. Open: https://cis-audit-dashboard.vercel.app/register
2. Press F12 (open DevTools)
3. Go to Console tab
4. Look for errors

**What to check**:
- Is there a URL in the error? What is it?
- Is it trying to connect to `https://mk1311-cis-audit-api.hf.space`?
- Or is it trying to connect to empty URL (`http://` or `undefined`)?

If it shows empty URL or `undefined`:
→ Environment variable NOT in build

If it shows correct URL but fails:
→ Backend issue (CORS, TrustedHost, etc.)

---

### Step 2: Check Network Tab
1. Stay in DevTools
2. Go to Network tab
3. Try to register
4. Look at failed request

**What to check**:
- **Request URL**: Should be `https://mk1311-cis-audit-api.hf.space/auth/register`
- **Status**: What HTTP status code? (0, 404, 403, 500?)
- **Headers**: Check request headers
- **Response**: What does server say?

**Status Code Meanings**:
- `0` or `(failed)` = Can't reach server (network/CORS issue)
- `404` = Wrong URL
- `403` = Blocked by server (TrustedHost issue)
- `422` = Validation error (backend got request but data invalid)
- `500` = Server error

---

### Step 3: Check Built Files (Advanced)
If you want to verify the env var is in the build:

1. Go to Vercel deployment
2. Click on the deployment
3. Look at "Source" or view the built files
4. Check if any JS file contains the Hugging Face URL

OR:

1. Open: https://cis-audit-dashboard.vercel.app
2. View page source (Ctrl+U)
3. Look at the JavaScript files
4. Search for "mk1311" or "hf.space"
5. If found → env var is in build ✅
6. If not found → env var NOT in build ❌

---

## 🚨 Most Likely Issues

Based on your description ("added env var and redeployed but same issue"):

### Most Likely: TrustedHostMiddleware Blocking (99% probability)
The backend change I just made **MUST be deployed** to Hugging Face. 

**The old code** was:
```python
if os.getenv("APP_ENV") != "test":
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"])
```

This BLOCKS all production requests because Hugging Face host is NOT "localhost"!

**The new code** (I just fixed):
```python
if os.getenv("APP_ENV") == "development":
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["localhost", "127.0.0.1"])
elif os.getenv("APP_ENV") != "test":
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["*"])
```

This allows all hosts in production.

**YOU MUST**:
```bash
git add backend/main.py
git commit -m "Fix TrustedHostMiddleware for production"
git push
```

Then wait 2-3 minutes for Hugging Face to rebuild.

---

### Also Possible: Env Var Not Applied (20% probability)
Vercel might not have picked up the environment variable.

**Try this**:
1. Go to Vercel → Settings → Environment Variables
2. **DELETE** the `VITE_API_URL` variable
3. **WAIT 10 seconds**
4. **ADD IT BACK**:
   - Name: `VITE_API_URL`
   - Value: `https://mk1311-cis-audit-api.hf.space`
   - Environment: Production ✅, Preview ✅, Development ✅ (check ALL)
5. Save
6. Go to Deployments
7. **Trigger new deployment**:
   - Either: Click Redeploy on latest
   - Or: Make a small change to code and push to trigger new build

---

## ✅ Success Verification

After deploying backend fix and redeploying frontend:

### Test 1: Backend Health
```bash
curl https://mk1311-cis-audit-api.hf.space/health
```
Should return: `{"status":"alive"}`

### Test 2: Frontend Loads
Open: https://cis-audit-dashboard.vercel.app/register
- Page should load
- No "Network Error" immediately

### Test 3: Registration
Fill form and submit:
- Should show loading spinner
- Should redirect to dashboard (or show success)
- NO "Network Error"

### Test 4: Check Console (F12)
- No red errors
- No CORS errors
- No "Network Error" messages

---

## 📝 Summary of Changes I Made

### File: `backend/main.py`
**Changed**: TrustedHostMiddleware configuration
**Before**: Only allowed localhost (blocked production)
**After**: Allows all hosts in production

**Impact**: This was preventing backend from accepting any requests from Hugging Face Space itself!

---

## 🆘 If Still Not Working

After doing BOTH actions (push backend + redeploy frontend):

1. **Send me the exact error message** from browser console
2. **Send me the Network tab** screenshot showing the failed request
3. **Tell me**:
   - What URL is it trying to connect to?
   - What HTTP status code?
   - What does the response say?

Then I can identify the EXACT issue.

---

## 📞 Quick Checklist

- [ ] Push backend changes to GitHub
- [ ] Wait for Hugging Face to rebuild (2-3 min)
- [ ] Verify Vercel env var is correct
- [ ] Redeploy frontend on Vercel
- [ ] Test backend health endpoint
- [ ] Test frontend registration
- [ ] Check browser console for errors

**Do all these steps, then test again!**
