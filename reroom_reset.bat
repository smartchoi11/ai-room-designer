@echo off
chcp 65001 >nul
title AI RESET - Auto Fix & Restart
echo ===================================================
echo   AI RESET: 에러 자동 정리 및 개발 서버 재실행
echo ===================================================
echo.

cd /d "d:\ReRoomAI\ReRoomAI"

echo [1/3] 멈추거나 엉킨 Node.js 프로세스 정리 중...
taskkill /F /IM node.exe /T >nul 2>&1

echo [2/3] Next.js 캐시 파일 (.next) 삭제 중...
if exist ".next" (
    rd /s /q ".next"
)

echo [3/3] 개발 서버를 새로 시작합니다 (npm run dev)...
start "" cmd /k "npm run dev"

echo.
echo 3초 후 브라우저(http://localhost:3000)를 엽니다...
timeout /t 3 /nobreak >nul
start http://localhost:3000

echo.
echo AI RESET 완료!
timeout /t 2 >nul
exit
