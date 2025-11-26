# =============================================================================
# WorkFlow-ID Development Server Script
# =============================================================================
# Improved version with better error handling and modern frontend setup
# =============================================================================

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║        🚀 WorkFlow-ID Development Setup 🚀        ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# --- Environment Setup ---
$DevEnvFile = ".env.development"
$TargetEnvFile = ".env"

Write-Host "[1/6] 🔧 Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path $DevEnvFile) {
    Copy-Item -Path $DevEnvFile -Destination $TargetEnvFile -Force
    Write-Host "      ✅ Development environment loaded" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  .env.development not found, using defaults" -ForegroundColor Yellow
}

# --- Virtual Environment Setup ---
$VenvPath = ".venv"

Write-Host ""
Write-Host "[2/6] 🐍 Checking Python virtual environment..." -ForegroundColor Yellow

if (Test-Path $VenvPath) {
    Write-Host "      ✅ Virtual environment found" -ForegroundColor Green
} else {
    Write-Host "      📦 Creating virtual environment..."
    try {
        $pythonVersion = (python --version 2>&1).Split(" ")[1]
        $majorMinor = $pythonVersion.Substring(0, 4)

        if ($majorMinor -ne "3.11") {
            Write-Host ""
            Write-Host "      ⚠️  Python version mismatch!" -ForegroundColor Red
            Write-Host "         Current: $pythonVersion | Required: 3.11.x"
            $choice = Read-Host "      Continue anyway? (y/n)"
            if ($choice -ne 'y') {
                Write-Host "      ❌ Setup cancelled" -ForegroundColor Red
                exit
            }
            Write-Host "      ⚠️  Proceeding with Python $pythonVersion" -ForegroundColor Yellow
        } else {
            Write-Host "      ✅ Python $pythonVersion detected" -ForegroundColor Green
        }

        python -m venv $VenvPath
        Write-Host "      ✅ Virtual environment created" -ForegroundColor Green
    } catch {
        Write-Host "      ❌ Python not found!" -ForegroundColor Red
        Write-Host "         Install from: https://www.python.org/downloads/"
        exit
    }
}

# --- Activate Virtual Environment ---
Write-Host ""
Write-Host "[3/6] 🔌 Activating virtual environment..." -ForegroundColor Yellow
$activateScript = Join-Path $VenvPath "Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    . $activateScript
    Write-Host "      ✅ Virtual environment activated" -ForegroundColor Green
} else {
    Write-Host "      ❌ Activation script not found" -ForegroundColor Red
    exit
}

# --- Dependency Checks ---
Write-Host ""
Write-Host "[4/6] 📦 Checking dependencies..." -ForegroundColor Yellow

# Check backend dependencies
Write-Host "      🐍 Installing Python dependencies..."
pip install -r backend/requirements.txt --quiet 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "      ✅ Backend dependencies ready" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  Some backend dependencies may have issues" -ForegroundColor Yellow
}

# Check frontend dependencies  
Write-Host "      ⚛️  Checking frontend dependencies..."
$nodeModulesPath = "interface\node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "      📥 Installing frontend dependencies (Vite + React)..."
    Push-Location "interface"
    npm install --silent 2>&1 | Out-Null
    Pop-Location
    Write-Host "      ✅ Frontend dependencies installed" -ForegroundColor Green
} else {
    Write-Host "      ✅ Frontend dependencies found" -ForegroundColor Green
}

# --- Log Setup ---
Write-Host ""
Write-Host "[5/6] 📝 Setting up logs..." -ForegroundColor Yellow
$LogDir = "logs"
if (-not (Test-Path $LogDir)) {
    New-Item -Path $LogDir -ItemType Directory | Out-Null
}
Write-Host "      ✅ Log directory ready" -ForegroundColor Green

# --- Start Servers ---
Write-Host ""
Write-Host "[6/6] 🚀 Starting development servers..." -ForegroundColor Yellow
Write-Host ""

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$projectRoot = Split-Path -Parent $scriptRoot

# Start backend
Write-Host "      🔧 Starting FastAPI backend..."
$backendJob = Start-Job -ScriptBlock {
    param ($path)
    Set-Location "$path\backend"
    uvicorn main:app --reload --host 127.0.0.1 --port 8001
} -ArgumentList $projectRoot

Start-Sleep -Seconds 2

# Start frontend
Write-Host "      ⚛️  Starting Vite frontend..."
$frontendJob = Start-Job -ScriptBlock {
    param ($path)
    Set-Location "$path\interface"
    npm run dev
} -ArgumentList $projectRoot

Start-Sleep -Seconds 3

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ SERVERS ARE RUNNING ✅             ║" -ForegroundColor Green
Write-Host "╠═══════════════════════════════════════════════════╣" -ForegroundColor Green
Write-Host "║                                                   ║" -ForegroundColor Green
Write-Host "║  🔹 Backend (FastAPI):                            ║" -ForegroundColor Green
Write-Host "║     http://127.0.0.1:8001                         ║" -ForegroundColor Cyan
Write-Host "║     http://127.0.0.1:8001/docs (Swagger UI)       ║" -ForegroundColor Cyan
Write-Host "║                                                   ║" -ForegroundColor Green
Write-Host "║  🔹 Frontend (Vite + React):                      ║" -ForegroundColor Green
Write-Host "║     http://localhost:5173                         ║" -ForegroundColor Cyan
Write-Host "║                                                   ║" -ForegroundColor Green
Write-Host "╚═══════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Press Ctrl+C to stop all servers" -ForegroundColor Yellow
Write-Host ""

# Monitor jobs and show output
try {
    while ($true) {
        $backendState = (Get-Job -Id $backendJob.Id).State
        $frontendState = (Get-Job -Id $frontendJob.Id).State
        
        if ($backendState -eq "Failed" -or $frontendState -eq "Failed") {
            Write-Host ""
            Write-Host "❌ One or more servers failed!" -ForegroundColor Red
            Receive-Job -Job $backendJob
            Receive-Job -Job $frontendJob
            break
        }
        
        Start-Sleep -Seconds 2
    }
} catch {
    Write-Host ""
    Write-Host "🛑 Shutting down servers..." -ForegroundColor Yellow
} finally {
    # Clean up jobs
    Get-Job | Stop-Job
    Get-Job | Remove-Job
    Write-Host "✅ All servers stopped cleanly" -ForegroundColor Green
    Write-Host ""
}
