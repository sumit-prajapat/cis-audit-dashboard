@echo off
echo ===============================================
echo MANUAL VERCEL DEPLOYMENT
echo ===============================================
echo.
echo This will deploy your site directly to Vercel
echo bypassing the automatic GitHub deployment.
echo.
pause

echo.
echo [Step 1] Installing Vercel CLI...
npm install -g vercel

echo.
echo [Step 2] Building frontend...
cd frontend
call npm install
call npm run build

echo.
echo [Step 3] Deploying to Vercel...
echo You'll need to login and link the project.
vercel --prod

echo.
echo ===============================================
echo DEPLOYMENT COMPLETE!
echo ===============================================
echo.
echo Your site should now be live at:
echo https://cis-audit-dashboard.vercel.app
echo.
echo Try accessing it in a new incognito window.
echo.
pause
