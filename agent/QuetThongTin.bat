@echo off
chcp 65001 >nul

:: File này sẽ tự động chạy agent và đóng ngay
:: Không hiện cửa sổ console

:: Lấy đường dẫn (thư mục chứa file này)
set AGENT_DIR=%~dp0
cd /d "%AGENT_DIR%"

:: Kiểm tra Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    :: Không có Node.js, tạo file hướng dẫn và mở
    (
    echo Node.js chua cai dat!
    echo Vui long tai va cai dat tu: https://nodejs.org/
    ) > "%TEMP%\qlmt-nodejs.txt"
    notepad "%TEMP%\qlmt-nodejs.txt"
    start https://nodejs.org/
    exit /b 1
)

:: Cài dependencies nếu chưa có (chạy ngầm)
if not exist "node_modules" (
    start /min cmd /c "npm install --silent"
    timeout /t 5 /nobreak >nul
)

:: Thêm vào Startup (tự động chạy khi Windows khởi động)
set STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup

:: Tạo VBS để chạy ngầm
(
echo Set WshShell = CreateObject^("WScript.Shell"^)
echo WshShell.CurrentDirectory = "%AGENT_DIR%"
echo WshShell.Run "node server.js", 0, False
) > "%AGENT_DIR%qlmt-agent.vbs"

:: Copy vào Startup
copy /Y "%AGENT_DIR%qlmt-agent.vbs" "%STARTUP%\QLMT-Agent.vbs" >nul 2>nul

:: Tắt agent cũ nếu đang chạy
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001 ^| findstr LISTENING 2^>nul') do (
    taskkill /F /PID %%a >nul 2>nul
)

:: Chạy agent ngầm (không hiện cửa sổ)
start "" /min wscript "%AGENT_DIR%qlmt-agent.vbs"

:: Đợi agent khởi động
timeout /t 3 /nobreak >nul

:: Tự động đóng file này
exit

