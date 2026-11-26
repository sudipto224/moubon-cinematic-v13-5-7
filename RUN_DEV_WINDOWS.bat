@echo off
setlocal
cd /d "%~dp0"
echo =================================================
echo MOUBON V12.1 - Cinematic Sundarbans Story
echo Open Chrome: http://localhost:5173/
echo Press Ctrl+C to stop this server.
echo =================================================
where node >nul 2>&1
if errorlevel 1 (
  echo Node.js 18 or newer not found. Install Node.js LTS, then reopen this file.
  pause
  exit /b 1
)
npm run dev
pause
