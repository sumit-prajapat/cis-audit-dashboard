# 🔧 Step-by-Step PostgreSQL Fix for Free Tier

## What We're Going to Do

1. Check if you have an existing PostgreSQL database on Render
2. If NO → Create a new one
3. Get the complete, correct DATABASE_URL
4. Update your backend environment
5. Test everything works

**Time needed: 10-15 minutes**

---

## Step 1: Check Your Current Setup (2 minutes)

### 1.1 Open Render Dashboard

Go to: **https://dashboard.render.com**

### 1.2 Look for PostgreSQL Database

On your dashboard, you should see a list of services. Look for:
- Services with a **🗄️ database icon**
- Type: "PostgreSQL"
- Names might be: "cis-audit-db", "cisaudit", "database", etc.

### 1.3 Answer This Question

**Do you see a PostgreSQL database in your Render dashboard?**

---

## SCENARIO A: YES - I See a PostgreSQL Database

If you answered **YES**, follow these steps:

### A1: Click on Your Database

1. Click on the PostgreSQL database in your dashboard
2. You'll see the database details page

### A2: Check Database Status

Look at the top of the page for the **Status** indicator:

**If Status = "Available"** (Green):
- ✅ Your database is working!
- ✅ Continue to step A3

**If Status = "Suspended"** or "Deleted" (Red):
- ❌ Database is not usable
- ❌ Skip to **SCENARIO B** to create a new one

**If Status = "Creating"** (Yellow):
- ⏳ Wait 2-3 more minutes
- ⏳ Refresh the page
- ⏳ Then continue to step A3

### A3: Get the Internal Database URL

1. Scroll down to the **"Connections"** section (or "Connection" tab)
2. You'll see several connection strings
3. Find the one labeled: **"Internal Database URL"**
4. Click the **copy icon** 📋 next to it

**The URL should look like this:**
```
postgresql://cisadmin:Abc123Xyz789@dpg-ct3r1b2j1k6c73abcd12-a.oregon-postgres.render.com:5432/cisaudit
```

**Important checks:**
- ✅ Must start with `postgresql://` or `postgres://`
- ✅ Must include full hostname with `.render.com` at the end
- ✅ Must include `:5432` port
- ✅ Must end with `/cisaudit` (or your database name)

### A4: Update Backend Environment

1. Go back to Render dashboard
2. Click on **"cis-audit-api"** service
3. Click **"Environment"** in left sidebar
4. Find **DATABASE_URL** variable
5. Click **Edit** (pencil icon ✏️)
6. **Delete the old value completely**
7. **Paste the new URL** you copied in step A3
8. Click **"Save Changes"**

### A5: Wait for Redeployment

1. Render will automatically start a new deployment
2. Click **"Logs"** in left sidebar to watch progress
3. Wait for: **"==> Your service is live 🎉"** (takes 2-3 minutes)

### A6: Verify It Works

1. Open: https://cis-audit-api.onrender.com/health
   - Should return: `{"status":"alive"}`

2. Check logs for these messages:
   ```
   ✅ INFO:database:💾 Database type: PostgreSQL (production)
   ✅ INFO:database:✅ Database engine created and connection tested successfully
   ✅ INFO:root:✅ Database connection successful
   ```

3. Test frontend registration:
   - Go to: https://cis-audit-dashboard.vercel.app/register
   - Register a new user
   - Should work without errors

**✅ If everything works → YOU'RE DONE! Skip to "Final Testing"**

---

## SCENARIO B: NO - I Don't See a PostgreSQL Database

If you answered **NO**, you need to create a new database:

### B1: Create New PostgreSQL Database

1. In Render dashboard, click **"New +"** button (top right)
2. Select **"PostgreSQL"** from the dropdown

### B2: Configure Database Settings

Fill in the form with these values:

| Field | Value | Why |
|-------|-------|-----|
| **Name** | `cis-audit-database` | This is just a label for Render dashboard |
| **Database** | `cisaudit` | This is the actual database name (used in connection) |
| **User** | `cisadmin` | Database username (used in connection) |
| **Region** | **Oregon (US West)** | Same region as your backend for faster connections |
| **PostgreSQL Version** | **16** (or latest available) | Latest version |
| **Datadog API Key** | Leave empty | Not needed for free tier |
| **Plan** | **Free** | Free tier: 256 MB RAM, 1 GB storage |

### B3: Create Database

1. Review your settings
2. Click **"Create Database"** button at the bottom
3. You'll be redirected to the database page
4. Status will show: **"Creating..."**

### B4: Wait for Creation

1. Wait **2-5 minutes** for database creation
2. Refresh the page every 30 seconds
3. Status will change from "Creating..." to **"Available"**
4. Once it shows "Available", continue to next step

### B5: Get Database Connection URL

1. On the database page, scroll to **"Connections"** section
2. Find **"Internal Database URL"**
3. Click the **copy icon** 📋 next to it

**The URL will look like:**
```
postgresql://cisadmin:SomeRandomPassword123@dpg-abc123def456-a.oregon-postgres.render.com:5432/cisaudit
```

