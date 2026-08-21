# 🚀 Render.com Deployment Guide

Complete step-by-step guide to deploy the CIS Audit Dashboard backend to Render.com.

---

## 📋 Prerequisites

Before you begin, make sure you have:
- ✅ GitHub account with your repository
- ✅ Supabase database (already set up)
- ✅ Your database password: `SuMiT@135520`
- ✅ Your SECRET_KEY: `FbbFxR1_YrgyplekvXE4YDg99UxWKYSHiez2gAC_IGo`

---

## 🎯 Step 1: Create Render Account

1. Go to: **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with **GitHub**
4. Authorize Render to access your GitHub account

---

## 🎯 Step 2: Create New Web Service

1. Once logged in, click the **"New +"** button (top right)
2. Select **"Web Service"**
3. You'll see a list of your GitHub repositories
4. Find and select: **`cis-audit-dashboard`**
5. Click **"Connect"**

---

## 🎯 Step 3: Configure Your Service

Fill in the following settings:

### Basic Configuration

**Name**  
```
cis-audit-api
```
(You can use any name you like)

**Region**  
Choose the closest region to you:
- 🇺🇸 Oregon (US West)
- 🇺🇸 Ohio (US East)
- 🇪🇺 Frankfurt (Europe)
- 🇸🇬 Singapore (Asia)

**Branch**  
```
main
```

**Root Directory**  
```
backend
```
⚠️ **IMPORTANT**: Must be `backend` (this tells Render where your FastAPI app is)

**Runtime**  
```
Python 3
```

**Build Command**  
```
pip install -r requirements.txt
```

**Start Command**  
```
uvicorn main:app --host 0.0.0.0 --port $PORT
```

### Instance Type

Select: **Free**
- 0.1 CPU
- 512 MB RAM
- Good enough for the free tier

---

## 🎯 Step 4: Add Environment Variables

Scroll down to the **"Environment Variables"** section.

Click **"Add Environment Variable"** for each of these:

### Variable 1: DATABASE_URL
```
Key: DATABASE_URL
Value: postgresql://postgres:SuMiT@135520@db.wxdonlycpzfoaxqeweuy.supabase.co:5432/postgres
```

### Variable 2: SECRET_KEY
```
Key: SECRET_KEY
Value: FbbFxR1_YrgyplekvXE4YDg99UxWKYSHiez2gAC_IGo
```

### Variable 3: APP_ENV
```
Key: APP_ENV
Value: production
```

### Variable 4: FRONTEND_URL
```
Key: FRONTEND_URL
Value: https://cis-audit-dashboard.vercel.app
```

### Variable 5: ALLOWED_ORIGINS
```
Key: ALLOWED_ORIGINS
Value: https://cis-audit-dashboard.vercel.app
```

### Variable 6: COOKIE_SECURE
```
Key: COOKIE_SECURE
Value: true
```

### Variable 7: COOKIE_SAMESITE
```
Key: COOKIE_SAMESITE
Value: lax
```

### Variable 8: PYTHON_VERSION
```
Key: PYTHON_VERSION
Value: 3.11.0
```

---

## 🎯 Step 5: Deploy!

1. Double-check all settings are correct
2. Click **"Create Web Service"** button at the bottom
3. Render will start building and deploying your app
4. This takes **5-10 minutes** for the first deployment

### What's Happening:
- ⏳ Installing Python packages
- ⏳ Setting up database connection
- ⏳ Starting FastAPI server
- ⏳ Generating public URL

---

## 🎯 Step 6: Get Your Service URL

Once deployment completes:

1. You'll see a green **"Live"** status
2. At the top of the page, you'll see your service URL
3. It will look like: **`https://cis-audit-api.onrender.com`**
4. **COPY THIS URL** - you'll need it for Vercel!

---

## 🎯 Step 7: Test Your Backend

Open your browser and test these endpoints:

### Health Check
```
https://cis-audit-api.onrender.com/health
```
**Expected Response:**
```json
{"status":"alive"}
```

### Database Connection Check
```
https://cis-audit-api.onrender.com/health/ready
```
**Expected Response:**
```json
{"status":"ready","database":"connected"}
```

### API Documentation
```
https://cis-audit-api.onrender.com/api/docs
```
Should show interactive API documentation (Swagger UI)

---

## 🎯 Step 8: Configure Vercel Frontend

Now that your backend is running, configure the frontend:

### 1. Go to Vercel Dashboard
- Visit: **https://vercel.com/dashboard**
- Find your project: **cis-audit-dashboard**
- Click on it

### 2. Add Environment Variable
- Go to: **Settings** → **Environment Variables**
- Click **"Add New"**

**Add this variable:**
```
Name: VITE_API_URL
Value: https://cis-audit-api.onrender.com
```
(Replace with YOUR Render URL)

**Environments:**
- ✅ Production
- ✅ Preview
- ✅ Development

Click **"Save"**

### 3. Clean Up Old Variables

