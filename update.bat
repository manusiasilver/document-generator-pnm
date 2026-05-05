@echo off
setlocal
cd /d "%~dp0"

echo [1/2] Build ulang frontend...
cd /d "%~dp0frontend"
call npm run build
if %errorLevel% neq 0 ( echo GAGAL build & pause & exit /b 1 )

echo [2/2] Restart app...
call pm2 restart doc-generator

echo.
echo Selesai! App sudah diperbarui.
pause
