# 🚀 VERCEL DEPLOYMENT - COMPLETE SETUP GUIDE

## ✅ WHAT I DID

I've configured your project to deploy **EVERYTHING to Vercel** (frontend + backend on same domain).

### Changes Made:

1. ✅ Created `api/index.py` - Vercel serverless backend entry point
2. ✅ Updated `vercel.json` - Routes for frontend + backend
3. ✅ Updated CORS in `backend/main.py` - Allow same-origin requests
4. ✅ Simplified cookie settings - Works with same-origin
5. ✅ Removed TrustedHostMiddleware issues - Vercel handles this
6. ✅ Updated frontend API client - Works with relative URLs

---

## 📋 VERCEL ENVIRONMENT VARIABLES TO SET

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these variables (click "Add Environment Variable" for each):

### Required Variables:

#### 1. DATABASE_URL (Sensitive - use your Supabase URL)
```
Name: DATABASE_URL
Value: postgresql://postgres:[YOUR-PASSWORD]@db.wxdonlycpzfoaxqeweuy.supabase.co:5432/postgres
Environments: ✅ Production, ✅ Preview, ✅ Development
```
**Replace `[YOUR-PASSWORD]` with your actual Supabase password!**

#### 2. SECRET_KEY (Generate a secure key)
```
Name: SECRET_KEY
Value: [Run: python -c "import secrets; print(secrets.token_urlsafe(32))"]
Environments: ✅ Production, ✅ Preview, ✅ Development
```
**Generate a secure random key - DON'T use default!**

#### 3. APP_ENV
```
Name: APP_ENV
Value: production
Environments: ✅ Production
```

#### 4. FRONTEND_URL
```
Name: FRONTEND_URL
Value: https://cis-audit-dashboard.vercel.app
Environments: ✅ Production
```

#### 5. ALLOWED_ORIGINS
```
Name: ALLOWED_ORIGINS  
Value: https://cis-audit-dashboard.vercel.app
Environments: ✅ Production
```

#### 6. COOKIE_SECURE
```
Name: COOKIE_SECURE
Value: true
Environments: ✅ Production
```

#### 7. COOKIE_SAMESITE
```
Name: COOKIE_SAMESITE
Value: lax
Environments: ✅ Production
```

### Optional Variables (for full features):

#### 8. RESEND_API_KEY (for email notifications)
```
Name: RESEND_API_KEY
Value: re_YOUR_RESEND_API_KEY
Environments: ✅ Production
```

#### 9. STRIPE_SECRET_KEY (for billing)
```
Name: STRIPE_SECRET_KEY
Value: sk_live_YOUR_STRIPE_KEY
Environments: ✅ Production
```

#### 10. STRIPE_PUBLISHABLE_KEY
```
Name: STRIPE_PUBLISHABLE_KEY
Value: pk_live_YOUR_STRIPE_KEY
Environments: ✅ Production
```

---

## 🗑️ REMOVE THESE VARIABLES

You no longer need `VITE_API_URL` since backend is on same domain!

**Delete**:
- ❌ `VITE_API_URL` (not needed anymore)
- ❌ Any HF Space related variables

---

## 🔧 HOW TO SET UP

### Step 1: Generate SECRET_KEY

On your local machine, run:
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output - this is your SECRET_KEY.

### Step 2: Get Your Supabase Password

You provided this info:
- Project URL: https://wxdonlycpzfoaxqeweuy.supabase.co
- Connection: `postgresql://postgres:[YOUR-PASSWORD]@db.wxdonlycpzfoaxqeweuy.supabase.co:5432/postgres`

**Find your password**:
1. Go to Supabase Dashboard
2. Project Settings → Database
3. Look for "Database Password" or connection string
4. Copy the password

### Step 3: Add All Variables to Vercel

1. Go to: https://vercel.com/dashboard
2. Select project: `cis-audit-dashboard`
3. Go to: **Settings** → **Environment Variables**
4. Click **"Add Environment Variable"**
5. Add each variable one by one:
   - Name: (from list above)
   - Value: (your actual value)
   - Check: **Production**, **Preview**, **Development**
   - Click **Save**

**Make sure to add ALL required variables** (DATABASE_URL, SECRET_KEY, APP_ENV, etc.)

### Step 4: Delete Old VITE_API_URL

1. Find `VITE_API_URL` in the environment variables list
2. Click the "..." menu next to it
3. Click **"Remove"**
4. Confirm deletion

### Step 5: Trigger Deployment

After adding all variables:

1. Go to **Deployments** tab
2. Click latest deployment → "..." menu → **"Redeploy"**
3. **Make sure** "Use existing Build Cache" is **UNCHECKED**
4. Click **"Redeploy"**
5. Wait 3-5 minutes for build to complete

---

## 🧪 TESTING AFTER DEPLOYMENT

### Test 1: Backend Health
After deployment, open:
```
https://cis-audit-dashboard.vercel.app/health
```

**Expected**: `{"status":"alive"}`

