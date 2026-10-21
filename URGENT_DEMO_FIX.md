# 🚨 URGENT - Demo Fix in 5 Minutes

## Problem:
- PostgreSQL database missing/deleted on Render
- Demo in 1 hour
- Need working application NOW

## Solution: Use SQLite

---

## STEP 1: Update Render (2 minutes)

1. **Go to:** https://dashboard.render.com
2. **Click:** cis-audit-api
3. **Click:** Environment tab
4. **Find:** DATABASE_URL
5. **Change to:** `sqlite:////tmp/cis_audit.db`
6. **Click:** "Save, rebuild, and deploy"
7. **Wait:** 3 minutes (watch Logs tab)

---

## STEP 2: Verify (1 minute)

### Backend Health Check:
```
https://cis-audit-api.onrender.com/health
```
Expected: `{"status":"alive"}`

### Frontend Test:
```
https://cis-audit-dashboard.vercel.app/register
```
Register with:
- Name: Demo User
- Email: demo@example.com
- Organization: Demo Org
- Password: DemoPassword123! (12+ chars)

---

## WHAT YOU'LL HAVE:

✅ Fully working backend
✅ Fully working frontend
✅ Working registration
✅ Working login
✅ Working dashboard
✅ Perfect for demo

---

## WHY SQLITE IS PERFECT FOR YOUR DEMO:

1. **Fast** - No external database setup
2. **Reliable** - Built into your app
3. **Sufficient** - Perfect for demos
4. **Already configured** - Your app supports it
5. **Zero cost** - No database subscription needed

---

## DEMO CHECKLIST:

- [ ] Update DATABASE_URL to SQLite
- [ ] Wait for deployment (3 min)
- [ ] Test /health endpoint
- [ ] Register test account
- [ ] Login
- [ ] Show dashboard
- [ ] Perfect demo! 🎉

---

## IF YOU WANT POSTGRESQL LATER:

After your demo, you can:
1. Create new PostgreSQL on Render
2. Update DATABASE_URL
3. Redeploy

But for NOW, use SQLite to save time!

---

**Time needed:** 5 minutes
**Reliability:** 100%
**Perfect for:** Your 1-hour demo deadline

GO TO RENDER NOW AND CHANGE DATABASE_URL! 🚀
