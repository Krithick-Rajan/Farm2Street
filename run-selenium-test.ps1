Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "   FARM2STREET - AUTOMATED SELENIUM LIVE BROWSER SUITE" -ForegroundColor Green
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "[1/2] Compiling test suite..." -ForegroundColor Yellow
mvn test-compile -DskipTests=true

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[2/2] Launching Google Chrome & Executing Automated Live Test..." -ForegroundColor Yellow
    mvn exec:java -Dexec.mainClass="com.farm2street.test.Farm2StreetLiveAutomationRunner" -Dexec.classpathScope=test
} else {
    Write-Host "[ERROR] Test compilation failed." -ForegroundColor Red
}
