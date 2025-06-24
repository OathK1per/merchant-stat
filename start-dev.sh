#!/bin/bash

echo "Starting Merchant Stat Development Environment..."
echo

# 检查是否存在.env文件
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp ".env.example" ".env"
    echo
    echo "Please edit .env file with your database credentials before running again."
    echo "Opening .env file for editing..."
    
    # 尝试使用不同的编辑器
    if command -v code &> /dev/null; then
        code .env
    elif command -v nano &> /dev/null; then
        nano .env
    elif command -v vim &> /dev/null; then
        vim .env
    else
        echo "Please manually edit .env file with your preferred editor."
    fi
    
    echo
    echo "After editing .env file, run this script again."
    exit 1
fi

echo "Starting Backend Server..."
cd backend
python start.py &
BACKEND_PID=$!
cd ..

echo "Waiting for backend to start..."
sleep 5

echo "Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo
echo "Development servers are running..."
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo
echo "Press Ctrl+C to stop all servers"

# 捕获Ctrl+C信号并清理进程
trap 'echo "\nStopping servers..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit' INT

# 等待进程结束
wait