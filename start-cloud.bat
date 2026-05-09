@echo off
REM Auto-Bootstrap Script for Windows

echo.
echo 🚀 Sparx Science - Cloud AI Sync Auto-Bootstrap
echo ================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not found!
    echo Please install Node.js 14+ from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version
echo ✅ NPM version: 
npm --version
echo.

REM Check and install dependencies
echo 📦 Dependency Management
echo ========================
if not exist "node_modules" (
    echo 📥 Installing dependencies (first run)...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ❌ Failed to install dependencies
        pause
        exit /b 1
    )
    echo ✅ Dependencies installed successfully
) else (
    echo ✅ Dependencies already installed
)

echo.

REM Create data directory
echo 📁 Directory Setup
echo ==================
if not exist "data" (
    mkdir data
    echo ✅ Created data directory
) else (
    echo ✅ Data directory ready
)

echo.

REM Show startup information
echo 🌐 Server Information
echo ====================
echo   Port: 3000
echo   URL: http://localhost:3000
echo.

echo ✨ Features Enabled
echo ==================
echo   • AI learns collectively from all users
echo   • Data syncs every 30 seconds
echo   • Works offline with automatic sync
echo   • Machine learning with NLP
echo   • Global learning database
echo.

echo 💡 Usage Tips
echo ============
echo   • Press Ctrl+C to stop the server
echo   • Server auto-restarts on crashes
echo   • Data persists across restarts
echo   • Check console for sync status
echo.

REM Start the server
echo 🚀 Starting Sparx Science Server...
echo ====================================
echo.

npm start
pause
