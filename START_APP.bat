@echo off
echo ======================================================
echo    STARTING FABRIC DEFECT DETECTION SYSTEM
echo ======================================================

:: Get Local IP
set LOCAL_IP=172.31.68.197

:: Start Backend in a new window
echo Starting Backend (FastAPI)...
start cmd /k "cd /d fabric-defect-app\backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

:: Start Frontend in a new window
echo Starting Frontend (Vite/React)...
start cmd /k "cd /d fabric-defect-app\frontend && npm run dev -- --host"

echo.
echo Both windows have been opened. 
echo Step 1: Wait for Backend to show 'Application startup complete'
echo Step 2: Scan the QR code in the Expo window with your phone.
echo.
pause