### Test 2: Frontend Loading
Open:
```
https://cis-audit-dashboard.vercel.app/register
```

**Expected**: 
- Page loads without errors
- No CORS errors in console (F12)
- Form is visible and functional

### Test 3: Registration
Fill out the form:
- Full name: Test User
- Email: test@example.com  
- Organization: Test Org
- Password: TestPassword123!@# (12+ chars, mixed case, numbers, symbols)

Click "Create workspace"

**Expected**:
- ✅ Loading spinner appears
- ✅ Either redirects to dashboard OR shows specific error
- ✅ NO "Network Error"
- ✅ NO CORS errors

### Test 4: Check Browser Console
Press F12 → Console tab

**Expected**:
- ℹ️ "Using relative API URLs (backend on same domain)"
- ✅ NO CORS errors
- ✅ NO "Network Error" messages
- ✅ NO 403 Forbidden errors

---

## 🎯 ARCHITECTURE EXPLANATION

### Before (Broken):
```
Frontend (Vercel) → CORS → Backend (HF Space) → Supabase
   ❌ CORS issues
   ❌ Cookie problems  
   ❌ Different domains
```

### After (Working):
```
Vercel (Frontend + Backend on same domain) → Supabase
   ✅ No CORS issues
   ✅ Cookies work perfectly
   ✅ Same-origin requests
```

### How It Works:

1. **Frontend** (`/`): Static React files served by Vercel CDN
2. **Backend** (`/api/*`, `/auth/*`, `/health`): Python FastAPI running as Vercel serverless functions
3. **Database**: Supabase PostgreSQL (external)

**All on one domain**: `cis-audit-dashboard.vercel.app`

**Benefits**:
- ✅ No CORS issues (same origin)
- ✅ Cookies work properly
- ✅ Simpler deployment
- ✅ One dashboard to manage
- ✅ Free tier generous limits

---

## 🔍 TROUBLESHOOTING

### Issue: "Module not found" during build
**Solution**: Make sure `api/requirements.txt` exists and has all dependencies

### Issue: Database connection fails
**Solution**: Check `DATABASE_URL` is correct and password is right

### Issue: "SECRET_KEY not set" error
**Solution**: Generate and add SECRET_KEY environment variable

### Issue: Still getting CORS errors
**Solution**: 
1. Make sure you deleted VITE_API_URL
2. Check browser is requesting same domain
3. Clear browser cache (Ctrl+Shift+Delete)

### Issue: 500 Internal Server Error
**Solution**: 
1. Check Vercel function logs (Deployments → Click deployment → Functions tab)
2. Look for Python errors
3. Usually missing environment variables

---

## 📊 EXPECTED BUILD OUTPUT

When you redeploy, you should see:

```
Building...
Installing dependencies (api/requirements.txt)...
✓ Installed Python packages
Building frontend (npm run build)...
✓ Frontend build complete
Deploying functions...
✓ api/index.py deployed
Deploying static assets...
✓ Static files deployed
Deployment Ready ✅
```

---

## ✅ VERIFICATION CHECKLIST

After deployment completes:

- [ ] All environment variables added to Vercel
- [ ] VITE_API_URL deleted from Vercel
- [ ] SECRET_KEY is a secure random string (not default)
- [ ] DATABASE_URL has correct Supabase password
- [ ] Deployment shows "Ready" status
- [ ] `/health` endpoint returns `{"status":"alive"}`
- [ ] Frontend loads without CORS errors
- [ ] Registration form submits without "Network Error"
- [ ] Can create user successfully
- [ ] Can login with created user
- [ ] Dashboard loads after login

---

## 🎉 SUCCESS INDICATORS

Your deployment is working when:

1. ✅ Health check: https://cis-audit-dashboard.vercel.app/health returns alive
2. ✅ Frontend: https://cis-audit-dashboard.vercel.app loads without errors
3. ✅ Console shows: "Using relative API URLs (backend on same domain)"
4. ✅ Registration creates user OR shows backend validation error
5. ✅ NO CORS errors anywhere
6. ✅ NO "Network Error" messages

---

## 📝 WHAT TO DO NEXT

1. **Push this code to GitHub** (I'll do this for you)
2. **Add environment variables in Vercel** (you need to do this)
3. **Delete VITE_API_URL** (you need to do this)
4. **Redeploy on Vercel** (automatic after push, or manual)
5. **Test everything** (follow testing section above)
6. **Celebrate!** 🎉

---

## 🆘 IF YOU NEED HELP

After you:
1. Add all environment variables
2. Delete VITE_API_URL
3. Redeploy
4. Test

If something doesn't work, send me:
- Screenshot of Vercel environment variables page
- Screenshot of browser console (F12 → Console)
- Screenshot of Network tab (F12 → Network) showing failed request
- What error message you see

---

**Status**: ✅ Code ready to deploy  
**Next**: Add environment variables in Vercel  
**Then**: Deploy and test  
**Result**: Fully functional production app! 🚀
