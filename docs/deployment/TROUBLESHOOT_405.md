# 🔧 Troubleshooting 405 Error - Complete Guide

**Error**: "Request failed with status code 405"  
**When**: Trying to register a new user  
**Status**: Backend is live, frontend can't reach it

---

## 🎯 ROOT CAUSE

Your backend IS deployed and working on Render.com at:
```
https://cis-audit-api.onrender.com
```

BUT your frontend on Vercel doesn't know this URL exists!

The frontend is trying to make requests to **relative URLs** (like `/auth/register`) which Vercel can't handle, resulting in **405 Method Not Allowed**.

---

## ✅ THE FIX (3 Steps, 3 Minutes)

### Step 1: Add Environment Variable in Vercel

1. Go to: https://vercel.com/dashboard
2. Click your project: **cis-audit-dashboard**
3. Go to: **Settings** → **Environment Variables**
4. Click: **"Add New"**
5. Enter:
   ```
   Name: VITE_API_URL
   Value: https://cis-audit-api.onrender.com
   ```
6. Check **ALL THREE** environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
7. Click: **"Save"**

### Step 2: Clean Up Old Variables

Delete these if they exist (they're not needed):
- `DATABASE_URL`
- `SECRET_KEY`
- `APP_ENV`
- `FRONTEND_URL`
- `ALLOWED_ORIGINS`
- `COOKIE_SECURE`
- `COOKIE_SAMESITE`
- Any `POSTGRES_*` or `SUPABASE_*` variables

### Step 3: Redeploy Frontend

1. Go to: **Deployments** tab
2. Click **"..."** on latest deployment
3. Click **"Redeploy"**
4. ⚠️ **UNCHECK** "Use existing Build Cache"
5. Click **"Redeploy"**
6. Wait 2 minutes for build

---

## 🧪 TEST AFTER FIX

### Test 1: Check Environment Variable is Set
```bash
# Open browser console on your site (F12)
# You should see this log:
ℹ️ Using API URL: https://cis-audit-api.onrender.com
```

### Test 2: Check Backend Health
```bash
# Open in browser:
https://cis-audit-api.onrender.com/health

# Should return:
{"status":"alive"}
```

### Test 3: Try Registration
1. Go to: https://cis-audit-dashboard.vercel.app/register
2. Fill the form
3. Submit
4. Should work! No 405 error! ✅

---

## 🔍 DETAILED DIAGNOSIS

### What's Happening Now (Broken):

```
User fills form → Submit
    ↓
Frontend Code: 
    const BASE_URL = import.meta.env.VITE_API_URL || ''
    // VITE_API_URL is undefined!
    // So BASE_URL = '' (empty string)
    ↓
API Call: POST /auth/register (relative URL)
    ↓
Vercel: "I don't have a backend! 405 Method Not Allowed"
    ↓
❌ ERROR: Request failed with status code 405
```

### What Should Happen (Fixed):

```
User fills form → Submit
    ↓
Frontend Code:
    const BASE_URL = import.meta.env.VITE_API_URL || ''
    // VITE_API_URL = 'https://cis-audit-api.onrender.com'
    // So BASE_URL = 'https://cis-audit-api.onrender.com'
    ↓
API Call: POST https://cis-audit-api.onrender.com/auth/register
    ↓
Render Backend: Handles request, creates user
    ↓
✅ SUCCESS: User registered!
```

---

## 🚨 COMMON MISTAKES TO AVOID

### Mistake 1: Trailing Slash
```
❌ WRONG: https://cis-audit-api.onrender.com/
✅ RIGHT: https://cis-audit-api.onrender.com
```

### Mistake 2: Wrong Variable Name
```
❌ WRONG: API_URL, BACKEND_URL, VITE_APP_URL
✅ RIGHT: VITE_API_URL (exactly this!)
```

### Mistake 3: Not Redeploying
```
❌ Just saving variable doesn't update live site
✅ Must redeploy to apply changes
```

### Mistake 4: Using Cache
```
❌ Cached build has old code without variable
✅ Uncheck "Use existing Build Cache"
```

### Mistake 5: Not All Environments
```
❌ Only checking "Production"
✅ Check all three: Production, Preview, Development
```

---

## 📊 VERIFICATION STEPS

After fixing, verify these:

### 1. Environment Variable Exists
```
Vercel → Settings → Environment Variables
✅ Should see: VITE_API_URL = https://cis-audit-api.onrender.com
✅ All three environments checked
```

### 2. New Deployment Completed
```
Vercel → Deployments
✅ See new deployment with green checkmark
✅ Status: "Ready"
✅ Build completed successfully
```

### 3. Frontend Knows Backend URL
```
Browser Console (F12):
✅ See: "ℹ️ Using API URL: https://cis-audit-api.onrender.com"
```

### 4. Backend is Responsive
```
https://cis-audit-api.onrender.com/health
✅ Returns: {"status":"alive"}
✅ Status Code: 200 OK
```

### 5. Registration Works
```
Fill form → Submit
✅ No 405 error
✅ User registered
✅ Redirected to dashboard
```

---

## 🔄 IF BACKEND IS SLOW/UNRESPONSIVE

Your Render backend is on **free tier**, which means:
- ⏸️ Spins down after 15 minutes of inactivity
- 🐌 First request after spin-down takes 30-60 seconds (cold start)

### Solution:
1. Open backend directly: https://cis-audit-api.onrender.com/health
2. Wait 30-60 seconds for it to wake up
3. Refresh page until you see `{"status":"alive"}`
4. Now try registration again - should be fast!

### This is Normal:
- ✅ Expected behavior on free tier
- ✅ Subsequent requests are fast
- ✅ Upgrade to $7/mo for 24/7 uptime if needed

---

## 🆘 ADVANCED TROUBLESHOOTING

### Issue: Variable Not Taking Effect

**Check Build Logs**:
1. Vercel → Deployments → Latest → View Function Logs
2. Look for: `"VITE_API_URL"` in build output
3. Should see: Environment variables loaded

**Force New Build**:
1. Make a small code change (add space somewhere)
2. Push to GitHub
3. Vercel auto-deploys with new variable

### Issue: CORS Error Instead of 405

If you get CORS error instead of 405, it means frontend IS reaching backend but CORS is blocking it.

**Fix CORS on Render**:
1. Render Dashboard → Your Service → Environment
2. Find: `ALLOWED_ORIGINS`
3. Update to:
   ```
   https://cis-audit-dashboard.vercel.app,https://cis-audit-dashboard-git-main-sumit-prajapats-projects.vercel.app
   ```
4. Save → Auto-redeploys

### Issue: 500 Internal Server Error

Backend is running but crashing on request.

**Check Render Logs**:
1. Render Dashboard → Your Service → Logs
2. Look for Python errors
3. Common issues:
   - Database connection failed (check DATABASE_URL)
   - Missing environment variable (check all are set)
   - Python package missing (redeploy to reinstall)

---

## 📝 CHECKLIST BEFORE ASKING FOR HELP

Before reporting the issue isn't fixed, verify:

- ✅ `VITE_API_URL` added to Vercel
- ✅ Value is exactly: `https://cis-audit-api.onrender.com` (no trailing slash)
- ✅ All three environments checked
- ✅ Saved the variable
- ✅ Redeployed frontend
- ✅ Unchecked "Use existing Build Cache"
- ✅ Build completed successfully
- ✅ Waited 2 minutes after deployment
- ✅ Cleared browser cache (Ctrl+Shift+R)
- ✅ Checked browser console for API URL log
- ✅ Backend health endpoint responds
- ✅ Waited 60 seconds for backend to wake up if it was sleeping

---

## 🎯 QUICK REFERENCE

### Environment Variable to Add:
```
Name: VITE_API_URL
Value: https://cis-audit-api.onrender.com
Environments: Production, Preview, Development (all three)
```

### Where to Add:
```
Vercel Dashboard → Your Project → Settings → Environment Variables → Add New
```

### After Adding:
```
Deployments → Latest → ... → Redeploy → Uncheck cache → Redeploy
```

### Wait:
```
2 minutes for build + deploy
```

### Test:
```
1. Browser console: Should see API URL log
2. Backend health: Should return {"status":"alive"}
3. Registration: Should work without 405
```

---

## 💡 WHY VITE_API_URL?

Vite (your frontend build tool) has a special prefix for environment variables:
- Variables starting with `VITE_` are exposed to client-side code
- Other variables are NOT exposed (for security)
- That's why it must be `VITE_API_URL` not just `API_URL`

The frontend code specifically looks for this:
```javascript
const BASE_URL = import.meta.env.VITE_API_URL || ''
```

---

## 🎉 SUCCESS!

Once fixed, you'll have:
- ✅ Frontend on Vercel (free)
- ✅ Backend on Render (free)
- ✅ Database on Supabase (free)
- ✅ Everything working perfectly!
- ✅ Total cost: $0/month

---

**🚀 GO FIX IT NOW! It takes 3 minutes!**

1. Add `VITE_API_URL` to Vercel
2. Redeploy without cache
3. Test registration
4. Done! ✅
