# 📸 Visual Step-by-Step Fix Guide

## 🎯 Goal: Fix Database Connection in 5 Minutes

---

## Step 1: Open Render Dashboard

1. Go to: **https://dashboard.render.com**
2. Log in with your account
3. You should see your **cis-audit-api** service listed

![Render Dashboard](https://i.imgur.com/placeholder.png)

---

## Step 2: Navigate to Environment Variables

1. **Click** on **"cis-audit-api"** service
2. In the left sidebar, **click** on **"Environment"**
3. You'll see a list of all environment variables

![Environment Tab](https://i.imgur.com/placeholder.png)

---

## Step 3: Find DATABASE_URL Variable

1. Scroll through the list of variables
2. Find the one labeled **"DATABASE_URL"**
3. Current value should be something like:
   ```
   postgresql://cisadmin:QYWQYdhIZGF26EEA8wFt@dpg-da3uli2jobas739qsmjg-a:5432/cisaudit
   ```

![DATABASE_URL Variable](https://i.imgur.com/placeholder.png)

---

## Step 4: Edit DATABASE_URL

1. **Click** the **pencil icon** (✏️) next to DATABASE_URL
2. A text box will appear
3. **Select all the text** (Ctrl+A or Cmd+A)
4. **Delete** the entire value
5. **Paste** this new value:
   ```
   sqlite:////tmp/cis_audit.db
   ```
6. **Make sure there are no extra spaces** before or after

![Edit DATABASE_URL](https://i.imgur.com/placeholder.png)

**Important**: Count the slashes - there should be **4 slashes** after `sqlite:` → `sqlite:////tmp/cis_audit.db`

---

## Step 5: Save Changes

1. **Click** the **"Save Changes"** button (usually green)
2. Render will show a confirmation message
3. A new deployment will automatically start

![Save Changes](https://i.imgur.com/placeholder.png)

---

## Step 6: Watch Deployment Progress

1. **Click** on **"Logs"** in the left sidebar
2. You'll see the deployment process:
   - "==> Cloning from https://github.com/..."
   - "==> Running build..."
   - "==> Deploying..."
3. Wait for the message: **"==> Your service is live 🎉"**

![Deployment Logs](https://i.imgur.com/placeholder.png)

**Expected logs (should see these):**
```
INFO:database:🔌 Connecting to database: sqlite:///.../...
INFO:database:💾 Database type: SQLite (development)
INFO:database:✅ Database engine created and connection tested successfully
INFO:root:✅ Database connection successful
INFO:root:✅ Database tables created/verified successfully
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:10000
==> Your service is live 🎉
```

**Should NOT see:**
```
❌ ERROR:database: failed to resolve host
❌ OperationalError
```

---

## Step 7: Test Backend Health Endpoint

1. **Open a new browser tab**
2. Go to: **https://cis-audit-api.onrender.com/health**
3. You should see:
   ```json
   {"status":"alive"}
   ```

![Health Check](https://i.imgur.com/placeholder.png)

---

## Step 8: Test Frontend Registration

1. **Open a new browser tab**
2. Go to: **https://cis-audit-dashboard.vercel.app/register**
3. Fill in the registration form:
   - **Email**: `demo@example.com`
   - **Password**: `DemoPassword123!` (at least 12 characters)
   - **Confirm Password**: `DemoPassword123!`
   - **Organization Name**: `Demo Company`
4. **Click** "Create Account"

![Registration Form](https://i.imgur.com/placeholder.png)

---

## Step 9: Verify Successful Registration

After clicking "Create Account", you should:

1. See a **success message** or toast notification
2. Be **redirected to the login page** (`/login`)
3. **NOT see** any error like:
   - ❌ "Database operation failed"
   - ❌ "Cannot connect to server"
   - ❌ "Registration failed"

![Successful Registration](https://i.imgur.com/placeholder.png)

---

## Step 10: Test Login

1. On the login page, enter:
   - **Email**: `demo@example.com`
   - **Password**: `DemoPassword123!`
2. **Click** "Sign In"
3. You should be redirected to the **Dashboard** (`/dashboard`)

![Login Page](https://i.imgur.com/placeholder.png)

---

## Step 11: Verify Dashboard Access

Once logged in, you should see:

1. **Dashboard page** with navigation sidebar
2. Menu items:
   - 📊 Dashboard
   - 🖥️ Devices
   - 🔍 Scans
   - 📋 Reports
   - 🏢 Organizations
3. **No errors** or blank pages

![Dashboard](https://i.imgur.com/placeholder.png)

---

## ✅ Success Checklist

Mark these off as you complete them:

- [ ] Opened Render Dashboard
- [ ] Found cis-audit-api service
- [ ] Clicked Environment tab
- [ ] Found DATABASE_URL variable
- [ ] Edited DATABASE_URL to `sqlite:////tmp/cis_audit.db`
- [ ] Saved changes
- [ ] Watched deployment complete ("Your service is live 🎉")
- [ ] Tested /health endpoint (returns `{"status":"alive"}`)
- [ ] Registered new user successfully
- [ ] Logged in successfully
- [ ] Accessed dashboard

---

## 🆘 If Something Goes Wrong

### Error: "Database operation failed" still appears

**Solution**:
1. Go back to Render → cis-audit-api → Environment
2. **Double-check** DATABASE_URL value:
   - Must be exactly: `sqlite:////tmp/cis_audit.db`
   - Count the slashes: **4 slashes** after `sqlite:`
3. If it's wrong, edit and save again
4. Wait for new deployment (2-3 minutes)

### Error: Backend shows 500 errors

**Solution**:
1. Check Render logs: https://dashboard.render.com → cis-audit-api → Logs
2. Look for Python errors
3. Share the error in chat

### Error: "Cannot connect to server"

**Solution**:
1. Check if backend is running: https://cis-audit-api.onrender.com/health
2. If it shows `{"status":"alive"}`, the backend is fine
3. Check Vercel environment variables:
   - Go to: https://vercel.com/sumit-prajapat/cis-audit-dashboard/settings/environment-variables
   - VITE_API_URL should be: `https://cis-audit-api.onrender.com`
4. If wrong, update and redeploy Vercel

### Error: "Registration successful but can't login"

**Possible causes**:
1. Password requirements: Must be at least **12 characters**
2. Try with: `DemoPassword123!`
3. Check backend logs for authentication errors

---

## 📞 Quick Links

- **Render Dashboard**: https://dashboard.render.com
- **Backend API**: https://cis-audit-api.onrender.com
- **Backend Health**: https://cis-audit-api.onrender.com/health
- **Frontend**: https://cis-audit-dashboard.vercel.app
- **Vercel Dashboard**: https://vercel.com/dashboard

---

## ⏱️ Time Estimate

- **Step 1-6 (Fix DATABASE_URL)**: 2 minutes
- **Step 7 (Wait for deployment)**: 2-3 minutes
- **Step 8-11 (Testing)**: 3 minutes
- **Total**: **7-8 minutes**

You have **1 hour** for your demo. This leaves you with **52 minutes** buffer time!

---

## 🎉 You're Done!

Once you complete all steps, your project is:
- ✅ Fully deployed
- ✅ Database connected (SQLite)
- ✅ Frontend and backend working
- ✅ Ready for demo

**Good luck with your presentation! 🚀**
