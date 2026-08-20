# ⚡ FINAL SETUP INSTRUCTIONS

## ✅ CODE IS READY AND PUSHED!

All code has been cleaned up and pushed to GitHub. Now you just need to configure Vercel.

---

## 🎯 WHAT YOU NEED TO DO NOW

### Step 1: Go to Vercel Dashboard
Open: https://vercel.com/dashboard

### Step 2: Add Environment Variables

Click on your project: `cis-audit-dashboard`  
Go to: **Settings** → **Environment Variables**

**CRITICAL: Add these 7 variables:**

#### 1. DATABASE_URL
```
Name: DATABASE_URL
Value: postgresql://postgres:[YOUR-SUPABASE-PASSWORD]@db.wxdonlycpzfoaxqeweuy.supabase.co:5432/postgres
Environments: ✅ Production ✅ Preview ✅ Development
```
**⚠️ Replace `[YOUR-SUPABASE-PASSWORD]` with actual password!**

#### 2. SECRET_KEY
```
Name: SECRET_KEY
Value: [Generate with: python -c "import secrets; print(secrets.token_urlsafe(32))"]
Environments: ✅ Production ✅ Preview ✅ Development
```
**⚠️ Generate a NEW secure key!**

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

---

### Step 3: DELETE Old Variable

**Find and DELETE**:
- ❌ `VITE_API_URL` (no longer needed - backend on same domain!)

---

### Step 4: Redeploy

1. Go to **Deployments** tab
2. Click latest deployment → "..." menu
3. Click **"Redeploy"**
4. **UNCHECK** "Use existing Build Cache"
5. Click **"Redeploy"**
6. Wait 3-5 minutes

---

### Step 5: Test

After deployment completes:

#### Test Backend:
```
https://cis-audit-dashboard.vercel.app/health
```
**Expected**: `{"status":"alive"}`

#### Test Frontend:
```
https://cis-audit-dashboard.vercel.app/register
```
**Expected**: 
- Page loads
- No CORS errors
- Console shows: "Using relative API URLs"

#### Try Registration:
- Email: test@example.com
- Password: TestPassword123!@#
- Click "Create workspace"
- Should work! ✅

---

## 🎉 WHAT'S CHANGED

### Before (Broken):
```
Frontend (Vercel) --CORS ERROR--> Backend (HF Space)
```

### After (Working):
```
Vercel (Frontend + Backend on same domain)
  ↓
No CORS issues!
```

---

## 📋 QUICK CHECKLIST

- [ ] Added DATABASE_URL with real Supabase password
- [ ] Added SECRET_KEY (generated new secure key)
- [ ] Added APP_ENV = production
- [ ] Added FRONTEND_URL
- [ ] Added ALLOWED_ORIGINS
- [ ] Added COOKIE_SECURE = true
- [ ] Added COOKIE_SAMESITE = lax
- [ ] Deleted VITE_API_URL
- [ ] Redeployed (without cache)
- [ ] Tested /health endpoint
- [ ] Tested /register page
- [ ] Tried creating user

---

## 🆘 IF SOMETHING DOESN'T WORK

Send me screenshots of:
1. Vercel Environment Variables page
2. Browser Console (F12 → Console)
3. Network tab (F12 → Network) showing request
4. Any error messages

---

## 📞 IMPORTANT FILES

- **VERCEL_SETUP_COMPLETE.md** - Detailed setup guide
- **DEPLOYMENT.md** - Complete deployment documentation
- **README.md** - Project overview

---

**Status**: ✅ Code pushed to GitHub  
**Next**: Add environment variables in Vercel  
**Then**: Redeploy  
**Result**: Fully working production app! 🚀
