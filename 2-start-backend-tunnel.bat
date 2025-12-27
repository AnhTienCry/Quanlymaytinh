@echo off
title Backend Server + Tunnel
color 0B
echo ========================================
echo    BACKEND SERVER + TUNNEL
echo ========================================
echo.
echo Starting Backend Server...
echo.

REM Start backend in a new window
start "Backend Server" cmd /k "cd /d %~dp0\backend && npm run dev"

REM Wait a bit for backend to start
timeout /t 5 /nobreak >nul

echo.
echo Backend should be running now.
echo Starting Backend Tunnel...
echo.
echo AFTER getting the URL:
echo 1. Copy the URL (e.g., https://abc-xyz.trycloudflare.com)
echo 2. Run: update-frontend-env.bat
echo 3. Or manually create frontend/.env with:
echo    VITE_API_BASE_URL=https://abc-xyz.trycloudflare.com/api
echo.
echo Press any key to start tunnel...
pause >nul
echo.

cd /d "%~dp0"
.\cloudflared.exe tunnel --url http://localhost:3000
pause
