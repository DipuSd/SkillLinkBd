# PowerShell script to start both frontend and backend servers
# Usage: .\start-dev.ps1

Write-Host "🚀 Starting SkillLinkBD Development Servers...`n" -ForegroundColor Cyan

# Function to write colored output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White",
        [string]$Prefix = ""
    )
    Write-Host "$Prefix" -NoNewline -ForegroundColor $Color
    Write-Host $Message
}

# Start frontend server
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev 2>&1 | ForEach-Object {
        Write-Output "[FRONTEND] $_"
    }
}

# Start backend server
$serverJob = Start-Job -ScriptBlock {
    Set-Location (Join-Path $using:PWD "server")
    npm run dev 2>&1 | ForEach-Object {
        Write-Output "[SERVER] $_"
    }
}

Write-ColorOutput "✅ Frontend server starting on http://localhost:5173" "Green"
Write-ColorOutput "✅ Backend server starting on http://localhost:4000" "Green"
Write-ColorOutput "`n📝 Press Ctrl+C to stop both servers`n" "Yellow"

# Monitor and display output
try {
    while ($true) {
        # Receive output from frontend
        $frontendOutput = Receive-Job -Job $frontendJob -ErrorAction SilentlyContinue
        if ($frontendOutput) {
            $frontendOutput | ForEach-Object {
                Write-ColorOutput $_ "Cyan" "[FRONTEND] "
            }
        }

        # Receive output from server
        $serverOutput = Receive-Job -Job $serverJob -ErrorAction SilentlyContinue
        if ($serverOutput) {
            $serverOutput | ForEach-Object {
                Write-ColorOutput $_ "Yellow" "[SERVER] "
            }
        }

        # Check if jobs are still running
        if ($frontendJob.State -eq "Failed" -or $serverJob.State -eq "Failed") {
            Write-ColorOutput "❌ One or more servers failed to start" "Red"
            break
        }

        Start-Sleep -Milliseconds 100
    }
}
finally {
    Write-Host "`n🛑 Shutting down servers...`n" -ForegroundColor Yellow
    Stop-Job -Job $frontendJob, $serverJob -ErrorAction SilentlyContinue
    Remove-Job -Job $frontendJob, $serverJob -ErrorAction SilentlyContinue
}

