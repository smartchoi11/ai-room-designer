@echo off
title ReRoomAI - AI Interior Redesign Studio
echo ===================================================
echo   ReRoomAI: AI Interior Redesign Studio 실행 중...
echo ===================================================
echo.
cd /d "d:\ReRoomAI\ReRoomAI"
echo [1/2] 개발 서버(npm run dev)를 기동합니다...
start "" cmd /k "npm run dev"
echo [2/2] 잠시 후 브라우저로 접속합니다 (http://localhost:3000)...
timeout /t 3 /nobreak >nul
start http://localhost:3000
echo.
echo 기동이 완료되었습니다! 이 창은 닫으셔도 됩니다.
timeout /t 3 >nul
exit