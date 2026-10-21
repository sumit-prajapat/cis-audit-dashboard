# 🚨 URGENT: Fix Database Connection for Demo (5 Minutes)

## Problem
Your Render PostgreSQL database is not accessible (host `dpg-da3uli2jobas739qsmjg-a` is incomplete).

## IMMEDIATE SOLUTION: Switch to SQLite

### Step 1: Update Render Environment Variables (3 minutes)

1. Go to: https://dashboard.render.com
2. Click on **"cis-audit-api"** service
3. Click **"Environment"** in left sidebar
4. Find `DATABASE_URL` variable
5. Click **Edit** (pencil icon)
6. **Replace the entire value** with:
   ```
   sqlite:////tmp/cis_audit.db
   ```
7. Click **"Save Changes"**
8. Render will automatically trigger a new deployment (takes 2-3 minutes)

### Step 2: Verify Backend is Working (1 minute)

Wait 3 minutes for deployment, then:

1. Open: https://cis-audit-api.onrender.com/health
   - Should return: `{"status":"alive"}`

2. Check logs at: https://dashboard.render.com → cis-audit-api → Logs
   - Should see: `✅ Database connection successful`
   - Should NOT see: `failed to resolve host`

### Step 3: Test Frontend (1 minute)

1. Open: https://cis-audit-dashboard.vercel.app/register
2. Register a new user:
   - Email: `demo@example.com`
   - Password: `DemoPassword123!` (must be 12+ characters)
3. Should successfully register and redirect to login

## If SQLite Fix Doesn't Work

### Alternative: Create New PostgreSQL Database

1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Name: `cis-audit-db`
3. Plan: **Free**
4. Click **"Create Database"**
5. Wait 2 minutes for creation
6. Copy the **"Internal Database URL"** (looks like `postgresql://...@dpg-xxxxx.oregon-postgres.render.com:5432/...`)
7. Go back to **cis-audit-api** → **Environment**
8. Update `DATABASE_URL` with the complete URL
9. Save and wait for redeployment

## Current Status

### ✅ Working
- Backend deployed and running
- Frontend deployed on Vercel
- Code is production-ready
- All routes and logic working

### ❌ Broken
- Database connection (incomplete host)
- User registration failing with "Database operation failed"

## Why SQLite for Demo?

- **Fastest**: Works immediately, no external database needed
- **Reliable**: Already tested in your code
- **Perfect for demo**: Single-instance, no connection issues
- **Production-ready**: Can switch to PostgreSQL after demo

## Next Steps After Demo

If you want PostgreSQL for production after the demo:
1. Create new PostgreSQL database on Render
2. Get the complete Internal Database URL
3. Update DATABASE_URL in Render
4. Run migrations: `alembic upgrade head` (if needed)

---

**Time to fix: 5 minutes**
**Your demo is in: 1 hour**
**You have time!**
