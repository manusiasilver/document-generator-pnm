@echo off
PUSHD "%~dp0"
setlocal

echo =========================================
echo   Setup Document Generator - PNM
echo   Jalankan sebagai Administrator!
echo =========================================
echo.
echo Direktori project: %CD%
echo.

:: Cek apakah Admin
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERROR: Harus dijalankan sebagai Administrator!
    echo Klik kanan setup.bat lalu pilih "Run as administrator"
    POPD
    pause
    exit /b 1
)

:: Validasi folder
if not exist "frontend" (
    echo ERROR: Folder frontend tidak ditemukan di: %CD%
    POPD
    pause
    exit /b 1
)
if not exist "backend" (
    echo ERROR: Folder backend tidak ditemukan di: %CD%
    POPD
    pause
    exit /b 1
)

echo [1/6] Install PM2 (process manager)...
call npm install -g pm2
if %errorLevel% neq 0 ( echo GAGAL install PM2 & POPD & pause & exit /b 1 )

echo.
echo [2/6] Install frontend dependencies...
PUSHD frontend
call npm install
if %errorLevel% neq 0 ( echo GAGAL install frontend & POPD & POPD & pause & exit /b 1 )

echo.
echo [3/6] Build frontend...
call npm run build
if %errorLevel% neq 0 ( echo GAGAL build frontend & POPD & POPD & pause & exit /b 1 )
POPD

echo.
echo [4/6] Install backend dependencies...
PUSHD backend
call npm install
if %errorLevel% neq 0 ( echo GAGAL install backend & POPD & POPD & pause & exit /b 1 )

echo.
echo [5/6] Start app dengan PM2 (background)...
call pm2 start ecosystem.config.cjs
call pm2 save
POPD

echo.
echo [6/6] Setup port forwarding 80 -> 3001...
netsh interface portproxy add v4tov4 listenport=80 listenaddress=0.0.0.0 connectport=3001 connectaddress=127.0.0.1
netsh advfirewall firewall add rule name="DocGenerator Port 80" dir=in action=allow protocol=TCP localport=80

echo.
echo =========================================
echo   SETUP SELESAI!
echo.
echo   Akses aplikasi di:
echo   - http://localhost         (komputer ini)
echo   - http://[IP-SERVER]       (dari komputer lain)
echo.
echo   Untuk setting domain lokal, lihat instruksi
echo   di file README-DOMAIN.md
echo =========================================
POPD
pause
