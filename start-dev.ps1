# ==============================================================================
# YouFix Local Development Launcher Script
# ==============================================================================

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "  YouFix - Full-Stack Local Development Launcher       " -ForegroundColor Yellow
Write-Host "======================================================" -ForegroundColor Cyan

$CurrentDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $CurrentDir

# Locate Python
$PythonExe = "$CurrentDir\backend\.venv\Scripts\python.exe"
if (-not (Test-Path $PythonExe)) {
    $PythonCmd = Get-Command python -ErrorAction SilentlyContinue
    if ($PythonCmd) { $PythonExe = $PythonCmd.Source }
}

# Locate Node / npm
$NodeDir = "$CurrentDir\tools\node"
$NpmCmd = "$NodeDir\npm.cmd"
if (-not (Test-Path $NpmCmd)) {
    $SysNpm = Get-Command npm -ErrorAction SilentlyContinue
    if ($SysNpm) { $NpmCmd = $SysNpm.Source }
}

Write-Host "[✓] Python interpreter: $PythonExe" -ForegroundColor Green
Write-Host "[✓] Node npm launcher:  $NpmCmd" -ForegroundColor Green

Write-Host "`nStarting services..." -ForegroundColor Cyan

# Start Backend
if (Test-Path $PythonExe) {
    Write-Host "[*] Launching FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PYTHONPATH='$CurrentDir\backend'; cd '$CurrentDir\backend'; Write-Host 'YouFix FastAPI Backend Starting...'; & '$PythonExe' -m uvicorn app.main:app --reload --port 8000"
}

# Start Frontend
if (Test-Path $NpmCmd) {
    Write-Host "[*] Launching Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "`$env:PATH='$NodeDir;`$env:PATH'; cd '$CurrentDir\frontend'; Write-Host 'YouFix Next.js Frontend Starting...'; & '$NpmCmd' run dev"
}

Write-Host "`n======================================================" -ForegroundColor Cyan
Write-Host "  Development servers launching in separate windows!   " -ForegroundColor Green
Write-Host "  Frontend: http://localhost:3000                      " -ForegroundColor White
Write-Host "  Backend:  http://localhost:8000                      " -ForegroundColor White
Write-Host "  API Docs: http://localhost:8000/docs                 " -ForegroundColor White
Write-Host "======================================================" -ForegroundColor Cyan
