@echo off
echo Starting Cross-border E-commerce Product Statistics System...

start cmd /k "cd .\backend && .\start.bat"
timeout /t 5
start cmd /k "cd .\frontend && .\start.bat"

echo System starting, please wait...
echo Backend service: http://localhost:8000
echo Frontend service: http://localhost:3000