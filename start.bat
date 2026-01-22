@echo off
echo ========================================
echo   MM v1.0.0 - 起動中...
echo ========================================
echo.
echo ブラウザで以下のURLを開いてください:
echo   http://localhost:8000
echo.
echo 終了するには Ctrl+C を押してください
echo.
cd /d "%~dp0"
start http://localhost:8000
python -m http.server 8000
