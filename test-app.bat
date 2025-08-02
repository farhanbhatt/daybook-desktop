@echo off
echo =================================
echo  Daybook Desktop - Trial System Test
echo =================================
echo.
echo Choose an option:
echo 1. Run main app (Electron)
echo 2. Open trial test page (Browser)
echo 3. Clear trial data and restart
echo 4. Exit
echo.
set /p choice=Enter your choice (1-4): 

if "%choice%"=="1" (
    echo Starting Electron app...
    npm run electron
) else if "%choice%"=="2" (
    echo Opening trial test page...
    start test-trial.html
) else if "%choice%"=="3" (
    echo Clearing trial data...
    node -e "console.log('Clearing localStorage would happen in browser context');"
    echo Please use the 'Clear Trial Data' button in the test page or browser console
    echo Opening test page...
    start test-trial.html
) else if "%choice%"=="4" (
    echo Goodbye!
    exit /b 0
) else (
    echo Invalid choice. Please run the script again.
)

echo.
echo Press any key to continue...
pause >nul
