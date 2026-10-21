# 🗄️ Permanent PostgreSQL Setup for Render Free Tier

## Goal
Set up a **permanent, working PostgreSQL database** on Render's free tier that will work reliably for your production deployment.

---

## Part 1: Create New PostgreSQL Database on Render

### Step 1: Create Database

1. Go to: **https://dashboard.render.com**
2. Click **"New +"** button (top right corner)
3. Select **"PostgreSQL"**

### Step 2: Configure Database

Fill in the following settings:

| Setting | Value | Notes |
|---------|-------|-------|
| **Name** | `cis-audit-database` | Your database name (can be anything) |
| **Database** | `cisaudit` | The actual database name (used in connection) |
| **User** | `cisadmin` | Database user (used in connection) |
| **Region** | **Oregon (US West)** | Choose same region as backend for better performance |
| **PostgreSQL Version** | **16** (latest) | Or whatever is default |
| **Plan** | **Free** | 256 MB RAM, 1 GB storage, expires after 90 days |

### Step 3: Create Database

1. Click **"Create Database"** button at the bottom
2. Wait **2-5 minutes** for database creation
3. You'll see status: "Creating..." → "Available"

---

## Part 2: Get Database Connection Details

### Step 1: Find Your Database

1. In Render dashboard, click on **"cis-audit-database"**
2. You'll see the database overview page

### Step 2: Copy Connection Details

Scroll down to the **"Connections"** section. You'll see:

#### Internal Database URL (USE THIS ONE)
```
postgresql://cisadmin:XXXXXXXXXX@dpg-XXXXXXXX-a.oregon-postgres.render.com:5432/cisaudit
```

**Important Notes:**
- ✅ Use **Internal Database URL** (not External)
- ✅ The hostname MUST include full domain: `.oregon-postgres.render.com` (or similar)
- ✅ Copy the **entire URL** - it's very long
- ✅ Do NOT modify it

Example of what it should look like:
```
postgresql://cisadmin:AbCd1234567890XyZ@dpg-ct3r1b2j1k6c73abcd12-a.oregon-postgres.render.com:5432/cisaudit
                    ^^^^^^^^^^^^^^^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                    Long password         Complete hostname with full domain
```

---

## Part 3: Update Backend Environment Variables

### Step 1: Navigate to Backend Service

1. Go back to Render dashboard: https://dashboard.render.com
2. Click on **"cis-audit-api"** service

### Step 2: Update DATABASE_URL

1. Click **"Environment"** in left sidebar
2. Find **DATABASE_URL** variable
3. Click **Edit** (pencil icon)
4. **Paste the complete Internal Database URL** you copied
5. **Verify it includes:**
   - `postgresql://` at the start
   - Full hostname with `.oregon-postgres.render.com` (or similar)
   - Port `:5432`
   - Database name `/cisaudit` at the end

### Step 3: Save Changes

1. Click **"Save Changes"**
2. Render will automatically redeploy (takes 2-3 minutes)

---

## Part 4: Verify Database Connection

### Step 1: Watch Deployment Logs

1. Click **"Logs"** in left sidebar
2. Watch for these messages:

**Good Signs (✅):**
```
INFO:database:🔌 Connecting to database: ...@dpg-XXXXX-a.oregon-postgres.render.com/cisaudit
INFO:database:📝 Converted postgres:// to postgresql://
INFO:database:📝 Added psycopg driver for PostgreSQL
INFO:database:💾 Database type: PostgreSQL (production)
INFO:database:✅ Database engine created and connection tested successfully
INFO:root:✅ Database connection successful
INFO:root:✅ Database tables created/verified successfully
INFO:     Application startup complete.
==> Your service is live 🎉
```

**Bad Signs (❌):**
```
ERROR:database:❌ Database engine creation/test failed
failed to resolve host
Name or service not known
```

### Step 2: Test Backend Health

1. Open: **https://cis-audit-api.onrender.com/health**
2. Should return: `{"status":"alive"}`

### Step 3: Test Frontend Registration

1. Open: **https://cis-audit-dashboard.vercel.app/register**
2. Register new user:
   - Email: `test@example.com`
   - Password: `TestPassword123!`
   - Organization: `Test Company`
3. Should successfully register and redirect to login

---

## Part 5: Database Maintenance for Free Tier

### Important: Free Tier Limitations

Render's free PostgreSQL has these limitations:

| Limitation | Details |
|------------|---------|
| **Storage** | 1 GB |
| **RAM** | 256 MB |
| **Expiration** | **90 days** - database gets deleted! |
| **Connections** | Limited (use connection pooling) |
| **Performance** | Basic (shared resources) |

### Handling 90-Day Expiration

**Option 1: Recreate Database Every 90 Days**
- Set a calendar reminder for every 85 days
- Create new database
- Update DATABASE_URL
- Migrate data if needed

**Option 2: Export/Import Data**
```bash
# Export data before expiration
pg_dump $OLD_DATABASE_URL > backup.sql

# Import to new database
psql $NEW_DATABASE_URL < backup.sql
```

**Option 3: Use Backup Script (Automated)**
- Set up weekly backups to local storage or S3
- Restore when creating new database

### Connection Pool Configuration

Your code already uses **NullPool** which is perfect for free tier:

```python
# From backend/database.py (already configured)
engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # ✅ No connection pooling - perfect for free tier
    connect_args={
        "connect_timeout": 10,
        "options": "-c statement_timeout=30000"
    }
)
```

---

## Part 6: Monitoring and Troubleshooting

### Monitor Database Health

