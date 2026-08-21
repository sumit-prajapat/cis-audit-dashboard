# 🔍 Check Render Environment Variables

## 🎯 What to Check in Render Dashboard

### 1. Go to Render Dashboard
```
https://dashboard.render.com
```

### 2. Click Your Service
```
Service Name: cis-audit-api
```

### 3. Click "Environment" Tab

### 4. Verify These Variables Exist:

#### ✅ Required Variables:

**DATABASE_URL** (MOST IMPORTANT!)
```
Should be: postgresql://postgres:SuMiT%40135520@db.wxdonlycpzfoaxqeweuy.supabase.co:5432/postgres
OR:        postgresql://postgres.wxdonlycpzfoaxqeweuy:SuMiT%40135520@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
```

**SECRET_KEY**
```
Should be: FbbFxR1_YrgyplekvXE4YDg99UxWKYSHiez2gAC_IGo
```

**APP_ENV**
```
Should be: production
```

**FRONTEND_URL**
```
Should be: https://cis-audit-dashboard.vercel.app
```

**ALLOWED_ORIGINS**
```
Should be: https://cis-audit-dashboard.vercel.app,https://cis-audit-dashboard-git-main-sumit-prajapats-projects.vercel.app
```

**COOKIE_SECURE**
```
Should be: true
```

**COOKIE_SAMESITE**
```
Should be: lax
```

**PYTHON_VERSION**
```
Should be: 3.11.0
```

---

## 🚨 Most Common Issues:

### Issue 1: DATABASE_URL is Missing
**Symptom**: "Database operation failed"  
**Fix**: Add DATABASE_URL variable

### Issue 2: DATABASE_URL Format Wrong
**Symptom**: "Database operation failed"  
**Fix**: Use correct format with URL-encoded password

### Issue 3: Password Not Encoded
**Symptom**: Connection fails  
**Fix**: Change `@` to `%40` in password

---

## 📸 What You Should See in Render Environment:

```
Environment Variables (8):

✅ APP_ENV                 production
✅ PYTHON_VERSION          3.11.0
✅ DATABASE_URL            postgresql://postgres:SuMiT%40135520@db...
✅ SECRET_KEY              FbbFxR1_YrgyplekvXE4YDg99UxWKYSHiez2gAC_IGo
✅ FRONTEND_URL            https://cis-audit-dashboard.vercel.app
✅ ALLOWED_ORIGINS         https://cis-audit-dashboard.vercel.app,...
✅ COOKIE_SECURE           true
✅ COOKIE_SAMESITE         lax
```

---

## 🔧 If DATABASE_URL is Missing:

1. Click **"Add Environment Variable"**
2. Name: `DATABASE_URL`
3. Value: 
   ```
   postgresql://postgres:SuMiT%40135520@db.wxdonlycpzfoaxqeweuy.supabase.co:5432/postgres
   ```
4. Click **"Save"**
5. Render will auto-redeploy (wait 2-3 minutes)

---

## 🔧 If DATABASE_URL is Wrong:

1. Find `DATABASE_URL` in the list
2. Click **"Edit"** (pencil icon)
3. Update value to:
   ```
   postgresql://postgres:SuMiT%40135520@db.wxdonlycpzfoaxqeweuy.supabase.co:5432/postgres
   ```
4. Click **"Save"**
5. Render will auto-redeploy (wait 2-3 minutes)

---

## 🧪 After Fixing:

### 1. Check Logs
```
Render Dashboard → Your Service → Logs tab
```

Look for:
- ✅ "Application startup complete"
- ✅ "Production mode: Use 'alembic upgrade head'"
- ❌ NO "Database connection failed"

### 2. Test Health Endpoint
```
https://cis-audit-api.onrender.com/health/ready
```

Should return:
```json
{"status":"ready","database":"connected"}
```

### 3. Test Registration
```
https://cis-audit-dashboard.vercel.app/register
```

Fill form → Submit → Should work! ✅

---

## 💡 Understanding the Connection String

```
postgresql:// postgres : SuMiT%40135520 @ db.wxdonlycpzfoaxqeweuy.supabase.co : 5432 / postgres
              │          │               │                                       │      │
              └─username └─password       └─host                                 └─port └─database
```

**Key Points**:
- Protocol: `postgresql://` (with `ql`)
- Username: `postgres`
- Password: `SuMiT%40135520` (note the `%40` instead of `@`)
- Host: `db.wxdonlycpzfoaxqeweuy.supabase.co`
- Port: `5432` (direct) or `6543` (pooler)
- Database: `postgres`

---

## 🎯 Quick Action Plan:

1. **Check**: Does DATABASE_URL exist in Render?
   - If NO → Add it
   - If YES → Check if it's correct

2. **Verify**: Password encoding
   - Should have `%40` not `@`

3. **Save**: Changes in Render

4. **Wait**: 2-3 minutes for redeploy

5. **Test**: Try registration again

---

**🚀 This should fix your "Database operation failed" error!**
