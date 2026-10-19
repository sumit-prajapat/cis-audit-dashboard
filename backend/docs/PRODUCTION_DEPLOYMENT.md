# 🚀 Production Deployment Guide - CIS Audit Dashboard

**Version:** 3.0.0  
**Last Updated:** October 19, 2026  
**Status:** ✅ Production Ready

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Backend Deployment (Render)](#backend-deployment-render)
4. [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
5. [Environment Variables](#environment-variables)
6. [Post-Deployment Verification](#post-deployment-verification)
7. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start

**Total Time:** 10-15 minutes

1. **Deploy Backend to Render** (5 mins)
2. **Deploy Frontend to Vercel** (3 mins)
3. **Configure Environment Variables** (2 mins)
4. **Test & Verify** (2 mins)

---

## ✅ Prerequisites

### Required Accounts
- [x] GitHub account (repository connected)
- [x] [Render account](https://dashboard.render.com) (free tier)
- [x] [Vercel account](https://vercel.com) (free tier)

### Repository
- [x] Code pushed to GitHub
- [x] Latest commit: `9e5e2f4` (all fixes applied)

---

## 🖥️ Backend Deployment (Render)

### Step 1: Create PostgreSQL Database

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **PostgreSQL**
3. Configure:
   ```
   Name: cis-audit-db
   Database: cisdb
   User: cisadmin
   Region: (Choose closest to you)
   Plan: Free
   ```
4. Click **Create Database**
5. **COPY THE INTERNAL DATABASE URL** (starts with `postgresql://`)
   - Example: `postgresql://user:pass@host.region.render.com/db`

### Step 2: Deploy Backend Service

#### Option A: Using Dashboard

1. In Render, click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   ```
   Name: cis-audit-api
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: bash start_server.sh
   Plan: Free
   ```

#### Option B: Using render.yaml (Automatic)

The project includes `render.yaml` for automatic deployment:

1. In Render dashboard, go to **Blueprints**
2. Click **New Blueprint Instance**
3. Select your repository
4. Render will auto-detect `render.yaml` and create all services

### Step 3: Configure Environment Variables

In your `cis-audit-api` service, go to **Environment** tab and add:

```bash
# DATABASE (REQUIRED)
DATABASE_URL=postgresql://cisadmin:password@host.render.com/cisdb
# ☝️ Use the INTERNAL URL you copied from Step 1

# SECRET KEY (REQUIRED)
SECRET_KEY=<generate-with-command-below>

# FRONTEND (REQUIRED)
FRONTEND_URL=https://cis-audit-dashboard.vercel.app
ALLOWED_ORIGINS=https://cis-audit-dashboard.vercel.app

# APP CONFIG
APP_ENV=production
COOKIE_SECURE=true
COOKIE_SAMESITE=lax

# OPTIONAL - Email & Billing
RESEND_API_KEY=re_...  # If using email
STRIPE_SECRET_KEY=sk_...  # If using Stripe
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_GROWTH=price_...
STRIPE_PRICE_TEAM=price_...
```

**Generate SECRET_KEY:**
```powershell
cd backend
python generate_secret.py
```

### Step 4: Deploy

1. Click **Manual Deploy** → **Deploy latest commit**
2. Monitor logs for:
   ```
   ✅ Database connection test successful
   ✅ Database tables created/verified successfully
   🌐 Starting Uvicorn server...
   ```
3. Wait for deployment to complete (~2-3 minutes)

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Connect Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   ```

### Step 2: Configure Environment Variable

Add this environment variable:

```bash
VITE_API_URL=https://cis-audit-api.onrender.com
```

**Replace with your actual Render backend URL!**

### Step 3: Deploy

1. Click **Deploy**
2. Wait for build to complete (~1-2 minutes)
3. Your frontend will be live at: `https://cis-audit-dashboard.vercel.app`

---

## 🔐 Environment Variables

### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | ✅ Yes | - | PostgreSQL connection string |
| `SECRET_KEY` | ✅ Yes | - | JWT signing key (min 32 chars) |
| `FRONTEND_URL` | ✅ Yes | - | Frontend URL for CORS |
| `ALLOWED_ORIGINS` | ✅ Yes | - | Comma-separated CORS origins |
| `APP_ENV` | No | `production` | Environment name |
| `COOKIE_SECURE` | No | `true` | Use secure cookies |
| `COOKIE_SAMESITE` | No | `lax` | Cookie SameSite policy |
| `RESEND_API_KEY` | No | - | Email service API key |
| `STRIPE_SECRET_KEY` | No | - | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | - | Stripe webhook secret |

### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | ✅ Yes | - | Backend API URL |

---

## ✅ Post-Deployment Verification

### 1. Test Backend Health

```powershell
# Health check
Invoke-WebRequest -Uri "https://cis-audit-api.onrender.com/health" -UseBasicParsing

# Expected: {"status":"alive"}

# Readiness check (includes database)
Invoke-WebRequest -Uri "https://cis-audit-api.onrender.com/health/ready" -UseBasicParsing

# Expected: {"status":"ready","database":"connected"}
```

### 2. Test API Documentation

Open: `https://cis-audit-api.onrender.com/api/docs`

You should see interactive API documentation (Swagger UI).

### 3. Test Frontend

1. Open: `https://cis-audit-dashboard.vercel.app`
2. Click **Create an account**
3. Register with:
   - **Full Name:** Test User
   - **Email:** test@example.com
   - **Organization:** Test Org
   - **Password:** TestPassword123! (min 12 chars)
4. Verify you can:
   - Register successfully
   - Login
   - See dashboard
   - Access different pages

### 4. Test End-to-End Flow

```
✅ Register → ✅ Login → ✅ Dashboard → ✅ Logout → ✅ Login Again
```

---

## 🔧 Troubleshooting

### Issue: "Database connection failed"

**Solution:**
1. Verify `DATABASE_URL` in Render environment variables
2. Use the **Internal Database URL** (not External)
3. Format: `postgresql://user:pass@host.region.render.com/dbname`
4. Restart the service

### Issue: "CORS error" or "Network Error" in frontend

**Solution:**
1. Check `ALLOWED_ORIGINS` in backend includes frontend URL
2. Check `FRONTEND_URL` in backend matches your Vercel domain
3. Check `VITE_API_URL` in frontend matches your Render backend URL
4. Redeploy both services

### Issue: "No open ports detected" (Render)

**Solution:**
This is fixed in the latest commit! If still occurring:
1. Verify `start_server.sh` is being used (check logs)
2. Check that `PORT` environment variable is being used
3. Look for: `🌐 Port: 10000` in logs

### Issue: "Module psycopg2 not found"

**Solution:**
This is fixed! The code now uses `psycopg` (psycopg3), not psycopg2.
If still occurring:
1. Clear Render build cache
2. Redeploy with **Clear build cache & deploy**

### Issue: Backend starts but crashes after a few seconds

**Solution:**
1. Check Render logs for error messages
2. Verify DATABASE_URL is correct
3. Check if database is accessible (might be spinning down on free tier)
4. Look for specific error messages in logs

### Issue: Frontend can't connect to backend

**Solution:**
1. Verify backend is running: `curl https://your-api.onrender.com/health`
2. Check browser console for errors
3. Verify `VITE_API_URL` is set correctly
4. Clear browser cache and hard refresh (Ctrl+Shift+R)

---

## 📊 Monitoring & Maintenance

### Render Free Tier Limitations

- **Spin Down:** Free services spin down after 15 minutes of inactivity
- **Cold Start:** First request after spin-down takes ~30-45 seconds
- **Solution:** Upgrade to paid tier or use a keep-alive service

### Keep Your Deployment Warm

Use a service like [cron-job.org](https://cron-job.org) to ping your backend every 10 minutes:

```
URL: https://cis-audit-api.onrender.com/health
Interval: Every 10 minutes
```

### Monitoring

**Render Dashboard:**
- View logs: Service → Logs
- Monitor metrics: Service → Metrics
- Check events: Service → Events

**Vercel Dashboard:**
- View deployments: Project → Deployments
- Check analytics: Project → Analytics
- Monitor errors: Project → Logs

---

## 🔒 Security Checklist

- [x] `SECRET_KEY` is strong (32+ characters)
- [x] `DATABASE_URL` uses internal URL (faster, more secure)
- [x] `COOKIE_SECURE=true` (HTTPS only cookies)
- [x] CORS configured with specific origins (not `*`)
- [x] CSRF protection enabled
- [x] Rate limiting enabled
- [x] SQL injection protection (parameterized queries)
- [x] XSS protection (content security policy headers)

---

## 📚 Additional Resources

### Documentation
- API Docs: `https://your-api.onrender.com/api/docs`
- ReDoc: `https://your-api.onrender.com/api/redoc`

### Support
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- FastAPI Docs: https://fastapi.tiangolo.com
- React Docs: https://react.dev

---

## 🎉 Success Criteria

Your deployment is successful when:

- ✅ Backend health endpoint returns `{"status":"alive"}`
- ✅ Backend ready endpoint returns `{"status":"ready","database":"connected"}`
- ✅ Frontend loads without errors
- ✅ User can register and login
- ✅ Dashboard displays correctly
- ✅ API documentation is accessible
- ✅ No CORS errors in browser console
- ✅ Database operations work correctly

---

## 📝 Deployment Checklist

### Pre-Deployment
- [x] All code committed to GitHub
- [x] Environment variables prepared
- [x] Database credentials ready
- [x] SECRET_KEY generated

### Deployment
- [ ] PostgreSQL database created on Render
- [ ] Backend deployed to Render
- [ ] Backend environment variables configured
- [ ] Backend health check passing
- [ ] Frontend deployed to Vercel
- [ ] Frontend environment variable configured
- [ ] Frontend loads successfully

### Post-Deployment
- [ ] Registration works
- [ ] Login works
- [ ] Dashboard accessible
- [ ] API endpoints tested
- [ ] No errors in logs
- [ ] CORS working correctly
- [ ] Database operations successful

---

**🚀 Your CIS Audit Dashboard is now live and production-ready!**

For issues or questions, check the logs in Render and Vercel dashboards.
