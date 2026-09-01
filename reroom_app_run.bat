@echo off
title ReRoomAI - Google Play Mobile App Studio
echo ===================================================
echo   ReRoomAI: Google Play App Development Server
echo ===================================================
echo.
cd /d "%~dp0"
echo Setting Memory Safety Limits (NODE_OPTIONS=--max-old-space-size=2048)...
set NODE_OPTIONS=--max-old-space-size=2048
echo [1/2] Starting Next.js Dev Server on Port 3002...
start "" cmd /k "set NODE_OPTIONS=--max-old-space-size=2048 && npm run dev -- -p 3002"
echo [2/2] Opening Browser (http://localhost:3002)...
timeout /t 3 /nobreak >nul
start http://localhost:3002
echo.
echo Server successfully launched on http://localhost:3002!
timeout /t 3 >nul
exit
