@echo off
PUSHD "%~dp0"
setlocal

echo [1/2] Build ulang frontend...
PUSHD frontend
call npm run build
if %errorLevel% neq 0 ( echo GAGAL build & POPD & POPD & pause & exit /b 1 )
POPD

echo [2/2] Restart app...
call pm2 restart doc-generator

echo.
echo Selesai! App sudah diperbarui.
POPD
pause
