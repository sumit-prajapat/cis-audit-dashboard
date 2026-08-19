# Deploy Backend to Railway

## Current Deployment:
- **Hugging Face**: https://mk1311-cis-audit-api.hf.space
- **Supabase DB**: https://wxdonlycpzfoaxqeweuy.supabase.co
- **Vercel Frontend**: https://cis-audit-dashboard.vercel.app

## Keep Backend Alive (Prevent Sleep):

### Option 1: GitHub Actions (Automated) ✅ DONE
- Created `.github/workflows/keep-alive.yml`
- Pings backend every 10 minutes automatically
- Enable it: Go to GitHub Actions tab and enable workflows

### Option 2: UptimeRobot (Free Forever)
1. Sign up: https://uptimerobot.com/
2. Add New Monitor:
   - Type: HTTP(s)
   - URL: https://mk1311-cis-audit-api.hf.space/health
   - Interval: 10 minutes
3. Done! UptimeRobot will ping every 10 min

### Option 3: Cron-job.org
1. Sign up: https://cron-job.org/
2. Create Job:
   - URL: https://mk1311-cis-audit-api.hf.space/health
   - Schedule: */10 * * * * (every 10 min)
3. Save

### Option 4: Keep-alive HTML Page
- Open `keep-alive.html` in browser
- Keep tab open (it auto-pings every 10 min)
- Or deploy it to Vercel/Netlify

## Configure Vercel Frontend:
1. Go to: https://vercel.com/sumit-prajapats-projects/cis-audit-dashboard
2. Settings → Environment Variables
3. Add: `VITE_API_URL` = `https://mk1311-cis-audit-api.hf.space`
4. Redeploy frontend

## Test Full Stack:
1. Visit: https://cis-audit-dashboard.vercel.app/register
2. Create account - should work now!

