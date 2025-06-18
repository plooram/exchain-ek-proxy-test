# ExChain Prebid.js Debug Environment - PowerShell Helper Scripts
# Windows PowerShell compatibility functions and utilities

# Function to start the debug server
function Start-ExchainDebugServer {
    param(
        [string]$Mode = "dev"
    )
    
    Write-Host "🚀 Starting ExChain Debug Server in $Mode mode..." -ForegroundColor Green
    
    switch ($Mode.ToLower()) {
        "dev" { npm run dev }
        "production" { npm run start }
        "debug" { npm run debug }
        default { npm run dev }
    }
}

# Function to check server status
function Get-ExchainServerStatus {
    Write-Host "📊 Checking ExChain Debug Server status..." -ForegroundColor Blue
    
    $process = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*ExChain*" -or $_.ProcessName -eq "node" }
    
    if ($process) {
        Write-Host "✅ Server process found:" -ForegroundColor Green
        $process | Format-Table Id, ProcessName, CPU, WorkingSet
    } else {
        Write-Host "❌ No ExChain Debug Server process found" -ForegroundColor Red
    }
    
    # Check if port 3000 is in use
    $portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($portCheck) {
        Write-Host "✅ Port 3000 is in use" -ForegroundColor Green
    } else {
        Write-Host "❌ Port 3000 is not in use" -ForegroundColor Red
    }
}

# Function to stop the debug server
function Stop-ExchainDebugServer {
    Write-Host "🛑 Stopping ExChain Debug Server..." -ForegroundColor Yellow
    
    $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($processes) {
        $processes | Stop-Process -Force
        Write-Host "✅ Server processes stopped" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ No running server processes found" -ForegroundColor Blue
    }
}

# Function to open the test page
function Open-ExchainTestPage {
    param(
        [string]$Port = "3000"
    )
    
    $url = "http://localhost:$Port/test.html"
    Write-Host "🌐 Opening ExChain Debug Test Page: $url" -ForegroundColor Blue
    Start-Process $url
}

# Function to view logs
function Get-ExchainLogs {
    Write-Host "📋 ExChain Debug Server Logs:" -ForegroundColor Blue
    Write-Host "Use Ctrl+C to exit log view" -ForegroundColor Yellow
    
    # This would show logs if we were logging to a file
    # For now, just show instructions
    Write-Host "Logs will appear in the console where you started the server" -ForegroundColor Green
    Write-Host "Use 'npm run dev' to see real-time logs with colored output" -ForegroundColor Green
}

# Function to clean up temporary files
function Clear-ExchainTempFiles {
    Write-Host "🧹 Cleaning up temporary debug files..." -ForegroundColor Yellow
    
    $publicDir = "public"
    $tempFiles = @("prebid-original.js", "prebid-debug.js")
    
    foreach ($file in $tempFiles) {
        $filePath = Join-Path $publicDir $file
        if (Test-Path $filePath) {
            # Check if it's just a placeholder
            $content = Get-Content $filePath -Raw
            if ($content -like "*placeholder*" -or $content.Length -lt 1000) {
                Write-Host "ℹ️ Keeping placeholder file: $file" -ForegroundColor Blue
            } else {
                Remove-Item $filePath -Force
                Write-Host "✅ Removed temporary file: $file" -ForegroundColor Green
            }
        }
    }
}

# Export functions for easy access
Export-ModuleMember -Function Start-ExchainDebugServer, Get-ExchainServerStatus, Stop-ExchainDebugServer, Open-ExchainTestPage, Get-ExchainLogs, Clear-ExchainTempFiles

# Display help information
Write-Host "🔍 ExChain Debug Environment - PowerShell Helpers Loaded" -ForegroundColor Cyan
Write-Host "Available functions:" -ForegroundColor White
Write-Host "  Start-ExchainDebugServer [-Mode dev|production|debug]" -ForegroundColor Gray
Write-Host "  Get-ExchainServerStatus" -ForegroundColor Gray
Write-Host "  Stop-ExchainDebugServer" -ForegroundColor Gray
Write-Host "  Open-ExchainTestPage [-Port 3000]" -ForegroundColor Gray
Write-Host "  Get-ExchainLogs" -ForegroundColor Gray
Write-Host "  Clear-ExchainTempFiles" -ForegroundColor Gray 