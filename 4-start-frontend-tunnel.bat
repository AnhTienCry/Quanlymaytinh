@echo off
title Frontend Server + Tunnel
color 0D
echo ========================================
echo    FRONTEND SERVER + TUNNEL
echo ========================================
echo.
echo IMPORTANT: Make sure you have updated frontend/.env
echo with the Backend Tunnel URL first!
echo.
echo Starting Frontend Server...
echo.

REM Start frontend in a new window
start "Frontend Server" cmd /k "cd /d %~dp0\frontend && npm run dev"

REM Wait a bit for frontend to start
timeout /t 5 /nobreak >nul

echo.
echo Frontend should be running now.
echo Starting Frontend Tunnel...
echo.
echo Copy the URL and share it with people to test!
echo.
echo Press any key to start tunnel...
pause >nul
echo.

cd /d "%~dp0"
.\cloudflared.exe tunnel --url http://localhost:5173
pause