**DELETE these variables** (they're not needed):
- ❌ `DATABASE_URL`
- ❌ `SECRET_KEY`
- ❌ `APP_ENV`
- ❌ `FRONTEND_URL`
- ❌ `ALLOWED_ORIGINS`
- ❌ `COOKIE_SECURE`
- ❌ `COOKIE_SAMESITE`
- ❌ All `POSTGRES_*` variables
- ❌ All `SUPABASE_*` variables

**KEEP ONLY**: `VITE_API_URL`

### 4. Redeploy Frontend
- Go to **"Deployments"** tab
- Click on the latest deployment
- Click the **"..."** menu (three dots)
- Select **"Redeploy"**
- **UNCHECK** "Use existing Build Cache"
- Click **"Redeploy"**
- Wait 2 minutes

---

## 🎯 Step 9: Update CORS Settings

After frontend redeploys, you may need to add more origins:

1. Go back to **Render Dashboard**
2. Click on your **cis-audit-api** service
3. Go to **"Environment"** tab
4. Find **ALLOWED_ORIGINS**
5. Update it to include preview URLs:

```
ALLOWED_ORIGINS=https://cis-audit-dashboard.vercel.app,https://cis-audit-dashboard-git-main-sumit-prajapats-projects.vercel.app
```

6. Click **"Save Changes"**
7. Render will automatically redeploy (takes 1-2 minutes)

---

## 🎉 Step 10: Test Everything!

### Test 1: Open Your App
```
https://cis-audit-dashboard.vercel.app
```

### Test 2: Try Registration
1. Click **"Register"** or **"Sign Up"**
2. Fill in the form:
   - Email: `test@example.com`
   - Password: `Test123456!`
   - Name: `Test User`
   - Organization: `Test Org`
3. Click **"Register"**
4. Should redirect to dashboard - **NO ERRORS!** ✅

### Test 3: Check Browser Console
- Press `F12` to open Developer Tools
- Go to **"Console"** tab
- Should see: `ℹ️ Using API URL: https://cis-audit-api.onrender.com`
- **NO RED ERRORS!** ✅

---

## ✅ Success Checklist

- ✅ Backend deployed to Render
- ✅ Health endpoint returns `{"status":"alive"}`
- ✅ Ready endpoint returns database connected
- ✅ Frontend has VITE_API_URL set
- ✅ Old Vercel variables deleted
- ✅ Frontend redeployed
- ✅ CORS configured with all origins
- ✅ Registration works without errors
- ✅ No console errors in browser

---

## 🚨 Troubleshooting

### ❌ Backend build fails on Render

**Check:**
- Root Directory is set to `backend`
- Build command is correct
- `backend/requirements.txt` exists in your repo

**Fix:**
- Go to Render dashboard → Your service → Settings
- Verify Root Directory = `backend`
- Try **"Manual Deploy"**

### ❌ Backend shows "Service Unavailable"

**Reason:** Free tier services spin down after 15 min of inactivity

**Fix:**
- First request after spin-down takes 30-60 seconds
- Refresh the page after waiting
- This is normal on free tier!

### ❌ Frontend shows "Network Error"

**Check:**
1. VITE_API_URL is set in Vercel
2. Render backend is running (green "Live" status)
3. Test backend health endpoint directly
4. Check browser console for exact error

**Fix:**
- Verify VITE_API_URL has no trailing slash
- Make sure URL is correct
- Redeploy frontend with cleared cache

### ❌ CORS Error in Browser Console

**Error looks like:**
```
Access to XMLHttpRequest at 'https://...' from origin 'https://...' has been blocked by CORS policy
```

**Fix:**
1. Go to Render → Environment
2. Update ALLOWED_ORIGINS to include the exact origin from error message
3. Save and wait for redeploy

### ❌ Database Connection Failed

**Check:**
- DATABASE_URL is correct in Render
- Supabase database is running
- Password is correct: `SuMiT@135520`

**Fix:**
- Go to Render → Environment
- Verify DATABASE_URL
- Check Render logs for exact error

---

## 📊 Monitoring Your Service

### View Logs
1. Render Dashboard → Your service
2. Click **"Logs"** tab
3. See real-time logs of your app
4. Use this to debug issues

### View Metrics
1. Render Dashboard → Your service
2. Click **"Metrics"** tab
3. See CPU, memory, request stats

### Events
1. Render Dashboard → Your service
2. Click **"Events"** tab
3. See deployment history, errors, etc.

---

## 💰 Render Free Tier Limits

**Included Free:**
- ✅ 750 hours/month (enough for 24/7)
- ✅ 512 MB RAM
- ✅ Automatic SSL/HTTPS
- ✅ Automatic deployments from GitHub
- ✅ Custom domains
- ✅ Free bandwidth (100 GB/month)

**Limitations:**
- ⏸️ Services spin down after 15 min inactivity
- 🐌 First request after spin-down: 30-60 seconds
- 💾 Persistent disks not included

**Upgrade to Paid ($7/month) for:**
- ⚡ No spin-down (24/7 uptime)
- 🚀 More CPU and RAM
- 💾 Persistent storage
- 📧 Priority support

---

## 🔄 Updating Your Application

### Automatic Deployments

Render automatically deploys when you push to GitHub:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. Render detects the push and auto-deploys
4. Wait 2-3 minutes for deployment

### Manual Deployment

1. Go to Render Dashboard → Your service
2. Click **"Manual Deploy"** button
3. Select branch: `main`
4. Click **"Deploy"**

---

## 📚 Additional Resources

- **Render Documentation**: https://render.com/docs
- **Render Status Page**: https://status.render.com
- **Python on Render**: https://render.com/docs/deploy-fastapi
- **Environment Variables**: https://render.com/docs/environment-variables

---

## 🎯 Next Steps

Now that your app is deployed:

1. ✅ Test all features (login, scans, reports)
2. ✅ Monitor logs for any errors
3. ✅ Set up email service (Resend) for verification emails
4. ✅ Set up billing (Stripe) if you want subscriptions
5. ✅ Add custom domain if you have one
6. ✅ Consider upgrading to paid tier for better performance

---

**🎉 Congratulations! Your CIS Audit Dashboard is now live!**

**Frontend**: https://cis-audit-dashboard.vercel.app  
**Backend**: https://cis-audit-api.onrender.com  
**Database**: Supabase PostgreSQL

**Total Cost**: $0/month ✅