**Check Database Status:**
1. Go to: https://dashboard.render.com
2. Click on **"cis-audit-database"**
3. Check:
   - Status: Should be "Available"
   - Storage: Should be under 1 GB
   - Connections: Should show active connections

**Check Backend Connection:**
1. View backend logs: https://dashboard.render.com → cis-audit-api → Logs
2. Look for database connection messages

### Common Issues and Solutions

#### Issue 1: "failed to resolve host"

**Cause:** DATABASE_URL has incomplete hostname
**Solution:** 
- Verify DATABASE_URL includes full domain: `.oregon-postgres.render.com` (or similar)
- Get fresh URL from database "Connections" section

#### Issue 2: "too many connections"

**Cause:** Connection pool exhaustion (shouldn't happen with NullPool)
**Solution:**
- Verify NullPool is being used (check logs)
- Restart backend service

#### Issue 3: "password authentication failed"

**Cause:** Incorrect password in DATABASE_URL
**Solution:**
- Get fresh DATABASE_URL from Render dashboard
- Don't manually edit the password

#### Issue 4: Database is deleted after 90 days

**Cause:** Free tier limitation
**Solution:**
- Create new database
- Update DATABASE_URL
- This is expected behavior for free tier

---

## Part 7: Alternative Free PostgreSQL Providers

If you want to avoid the 90-day limitation, consider these alternatives:

### 1. **Supabase** (Recommended)
- **Free tier**: 500 MB database, unlimited API requests
- **No expiration** (as long as you use it)
- **Includes**: Auth, Storage, Realtime features
- **Setup**: https://supabase.com

### 2. **Neon** (Serverless)
- **Free tier**: 3 GB storage, 1 compute hour active
- **Serverless**: Auto-pause when inactive
- **No expiration**
- **Setup**: https://neon.tech

### 3. **ElephantSQL**
- **Free tier**: 20 MB storage (very limited)
- **No expiration**
- **Setup**: https://www.elephantsql.com

### 4. **Railway** (Alternative to Render)
- **$5 free credit** monthly
- PostgreSQL included
- Similar to Render
- **Setup**: https://railway.app

### How to Switch Providers

If you want to use any of these:

1. Create database on new provider
2. Get connection URL (PostgreSQL format)
3. Update DATABASE_URL in Render backend environment
4. Redeploy

---

## Part 8: Production Best Practices

### Environment Variables Checklist

Make sure all these are set in Render:

```bash
# Database (✅ Update this with new PostgreSQL URL)
DATABASE_URL=postgresql://cisadmin:XXX@dpg-XXX-a.oregon-postgres.render.com:5432/cisaudit

# Security (✅ Already set)
SECRET_KEY=FbbFxR1_YzgypIekvXE4YDg99UxWKYSHiez2gAC_IQ...
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS (✅ Already set)
FRONTEND_URL=https://cis-audit-dashboard.vercel.app
ALLOWED_ORIGINS=https://cis-audit-dashboard.vercel.app

# Cookies (✅ Already set)
COOKIE_SECURE=true
COOKIE_SAMESITE=lax

# Environment (✅ Already set)
APP_ENV=production
PYTHON_VERSION=3.11.0
```

### Security Checklist

- ✅ Never commit DATABASE_URL to GitHub
- ✅ Use environment variables for all secrets
- ✅ Enable SSL for database connections (default with Render)
- ✅ Use strong passwords (generated by Render)
- ✅ Regular backups (manual for free tier)

### Performance Optimization

Your code already has these optimizations:

```python
# ✅ Connection timeout (prevents hanging)
connect_timeout: 10

# ✅ Query timeout (prevents long-running queries)
statement_timeout: 30000

# ✅ NullPool (no connection pooling for serverless)
poolclass: NullPool

# ✅ Non-blocking startup (app starts even if DB fails)
# In main.py - database initialization doesn't block startup
```

---

## Quick Reference

### URLs to Bookmark

| Service | URL |
|---------|-----|
| **Render Dashboard** | https://dashboard.render.com |
| **Backend API** | https://cis-audit-api.onrender.com |
| **Backend Health** | https://cis-audit-api.onrender.com/health |
| **Frontend** | https://cis-audit-dashboard.vercel.app |
| **GitHub Repo** | https://github.com/sumit-prajapat/cis-audit-dashboard |

### DATABASE_URL Format

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
              ^      ^           ^       ^     ^
              |      |           |       |     Database name
              |      |           |       Port (5432)
              |      |           Full hostname with domain
              |      Generated password (long)
              Database user
```

### Complete Hostname Examples

✅ **Correct** (includes full domain):
```
dpg-ct3r1b2j1k6c73abcd12-a.oregon-postgres.render.com
dpg-abc123def456-a.ohio-postgres.render.com
dpg-xyz789pqr012-a.frankfurt-postgres.render.com
```

❌ **Incorrect** (incomplete):
```
dpg-da3uli2jobas739qsmjg-a  ← Missing .render.com
localhost
127.0.0.1
```

---

## Next Steps

1. **Create PostgreSQL database** on Render (Steps above)
2. **Copy Internal Database URL** (complete with full domain)
3. **Update DATABASE_URL** in cis-audit-api environment
4. **Wait for deployment** (2-3 minutes)
5. **Test health endpoint** and registration
6. **Set calendar reminder** for 85 days (to recreate before expiration)

---

## Support

If you run into issues:

1. **Check logs**: Render → cis-audit-api → Logs
2. **Verify URL**: Must include full domain suffix
3. **Check database status**: Render → cis-audit-database → Should be "Available"
4. **Try manual deploy**: Render → cis-audit-api → "Manual Deploy"

---

**This is a permanent solution for free tier with proper PostgreSQL! 🎉**
