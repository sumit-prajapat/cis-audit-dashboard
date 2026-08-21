# 🚀 DEPLOYMENT GUIDE

Complete guide for deploying the CIS Audit Dashboard to Vercel (Production).

---

## 📋 PREREQUISITES

- GitHub account with repository: https://github.com/sumit-prajapat/cis-audit-dashboard
- Vercel account (free tier): https://vercel.com
- Supabase account with PostgreSQL database

---

## 🎯 DEPLOYMENT ARCHITECTURE

```
Vercel Deployment (Single Domain)
├── Frontend (React + Vite)
│   └── Served from: /
├── Backend API (FastAPI + Python)
│   └── Served from: /api, /auth, /health, /orgs, /billing
└── Database (Supabase PostgreSQL)
    └── External connection
```

**Benefits**:
- ✅ Same-origin (no CORS issues)
- ✅ Simplified deployment
- ✅ Single dashboard management
- ✅ Automatic HTTPS
- ✅ Global CDN

---

## 🔧 STEP 1: PREPARE ENVIRONMENT VARIABLES

### Required Variables:

1. **DATABASE_URL** - Your Supabase PostgreSQL connection string
   ```
   postgresql://postgres:[PASSWORD]@db.wxdonlycpzfoaxqeweuy.supabase.co:5432/postgres
   ```

2. **SECRET_KEY** - Generate a secure random key
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

3. **APP_ENV** - Set to `production`

4. **FRONTEND_URL** - Your Vercel deployment URL
   ```
   https://cis-audit-dashboard.vercel.app
   ```

5. **ALLOWED_ORIGINS** - Same as FRONTEND_URL

6. **COOKIE_SECURE** - Set to `true`

7. **COOKIE_SAMESITE** - Set to `lax`

### Optional Variables:

8. **RESEND_API_KEY** - For email notifications (optional)
9. **STRIPE_SECRET_KEY** - For billing (optional)
10. **STRIPE_PUBLISHABLE_KEY** - For billing (optional)

---

## 🚀 STEP 2: DEPLOY TO VERCEL

### Option A: Automatic Deployment (Recommended)

1. **Connect to Vercel**:
   - Go to: https://vercel.com/new
   - Click "Import Git Repository"
   - Select: `sumit-prajapat/cis-audit-dashboard`
   - Click "Import"

2. **Configure Project**:
   - Framework Preset: `Vite` (auto-detected)
   - Root Directory: `./` (leave as is)
   - Build Command: (leave default)
   - Output Directory: `frontend/dist`

3. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add each variable from Step 1
   - Check: Production ✅, Preview ✅, Development ✅
   - Click "Add"

4. **Deploy**:
   - Click "Deploy"
   - Wait 3-5 minutes for build
   - ✅ Done!

### Option B: Manual Deployment via CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
cd d:\projects\cis-audit-dashboard
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? cis-audit-dashboard
# - Directory? ./ (press enter)

# Production deployment
vercel --prod
```

---

## ✅ STEP 3: VERIFY DEPLOYMENT

### Test Backend API:

```bash
curl https://cis-audit-dashboard.vercel.app/health
```
**Expected**: `{"status":"alive"}`

### Test Frontend:

Open: https://cis-audit-dashboard.vercel.app/register

**Expected**:
- Page loads without errors
- Console shows: "Using relative API URLs"
- No CORS errors

### Test Registration:

1. Fill registration form
2. Submit
3. Should either:
   - ✅ Redirect to dashboard (success)
   - ✅ Show validation error (backend responding)
   - ❌ Show "Network Error" (needs debugging)

---

## 🔍 TROUBLESHOOTING

### Issue: Build fails
- Check build logs in Vercel dashboard
- Verify `api/requirements.txt` exists
- Check Python dependencies install correctly

### Issue: 500 Internal Server Error
- Check Vercel function logs
- Verify DATABASE_URL is correct
- Verify SECRET_KEY is set
- Check environment variables are in Production

### Issue: Database connection fails
- Verify Supabase password in DATABASE_URL
- Check Supabase connection string format
- Ensure database allows connections from Vercel IPs

### Issue: "Network Error" in frontend
- Check browser console for actual error
- Verify backend health endpoint works
- Check Network tab for status codes

---

## 📊 MONITORING

### View Deployment Logs:
1. Vercel Dashboard → Your Project
2. Click "Deployments"
3. Click latest deployment
4. View "Build Logs" and "Function Logs"

### View Function Performance:
1. Vercel Dashboard → Your Project
2. Click "Analytics" → "Functions"
3. Monitor response times, errors, invocations

---

## 🔄 CONTINUOUS DEPLOYMENT

After initial setup, every push to `main` branch automatically deploys:

```bash
git add .
git commit -m "Update: feature description"
git push origin main
```

Vercel will:
1. Detect push
2. Build frontend + backend
3. Run tests (if configured)
4. Deploy to production
5. Send notification

---

## 🎯 POST-DEPLOYMENT CHECKLIST

- [ ] Health endpoint returns 200 OK
- [ ] Frontend loads without errors
- [ ] Registration creates users successfully
- [ ] Login works with created users
- [ ] Dashboard loads after authentication
- [ ] All API endpoints respond correctly
- [ ] No CORS errors in browser console
- [ ] Database connections work
- [ ] Environment variables are secure

---

## 📞 SUPPORT

If you encounter issues:
1. Check Vercel build logs
2. Check browser console errors
3. Check function logs in Vercel dashboard
4. Verify all environment variables are set
5. Test database connection directly

---

## 🎉 SUCCESS!

Your application is now:
- ✅ Deployed to production
- ✅ Running on Vercel infrastructure
- ✅ Using Supabase PostgreSQL
- ✅ Secured with HTTPS
- ✅ Globally distributed via CDN

**Live URL**: https://cis-audit-dashboard.vercel.app
