# --- Environment Setup ---
$DevEnvFile = ".env.development"
$TargetEnvFile = ".env"
if (Test-Path $DevEnvFile) {
    Copy-Item -Path $DevEnvFile -Destination $TargetEnvFile -Force
    Write-Host "✅ Development environment (.env.development) loaded."
} else {
    Write-Host "⚠️ .env.development not found. Using default settings." -ForegroundColor Yellow
}
Write-Host ""

# --- Virtual Environment Setup ---
$VenvPath = ".venv"

if (Test-Path $VenvPath) {
    Write-Host "✅ Virtual environment found!"
} else {
    Write-Host "Virtual environment not found. Checking Python version..."
    try {
        $pythonVersion = (python --version 2>&1).Split(" ")[1]
        $majorMinor = $pythonVersion.Substring(0, 4)

        if ($majorMinor -ne "3.11") {
            Write-Host ""
            Write-Host "❌ Python version mismatch!" -ForegroundColor Red
            Write-Host "Current version: $pythonVersion"
            Write-Host "Required version: 3.11.x"
            Write-Host ""
            $choice = Read-Host "Continue with Python $pythonVersion? (y/n)"
            if ($choice -ne 'y') {
                Write-Host "Setup cancelled."
                exit
            }
            Write-Host "⚠️  Proceeding with Python $pythonVersion (not recommended)" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Python $pythonVersion is correct!"
        }

        Write-Host "Creating Python virtual environment..."
        python -m venv $VenvPath
    } catch {
        Write-Host "❌ Python is not installed or not in PATH." -ForegroundColor Red
        Write-Host "Please install Python 3.11 from: https://www.python.org/downloads/"
        exit
    }
}

# --- Activate Virtual Environment ---
$activateScript = Join-Path $VenvPath "Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    . $activateScript
    Write-Host "✅ Virtual environment activated."
} else {
    Write-Host "❌ Activation script not found at $activateScript" -ForegroundColor Red
    exit
}

# --- Dependency Checks ---
# Check pip dependencies
Write-Host "Checking pip dependencies..."
pip install -r backend/requirements.txt --quiet
Write-Host "✅ Python dependencies are up to date."

# Check yarn dependencies
Write-Host "Checking yarn dependencies..."
$nodeModulesPath = "interface\node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "Installing frontend dependencies (this may take a moment)..."
    Push-Location "interface"
    yarn install --silent
    Pop-Location
    Write-Host "✅ Frontend dependencies installed"
} else {
    Write-Host "✅ Frontend dependencies found"
}

Write-Host "✅ All dependencies ready"
Write-Host ""

# --- Log Setup ---
$LogDir = "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -Path $LogDir -ItemType Directory | Out-Null
}

# --- Start Servers ---
Write-Host "🚀 Starting servers..."
$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Split-Path -Parent $scriptRoot

# Start backend
$backendJob = Start-Job -ScriptBlock {
    param ($path)
    Push-Location "$path\backend"
    uvicorn main:app --reload --host 127.0.0.1 --port 8000
    Pop-Location
} -ArgumentList $projectRoot

# Start frontend
$frontendJob = Start-Job -ScriptBlock {
    param ($path)
    Push-Location "$path\interface"
    yarn dev
    Pop-Location
} -ArgumentList $projectRoot

Write-Host "✅ Backend running on http://127.0.0.1:8000"
Write-Host "✅ Frontend running on http://localhost:3000"
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers"

# Wait for jobs and show output
try {
    Receive-Job -Job $backendJob -Wait
    Receive-Job -Job $frontendJob -Wait
} catch {
    Write-Host "🛑 Stopping servers..."
} finally {
    # Clean up
    Get-Job | Stop-Job | Remove-Job
    Write-Host "✅ Servers stopped."
}
