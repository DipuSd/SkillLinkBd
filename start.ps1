# Simple PowerShell script to start both servers
# Usage: .\start.ps1

Write-Host "🚀 Starting SkillLinkBD Development Servers...`n" -ForegroundColor Cyan

# Start frontend in a new window
Write-Host "Starting frontend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

# Wait a moment
Start-Sleep -Seconds 2

# Start backend in a new window
Write-Host "Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\server'; npm run dev"

Write-Host "`n✅ Both servers are starting in separate windows" -ForegroundColor Green
Write-Host "📝 Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "📝 Backend: http://localhost:4000" -ForegroundColor Yellow
Write-Host "`n💡 Close the PowerShell windows to stop the servers`n" -ForegroundColor Yellow

