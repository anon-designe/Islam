@echo off
chcp 65001 >nul
title Islam Time
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
echo  جاري تشغيل Islam Time...
echo.

npm start

pause
