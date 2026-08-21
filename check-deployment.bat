@echo off
echo ========================================
echo Checking Vercel Deployment Status
echo ========================================
echo.

echo [1/4] Checking if site is accessible...
curl -s -o nul -w "Status: %%{http_code}\n" https://cis-audit-dashboard.vercel.app
echo.

echo [2/4] Checking version endpoint...
curl -s https://cis-audit-dashboard.vercel.app/version.json
echo.
echo.

echo [3/4] Checking Quick Scan page...
curl -s -o nul -w "Status: %%{http_code}\n" https://cis-audit-dashboard.vercel.app/quick-scan
echo.

echo [4/4] Latest commits in repo:
git log --oneline -5
echo.

echo ========================================
echo Instructions:
echo ========================================
echo.
echo If version.json shows commit "50f30e5" or newer:
echo   ^> Deployment is LIVE! Clear browser cache (Ctrl+Shift+R)
echo.
echo If version.json shows 404 or older commit:
echo   ^> Go to Vercel dashboard and manually redeploy
echo   ^> URL: https://vercel.com/dashboard
echo.
echo If Quick Scan returns 200:
echo   ^> Page exists! Check if navigation is visible
echo.
echo If Quick Scan returns 404:
echo   ^> Deployment incomplete, wait 2-3 minutes and try again
echo.

pause
