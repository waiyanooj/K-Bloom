@echo off
cd /d "%~dp0"
node scripts\import-images.cjs %*
echo.
pause
