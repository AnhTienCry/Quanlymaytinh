@echo off
title Update Frontend .env
color 0C
echo ========================================
echo   UPDATE FRONTEND .ENV
echo ========================================
echo.
echo Enter your Backend Tunnel URL (without https:// and /api):
echo.
echo Example: port-seo-rugs-jimmy.trycloudflare.com
echo.
echo IMPORTANT: Only enter the domain part!
echo Do NOT include: https:// or /api
echo.
set /p TUNNEL_URL="Backend Tunnel URL: "

if "%TUNNEL_URL%"=="" (
    echo.
    echo Error: URL cannot be empty!
    pause
    exit /b 1
)

REM Remove https:// if user accidentally included it
set TUNNEL_URL=%TUNNEL_URL:https://=%
set TUNNEL_URL=%TUNNEL_URL:http://=%

REM Remove /api if user accidentally included it
set TUNNEL_URL=%TUNNEL_URL:/api=%

echo.
echo Creating/updating frontend/.env file...
echo.

cd /d "%~dp0\frontend"

echo VITE_API_BASE_URL=https://%TUNNEL_URL%/api > .env

echo.
echo ========================================
echo   SUCCESS!
echo ========================================
echo.
echo Updated frontend/.env with:
echo VITE_API_BASE_URL=https://%TUNNEL_URL%/api
echo.
echo Next steps:
echo 1. If frontend is running, restart it (close and run 4-start-frontend-tunnel.bat again)
echo 2. If frontend is not running, run 4-start-frontend-tunnel.bat
echo.
echo Press any key to exit...
pause >nul

