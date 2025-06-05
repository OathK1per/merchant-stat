#!/bin/bash
echo "Starting Cross-border E-commerce Product Statistics System..."

# 启动后端服务
cd ./backend && bash ./start.sh &

# 等待后端服务启动
sleep 5

# 启动前端服务
cd ../frontend && bash ./start.sh &

echo "System starting, please wait..."
echo "Backend service: http://localhost:8000"
echo "Frontend service: http://localhost:3000"