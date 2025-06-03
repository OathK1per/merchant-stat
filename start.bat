@echo off
echo 正在启动跨境电商商品统计系统...

start cmd /k "cd backend && start.bat"
timeout /t 5
start cmd /k "cd frontend && start.bat"

echo 系统启动中，请稍候...
echo 后端服务地址: http://localhost:8000
echo 前端服务地址: http://localhost:3000