**Important:** Copy the **entire URL** - it's very long!

### B6: Update Backend Environment

1. Go back to Render dashboard (main page)
2. Click on **"cis-audit-api"** service
3. Click **"Environment"** in left sidebar
4. Find **DATABASE_URL** variable
5. Click **Edit** (pencil icon ✏️)
6. **Delete the old value completely**
7. **Paste the new URL** you copied in step B5
8. **Double-check:** URL must include full hostname with `.render.com`
9. Click **"Save Changes"**

### B7: Trigger Redeployment

1. Render will automatically start redeploying
2. OR manually trigger: Click **"Manual Deploy"** → "Deploy latest commit"
3. Click **"Logs"** to watch progress
4. Wait for: **"==> Your service is live 🎉"** (2-3 minutes)

### B8: Verify Database Connection

Watch the logs for these messages:

**Good signs (✅):**
```
INFO:database:🔌 Connecting to database: ...@dpg-XXX-a.oregon-postgres.render.com/cisaudit
INFO:database:📝 Converted postgres:// to postgresql://
INFO:database:📝 Added psycopg driver for PostgreSQL
INFO:database:💾 Database type: PostgreSQL (production)
INFO:database:✅ Database engine created and connection tested successfully
INFO:root:✅ Database connection successful
INFO:root:✅ Database tables created/verified successfully
```

**Bad signs (❌):**
```
ERROR:database:❌ Database engine creation/test failed
failed to resolve host 'dpg-XXXXX-a'
Name or service not known
password authentication failed
```

If you see bad signs, check:
- DATABASE_URL includes full hostname with `.render.com`
- DATABASE_URL was copied correctly without truncation
- Database status is "Available" in Render dashboard

---

## Step 2: Final Testing (3 minutes)

### Test 1: Backend Health Check

1. Open in browser: **https://cis-audit-api.onrender.com/health**
2. Expected response:
   ```json
   {"status":"alive"}
   ```
3. If you see this → Backend is running ✅

### Test 2: Backend Root Endpoint

1. Open: **https://cis-audit-api.onrender.com/**
2. Expected response: JSON with application info
3. Should NOT see: 500 errors, "Database operation failed"

### Test 3: Frontend - User Registration

1. Open: **https://cis-audit-dashboard.vercel.app/register**
2. Fill in form:
   - **Email**: `test123@example.com`
   - **Password**: `TestPassword123!` (minimum 12 characters)
   - **Confirm Password**: `TestPassword123!`
   - **Organization**: `Test Company`
3. Click **"Create Account"**
4. Expected result:
   - ✅ Success message or toast
   - ✅ Redirected to `/login` page
   - ❌ NOT "Database operation failed"
   - ❌ NOT "Cannot connect to server"

### Test 4: Login with New User

1. On login page, enter:
   - **Email**: `test123@example.com`
   - **Password**: `TestPassword123!`
2. Click **"Sign In"**
3. Expected result:
   - ✅ Successfully logged in
   - ✅ Redirected to `/dashboard`
   - ✅ Can see dashboard with navigation

### Test 5: Navigate Through App

Click through these pages to verify everything works:
- 📊 Dashboard (overview)
- 🖥️ Devices (device management)
- 🔍 Scans (security scans)
- 📋 Reports (compliance reports)
- 🏢 Organizations (org management)

All pages should load without errors.

---

## Step 3: Verify Database Content (Optional)

### Check Database Tables Were Created

1. Go to Render dashboard
2. Click on your **cis-audit-database**
3. Look for **"Query"** or **"Console"** tab (if available)
4. Or use connection URL with `psql` command:

```bash
# From your local machine (if you have psql installed)
psql "postgresql://cisadmin:XXX@dpg-XXX-a.oregon-postgres.render.com:5432/cisaudit"

# Then run:
\dt

# Should see tables like:
# users
# organizations  
# devices
# scans
# reports
# user_organizations
# device_scans
# scan_checks
```

### Check User Was Created

```sql
SELECT id, email, organization_name, created_at 
FROM users 
WHERE email = 'test123@example.com';

-- Should return 1 row with your test user
```

---

## Common Issues and Solutions

### Issue 1: "failed to resolve host"

**Symptom:**
```
ERROR:database: failed to resolve host 'dpg-XXXXX-a'
```

**Cause:** DATABASE_URL has incomplete hostname (missing `.render.com`)

**Solution:**
1. Go to your PostgreSQL database on Render
2. Copy the **Internal Database URL** again
3. Make sure it includes: `.oregon-postgres.render.com` (or similar)
4. Update DATABASE_URL in backend environment
5. Save and redeploy

### Issue 2: "password authentication failed"

**Symptom:**
```
ERROR: password authentication failed for user "cisadmin"
```

**Cause:** Wrong password in DATABASE_URL

**Solution:**
1. Don't manually edit DATABASE_URL
2. Copy the complete URL from Render database "Connections" section
3. Paste it exactly as-is

