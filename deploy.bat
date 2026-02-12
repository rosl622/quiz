@echo off
chcp 65001
echo ========================================
echo  GitHub 배포 자동화 스크립트
echo ========================================

echo.
echo 1. Git 상태 확인...
git status

echo.
echo 2. 변경사항 추가 (git add .)...
git add .

echo.
set /p commitMsg="3. 커밋 메시지를 입력하세요 (예: 업데이트): "
git commit -m "%commitMsg%"

echo.
echo 4. GitHub로 푸시 (git push)...
git push

echo.
echo ========================================
echo  배포 프로세스 완료!
echo  Vercel에 연결되어 있다면 자동으로 배포됩니다.
echo ========================================
pause
