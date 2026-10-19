# 🚀 CIS Audit Dashboard - Quick Deployment Guide

## Critical Issues Fixed ✅

1. **Database Connection Errors** - App now starts even if database is temporarily unavailable
2. **Port Binding** - Correctly uses `$PORT` environment variable from Render
3. **Migration Failures** - Non-blocking migrations won't prevent app startup
4. **Health Checks** - Proper health endpoints for monitoring

---

## 🎯 Render Deployment (QUICKEST - Recommended for Demo)

### Prerequisites
- GitHub repository connected to Render
- Render account (free tier works)

### Step 1: Create PostgreSQL Database on Render

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New** → **PostgreSQL**
3. Name: `cis-audit-db`
4. Database: `cisdb`
5. User: `cisadmin`
6. Region: Choose closest to you
7. Plan: **Free**
8. Click **Create Database**
9. **Copy the Internal Database URL** (starts with `postgresql://`)

### Step 2: Configure Backend Web Service

1. Go to your Render dashboard
2. Find your `cis-audit-api` service
3. Go to **Environment** tab
4. Add/Update these environment variables:

```bash
DATABASE_URL=<paste-your-internal-database-url-here>
SECRET_KEY=<generate-with-command-below>
FRONTEND_URL=https://cis-audit-dashboard.vercel.app
ALLOWED_ORIGINS=https://cis-audit-dashboard.vercel.app,http://localhost:5173
APP_ENV=production
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
```

**Generate SECRET_KEY:**
```bash
cd backend
python generate_secret.py
```

### Step 3: Deploy

1. Click **Manual Deploy** → **Deploy latest commit**
2. Wait for build to complete (2-3 minutes)
3. Check logs for: `✅ Database connection test successful`
4. Your API will be live at: `https://cis-audit-api.onrender.com`

### Step 4: Test Deployment

```bash
# Health check
curl https://cis-audit-api.onrender.com/health

# API docs
open https://cis-audit-api.onrender.com/api/docs
```

---

## 🌐 Frontend Deployment (Vercel)

### Step 1: Update Environment Variable

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `cis-audit-dashboard` project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://cis-audit-api.onrender.com
   ```

### Step 2: Redeploy

1. Go to **Deployments** tab
2. Click **Redeploy** on latest deployment
3. Wait for deployment (1-2 minutes)
4. Visit: `https://cis-audit-dashboard.vercel.app`

---

## 🔧 Troubleshooting

### Issue: "No open ports detected"
**Solution:** Fixed in latest commit. The app now binds to `$PORT` correctly.

### Issue: Database connection failed
**Solution:** 
1. Verify `DATABASE_URL` in Render environment variables
2. Make sure you're using the **Internal Database URL** (not External)
3. Database format: `postgresql://user:pass@host:5432/dbname`

### Issue: App crashes on startup
**Solution:**
1. Check Render logs: Dashboard → Service → Logs
2. Look for error messages
3. Verify all environment variables are set
4. Try manual deploy again

### Issue: Frontend can't connect to backend
**Solution:**
1. Verify CORS settings in backend environment:
   ```
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app
   ```
2. Update frontend `VITE_API_URL` to your backend URL
3. Redeploy both services

---

## 📊 Quick Health Check

Run these commands to verify your deployment:

```bash
# Backend health
curl https://YOUR-API-URL.onrender.com/health

# Backend readiness (includes database check)
curl https://YOUR-API-URL.onrender.com/health/ready

# API documentation
open https://YOUR-API-URL.onrender.com/api/docs
```

Expected response:
```json
{
  "status": "ok",
  "message": "CIS Audit SaaS API v3.0.0 - Production Ready",
  "version": "3.0.0",
  "environment": "production"
}
```

---

## 🎬 Demo Checklist

Before showing the project:

- [ ] Backend responds to `/health` endpoint
- [ ] API docs accessible at `/api/docs`
- [ ] Frontend loads successfully
- [ ] Can register a new account
- [ ] Can login
- [ ] Dashboard displays correctly

---

## 🆘 Emergency Fixes

If deployment is still failing right before demo:

### Quick Fix #1: Use Railway Instead
1. Go to [Railway.app](https://railway.app)
2. Import your GitHub repo
3. Add PostgreSQL database
4. Deploy - takes 2 minutes

### Quick Fix #2: Local Demo
```bash
# Terminal 1 - Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m alembic upgrade head
uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

---

## 📝 Environment Variables Summary

### Backend (Render)
```bash
DATABASE_URL=postgresql://user:pass@host:5432/dbname
SECRET_KEY=your-generated-secret-key-min-32-chars
FRONTEND_URL=https://your-app.vercel.app
ALLOWED_ORIGINS=https://your-app.vercel.app
APP_ENV=production
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
```

### Frontend (Vercel)
```bash
VITE_API_URL=https://your-api.onrender.com
```

---

## 💡 Pro Tips

1. **Free Tier Limitations:**
   - Render free tier spins down after 15 minutes of inactivity
   - First request after spin-down takes ~30 seconds
   - Keep it warm by pinging `/health` every 10 minutes

2. **For Production:**
   - Upgrade to paid Render tier for always-on service
   - Use Redis for caching
   - Enable auto-scaling

3. **Monitoring:**
   - Use Render metrics dashboard
   - Set up alerts for downtime
   - Monitor database connection pool

---

**Last Updated:** October 2026  
**Status:** ✅ Production Ready  
**Support:** Check logs in Render dashboard for any issues

Good luck with your demo! 🚀
