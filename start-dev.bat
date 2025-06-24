@echo off
echo Starting Merchant Stat Development Environment...
echo.

REM 检查是否存在.env文件
if not exist ".env" (
    echo Creating .env file from template...
    copy ".env.example" ".env"
    echo.
    echo Please edit .env file with your database credentials before running again.
    echo Press any key to open .env file...
    pause >nul
    notepad .env
    echo.
    echo After editing .env file, run this script again.
    pause
    exit /b
)

echo Starting Backend Server...
start "Backend" cmd /k "cd backend && python start.py"

echo Waiting for backend to start...
timeout /t 5 /nobreak >nul

echo Starting Frontend Server...
start "Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Development servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul