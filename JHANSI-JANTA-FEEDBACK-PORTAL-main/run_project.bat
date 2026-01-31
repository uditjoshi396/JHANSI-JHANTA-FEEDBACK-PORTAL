@echo off
echo ========================================
echo Janata Feedback Portal Setup Script
echo ========================================
echo This script will set up and run the project.
echo Ensure Node.js, npm, and MongoDB are installed.
echo.

REM Check if MongoDB is running (basic check)
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if %ERRORLEVEL% neq 0 (
    echo MongoDB is not running. Please start MongoDB first.
    pause
    exit /b 1
)

echo MongoDB is running. Proceeding...
echo.

REM Server setup
echo Setting up server...
cd server
if not exist .env (
    echo Copying .env.example to .env...
    copy .env.example .env
    echo Please edit .env file with your configurations (MONGO_URI, JWT_SECRET, etc.).
    pause
)
echo Installing server dependencies...
npm install
echo Starting server in background...
start "Server" cmd /k "npm run dev"
cd ..
echo.

REM Client setup
echo Setting up client...
cd client
echo Installing client dependencies...
npm install
echo Starting client...
start "Client" cmd /k "npm start"
cd ..
echo.

echo ========================================
echo Setup complete!
echo - Server running at http://localhost:5000
echo - Client running at http://localhost:3000
echo ========================================
pause
