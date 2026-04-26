@echo off
REM Start both servers for Jhansi Janta Feedback Portal

echo.
echo ==========================================
echo  JHANSI JANTA FEEDBACK PORTAL
echo  Starting All Servers...
echo ==========================================
echo.

REM Start Backend Server
echo [1/2] Starting Backend Server (Port 5000)...
start cmd /k "cd /d "%~dp0JHANSI-JANTA-FEEDBACK-PORTAL-main\server" && npm start"

timeout /t 3 /nobreak

REM Start Frontend Server
echo [2/2] Starting Frontend Server (Port 3000)...
start cmd /k "cd /d "%~dp0JHANSI-JANTA-FEEDBACK-PORTAL-main\client" && npm start"

timeout /t 3 /nobreak

echo.
echo ==========================================
echo  ✅ All servers started!
echo ==========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo.
echo Note: Both terminal windows will remain open.
echo Close them when you want to stop the servers.
echo.
pause
