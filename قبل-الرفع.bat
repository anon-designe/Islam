@echo off
chcp 65001 >nul
title Islam Time - تحديث المكتبة
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
    echo.
    echo  Node.js غير مثبت. حمّله من: https://nodejs.org
    echo.
    pause
    exit /b 1
)

echo.
echo  تحديث مكتبة الصور...
echo.

npm run prepare:push

echo.
echo  تم! الآن ارفع التغييرات الى GitHub:
echo    git add .
echo    git commit -m "update"
echo    git push
echo.
pause
