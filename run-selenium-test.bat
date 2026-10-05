@echo off
setlocal
echo ================================================================================
echo    FARM2STREET - AUTOMATED SELENIUM LIVE BROWSER SUITE
echo ================================================================================
echo.
echo [1/2] Compiling project and test classes...
call mvn test-compile -DskipTests=true
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed.
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Launching Google Chrome & Executing Automated Live Test...
call mvn exec:java -Dexec.mainClass="com.farm2street.test.Farm2StreetLiveAutomationRunner" -Dexec.classpathScope=test

echo.
echo ================================================================================
echo    Test Execution Completed.
echo ================================================================================
pause
