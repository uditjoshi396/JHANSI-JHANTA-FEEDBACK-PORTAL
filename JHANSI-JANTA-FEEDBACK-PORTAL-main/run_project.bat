@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Janata Feedback Portal Setup Script
echo ========================================
echo This script will set up and run the project.
echo Ensure Node.js, npm, and MongoDB are installed.
echo.

REM Basic MongoDB check
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I "mongod.exe" >NUL
if %ERRORLEVEL% neq 0 (
    echo MongoDB is not running. Please start MongoDB first.
    pause
    exit /b 1
)

echo MongoDB is running. Proceeding...
echo.
echo STEP1

REM Helper to run commands in quoted subfolders safely
set "BASE_DIR=%CD%\"
set "SERVER_DIR=%BASE_DIR%server"
set "CLIENT_DIR=%BASE_DIR%client"
echo STEP2: BASE_DIR="%BASE_DIR%"
echo STEP2: SERVER_DIR="%SERVER_DIR%"
echo STEP2: CLIENT_DIR="%CLIENT_DIR%"

REM Server setup
if exist "%SERVER_DIR%" (
    echo Setting up server in "%SERVER_DIR%"...
    pushd "%SERVER_DIR%"
    if not exist ".env" (
        if exist ".env.example" (
            echo Copying .env.example to .env...
            copy /Y ".env.example" ".env" >NUL
            echo Please edit .env file with your configurations ^(MONGO_URI, JWT_SECRET, etc.^).
            pause
        ) else (
            echo No .env.example found. Please create a .env in server folder.
        )
    )
    echo Installing server dependencies...
    npm install
    echo Starting server in new window ^(dev^)...
    start "Server" cmd /k "cd /d ""%SERVER_DIR%"" && npm run dev"
    popd
) else (
    echo Server folder not found: "%SERVER_DIR%"
)

echo.
REM Client setup
if exist "%CLIENT_DIR%" (
    echo Setting up client in "%CLIENT_DIR%"...
    pushd "%CLIENT_DIR%"
    echo Installing client dependencies ^(this may take a while^)...
    npm install
    echo Starting client in new window...
    start "Client" cmd /k "cd /d ""%CLIENT_DIR%"" && npm start"
    popd
) else (
    echo Client folder not found: "%CLIENT_DIR%"
)

echo.
echo ========================================
echo Setup requested. Check the new windows titled "Server" and "Client" for logs.
echo - Server expected at http://localhost:5000
echo - Client expected at http://localhost:3000
echo ========================================
endlocal
pause