### Issue 3: "too many connections"

**Symptom:**
```
ERROR: too many connections for role "cisadmin"
```

**Cause:** Connection pool exhaustion (rare with NullPool)

**Solution:**
1. Restart backend service: Render → cis-audit-api → Settings → "Restart Service"
2. If persists, check database connections: Render → database → "Connections" tab

### Issue 4: Backend deploys but database operations fail

**Symptom:**
- Backend shows "alive" on /health
- But registration fails with "Database operation failed"

**Cause:** Database tables not created

**Solution:**
1. Check backend logs for database initialization errors
2. Tables are auto-created on startup by SQLAlchemy
3. If not created, manually run migrations:
   ```bash
   # In backend directory
   alembic upgrade head
   ```
4. Or restart backend service to trigger table creation again

### Issue 5: Frontend shows "Cannot connect to server"

**Symptom:**
- Frontend can't reach backend
- Network errors in browser console

**Cause:** CORS or backend not running

**Solution:**
1. Check backend is running: https://cis-audit-api.onrender.com/health
2. Check CORS settings in Render environment:
   - FRONTEND_URL = `https://cis-audit-dashboard.vercel.app`
   - ALLOWED_ORIGINS = `https://cis-audit-dashboard.vercel.app`
3. Check VITE_API_URL in Vercel:
   - Should be: `https://cis-audit-api.onrender.com`

---

## Environment Variables Checklist

Make sure these are set correctly in **Render → cis-audit-api → Environment**:

```bash
# ✅ DATABASE_URL - UPDATE THIS with new PostgreSQL URL
DATABASE_URL=postgresql://cisadmin:XXX@dpg-XXX-a.oregon-postgres.render.com:5432/cisaudit

# ✅ These should already be set (don't change)
SECRET_KEY=FbbFxR1_YzgypIekvXE4YDg99UxWKYSHiez2gAC_IQ...
FRONTEND_URL=https://cis-audit-dashboard.vercel.app
ALLOWED_ORIGINS=https://cis-audit-dashboard.vercel.app
APP_ENV=production
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
PYTHON_VERSION=3.11.0
```

---

## Success Checklist

Mark these off as you complete:

- [ ] Checked Render dashboard for PostgreSQL database
- [ ] Created new database OR found existing "Available" database
- [ ] Copied complete Internal Database URL (includes `.render.com`)
- [ ] Updated DATABASE_URL in cis-audit-api environment
- [ ] Saved changes and waited for redeployment
- [ ] Backend logs show "Database connection successful"
- [ ] Health endpoint returns `{"status":"alive"}`
- [ ] Can register new user on frontend
- [ ] Can login with new user
- [ ] Can access dashboard and navigate pages

---

## Important Notes for Free Tier

### 90-Day Expiration

Render's free PostgreSQL databases expire after **90 days**. This means:

- ⏰ Set a reminder for **85 days** from now
- 📅 Before expiration, create a new database
- 🔄 Export data from old database, import to new one
- 🔗 Update DATABASE_URL with new database

### Storage Limit

Free tier has **1 GB storage**. Monitor usage:

- Go to: Render → cis-audit-database
- Check "Storage" or "Metrics"
- If approaching 1 GB, consider:
  - Deleting old data
  - Upgrading to paid plan ($7/month for 10 GB)
  - Using external storage for large files

### Connection Limits

Free tier has limited concurrent connections:

- Your code already uses **NullPool** (no connection pooling)
- This is optimal for free tier
- Don't change pooling settings

---

## Alternative: Use Supabase (No 90-Day Limit)

If you want to avoid the 90-day expiration, consider **Supabase**:

### Supabase Free Tier

- ✅ **500 MB** database storage
- ✅ **No expiration** (as long as you use it monthly)
- ✅ Includes auth, storage, realtime features
- ✅ PostgreSQL compatible

### How to Switch to Supabase

1. Create account: https://supabase.com
2. Create new project (takes 2 minutes)
3. Go to: Project Settings → Database
4. Copy **Connection String** (URI format)
5. Update DATABASE_URL in Render
6. Done!

---

## Timeline Summary

- **Check database status**: 1 minute
- **Create database** (if needed): 5 minutes
- **Update environment**: 2 minutes
- **Redeployment**: 3 minutes
- **Testing**: 3 minutes
- **Total**: 14 minutes

---

## Next Steps

1. **Follow either SCENARIO A or B** above (depending on your situation)
2. **Test everything** works (Step 2: Final Testing)
3. **Set calendar reminder** for 85 days (to handle expiration)
4. **Document your DATABASE_URL** (save in password manager - don't commit to Git!)

---

## Getting Help

If you get stuck:

1. **Check the logs**: Render → cis-audit-api → Logs
2. **Verify DATABASE_URL format**: Must include full `.render.com` domain
3. **Check database status**: Must be "Available"
4. **Share error messages**: Copy exact error from logs

---

**You're setting up a permanent, professional PostgreSQL database! 🚀**

This will work reliably for free tier with proper 90-day maintenance.
