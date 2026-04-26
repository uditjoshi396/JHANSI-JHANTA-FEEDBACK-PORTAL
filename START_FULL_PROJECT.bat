@echo off
setlocal enabledelayedexpansion

echo ========================================
echo JHANSI JANTA FEEDBACK PORTAL
echo Full Project Startup
echo ========================================
echo.

REM Set MongoDB path
set "MONGO_BIN=C:\MongoDB\mongodb-win32-x86_64-windows-8.0.9\bin"
set "PROJECT_DIR=%~dp0JHANSI-JANTA-FEEDBACK-PORTAL-main"
set "SERVER_DIR=%PROJECT_DIR%\server"
set "CLIENT_DIR=%PROJECT_DIR%\client"

echo [1/4] Starting MongoDB...
start "MongoDB Server" cmd /k "cd /d "%MONGO_BIN%" && mongod --dbpath C:\data\db"

timeout /t 5 /nobreak >nul

echo [2/4] Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "cd /d "%SERVER_DIR%" && npm start"

timeout /t 5 /nobreak >nul

echo [3/4] Starting Frontend Client (Port 3000)...
start "Frontend Client" cmd /k "cd /d "%CLIENT_DIR%" && npm start"

timeout /t 3 /nobreak >nul

echo.
echo ========================================
echo ALL SERVICES STARTED!
echo ========================================
echo.
echo MongoDB:   mongodb://localhost:27017
echo Backend:   http://localhost:5000
echo Frontend:  http://localhost:3000
echo.
echo Close the terminal windows when done.
echo ========================================
pause

