@echo off
chcp 65001 > nul
title ReRoom AI (한국어 전용 스튜디오) - Port 3001

echo ===================================================
echo 🇰🇷 ReRoom AI (한국어 전용 스튜디오) 개발 서버 시작
echo ===================================================
echo.
echo 포트 3001에서 실행됩니다... (글로벌 3000번 포트와 동시 실행 가능)
echo 웹 브라우저: http://localhost:3001
echo.

cd /d "%~dp0"
call npm run dev -- -p 3001

pause
