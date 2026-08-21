# 🚨 FIX THE 405 ERROR NOW - IMMEDIATE STEPS

**Problem**: Frontend can't find backend (405 Method Not Allowed)  
**Cause**: Missing `VITE_API_URL` environment variable in Vercel  
**Time to Fix**: 3 minutes

---

## 🎯 STEP 1: Add Environment Variable to Vercel (2 minutes)

### Go to Vercel Dashboard:
1. Open: **https://vercel.com/dashboard**
2. Click on your project: **`cis-audit-dashboard`**
3. Click on **"Settings"** tab (top navigation)
4. Click on **"Environment Variables"** (left sidebar)

### Add the Variable:
Click **"Add New"** button and enter:

```
Name: VITE_API_URL
Value: https://cis-audit-api.onrender.com
```

**IMPORTANT**: Do NOT add trailing slash! Should be exactly:
```
https://cis-audit-api.onrender.com
```

### Select Environments:
✅ Check **ALL THREE**:
- ✅ Production
- ✅ Preview
- ✅ Development

### Save:
Click **"Save"** button

---

## 🎯 STEP 2: Delete Old Variables (1 minute)

While you're in Environment Variables, **DELETE these if they exist**:

❌ `DATABASE_URL`  
❌ `SECRET_KEY`  
❌ `APP_ENV`  
❌ `FRONTEND_URL`  
❌ `ALLOWED_ORIGINS`  
❌ `COOKIE_SECURE`  
❌ `COOKIE_SAMESITE`  
❌ Any `POSTGRES_*` variables  
❌ Any `SUPABASE_*` variables  

**KEEP ONLY**: `VITE_API_URL`

For each one:
1. Find the variable
2. Click the **"..."** (three dots) menu
3. Click **"Remove"**
4. Confirm

---

## 🎯 STEP 3: Redeploy Frontend (1 minute)

### Trigger Redeploy:
1. Go to **"Deployments"** tab
2. Find the **latest deployment** (top of the list)
3. Click the **"..."** menu (three dots on the right)
4. Select **"Redeploy"**

### Clear Cache:
⚠️ **IMPORTANT**: 
- **UNCHECK** the box that says "Use existing Build Cache"
- This forces a fresh build with new environment variables

### Deploy:
Click **"Redeploy"** button

---

## 🎯 STEP 4: Wait and Test (2 minutes)

### Wait for Build:
- Watch the build logs
- Should take **1-2 minutes**
- Wait for **"Deployment completed"** message

### Test Registration:
1. Go to: **https://cis-audit-dashboard.vercel.app/register**
2. Open **Browser Console** (Press F12 → Console tab)
3. You should see: `ℹ️ Using API URL: https://cis-audit-api.onrender.com`
4. Fill the registration form
5. Submit

### Expected Result:
✅ **Should work!** No 405 error!  
✅ User registered successfully  
✅ Redirected to dashboard

---

## 🆘 IF STILL NOT WORKING

### Check 1: Environment Variable Set Correctly
```
Vercel Dashboard → Settings → Environment Variables
Should see: VITE_API_URL = https://cis-audit-api.onrender.com
```

### Check 2: Redeployed Without Cache
```
Deployment logs should show:
"Building for production..."
"vite v5.4.21 building for production..."
```

### Check 3: Browser Console
```
Open F12 → Console
Should see: "Using API URL: https://cis-audit-api.onrender.com"
If you see this, the variable is set correctly
```

### Check 4: Backend is Running
```
Open: https://cis-audit-api.onrender.com/health
Should return: {"status":"alive"}
```

If backend returns 503, wait 60 seconds (spin-up time) and try again.

---

## 🔍 DEBUGGING CHECKLIST

If it's still not working, check these:

### ❌ Common Mistakes:

**Mistake 1**: Trailing slash in URL
```
❌ WRONG: https://cis-audit-api.onrender.com/
✅ RIGHT: https://cis-audit-api.onrender.com
```

**Mistake 2**: Variable name typo
```
❌ WRONG: VITE_APP_URL, API_URL, BACKEND_URL
✅ RIGHT: VITE_API_URL (exactly this!)
```

**Mistake 3**: Not redeploying
```
❌ Just saving variable is not enough
✅ Must redeploy for changes to take effect
```

**Mistake 4**: Using build cache
```
❌ Cache has old build without new variable
✅ Uncheck "Use existing Build Cache"
```

**Mistake 5**: Not selecting all environments
```
❌ Only Production selected
✅ All three: Production, Preview, Development
```

---

## 📸 VISUAL GUIDE

### Where to Add Environment Variable:

1. **Vercel Dashboard** → Your Project → **Settings**
2. Left sidebar → **Environment Variables**
3. Click **"Add New"** button
4. Fill in:
   ```
   Name: VITE_API_URL
   Value: https://cis-audit-api.onrender.com
   Environments: ✅ All three checked
   ```
5. Click **Save**

### Where to Redeploy:

1. **Deployments** tab
2. Latest deployment row
3. **"..."** menu on the right
4. **"Redeploy"**
5. **Uncheck** "Use existing Build Cache"
6. **"Redeploy"** button

---

## 🎯 WHAT HAPPENS AFTER FIX

### Before (Current - Broken):
```
Frontend → (tries relative URL) → 405 Error
```

### After (Fixed):
```
Frontend → (uses VITE_API_URL) → Render Backend → Success! ✅
```

---

## 💡 WHY THIS HAPPENS

The frontend code looks for `import.meta.env.VITE_API_URL`:

```javascript
// frontend/src/api/index.js
const BASE_URL = import.meta.env.VITE_API_URL || ''
```

If `VITE_API_URL` is not set:
- `BASE_URL` becomes empty string `''`
- API calls use relative URLs like `/auth/register`
- Vercel tries to handle them (but has no backend)
- Result: 405 Method Not Allowed

When `VITE_API_URL` is set:
- `BASE_URL` becomes `https://cis-audit-api.onrender.com`
- API calls go to: `https://cis-audit-api.onrender.com/auth/register`
- Render handles the request
- Result: Success! ✅

---

## ⏱️ TIMELINE

```
Now (0:00)     → Add VITE_API_URL to Vercel
0:00 - 0:30    → Delete old variables
0:30 - 1:00    → Trigger redeploy (uncheck cache)
1:00 - 3:00    → Wait for build to complete
3:00 - 3:30    → Test registration
3:30           → WORKING! ✅
```

**Total**: 3-4 minutes

---

## ✅ SUCCESS CHECKLIST

After completing all steps, you should have:

- ✅ `VITE_API_URL` environment variable in Vercel
- ✅ Set to: `https://cis-audit-api.onrender.com`
- ✅ All three environments selected
- ✅ Old backend variables deleted
- ✅ Frontend redeployed without cache
- ✅ Browser console shows: "Using API URL: https://cis-audit-api.onrender.com"
- ✅ Registration works without 405 error
- ✅ User can login and see dashboard

---

## 🎉 FINAL NOTE

Your backend is **already deployed and working** on Render! 🎉

The ONLY issue is that the frontend doesn't know where to find it.

Adding `VITE_API_URL` tells the frontend:
> "Hey, send all API requests to https://cis-audit-api.onrender.com"

That's it! 3 minutes and you're done! 🚀

---

**👉 START NOW: Go to https://vercel.com/dashboard 👈**
