@echo off
chcp 65001 >nul
echo ============================================
echo   Personal Website Server
echo ============================================
echo.

:: Check Python
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python not found. Please install Python 3.9+ from https://python.org
    pause
    exit /b 1
)

:: Install dependencies
echo [1/3] Installing Python dependencies...
pip install -r backend\requirements.txt -q
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies.
    pause
    exit /b 1
)

:: Check if dist/ exists
if not exist "dist\" (
    echo [ERROR] dist/ folder not found.
    echo Please run:  npm run build:server
    echo Then copy the dist/ folder here.
    pause
    exit /b 1
)

:: Check .env
if not exist "backend\.env" (
    echo [WARN] No backend\.env found. Generating a random SECRET_KEY...
    echo SECRET_KEY is auto-generated and saved to backend\.secret_key
)

echo.
echo [2/3] Starting FastAPI server on port 8000...
echo.
echo  URL: http://localhost:8000
echo  To expose to internet, run ngrok in another window:
echo    ngrok http 8000
echo.
echo [3/3] Press Ctrl+C to stop.
echo ============================================
echo.

python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000

pause
