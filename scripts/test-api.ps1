# Test Dashboard API Integration
# Script untuk verify semua endpoint backend berfungsi dengan baik

Write-Host "🧪 Testing Dashboard API Endpoints..." -ForegroundColor Cyan
Write-Host "Base URL: http://localhost:8001" -ForegroundColor Gray
Write-Host ""

$baseUrl = "http://localhost:8001"
$endpoints = @(
    "/dashboard/stats",
    "/dashboard/attendance-weekly",
    "/dashboard/task-distribution",
    "/dashboard/recent-activities",
    "/dashboard/productivity-trend"
)

$results = @()

foreach ($endpoint in $endpoints) {
    $url = "$baseUrl$endpoint"
    Write-Host "Testing: $endpoint" -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri $url -Method Get -TimeoutSec 5
        $statusIcon = "✅"
        $status = "SUCCESS"
        $color = "Green"
        
        # Show sample data
        $jsonPreview = ($response | ConvertTo-Json -Depth 2).Substring(0, [Math]::Min(100, ($response | ConvertTo-Json -Depth 2).Length))
        Write-Host "  Response: $jsonPreview..." -ForegroundColor DarkGray
        
        $results += [PSCustomObject]@{
            Endpoint = $endpoint
            Status = $status
            Icon = $statusIcon
        }
    }
    catch {
        $statusIcon = "❌"
        $status = "FAILED"
        $color = "Red"
        $errorMsg = $_.Exception.Message
        
        Write-Host "  Error: $errorMsg" -ForegroundColor Red
        
        $results += [PSCustomObject]@{
            Endpoint = $endpoint
            Status = $status
            Icon = $statusIcon
        }
    }
    
    Write-Host ""
}

Write-Host "📊 Test Summary" -ForegroundColor Cyan
Write-Host "─────────────────────────────────────────────────────" -ForegroundColor Gray

foreach ($result in $results) {
    $color = if ($result.Status -eq "SUCCESS") { "Green" } else { "Red" }
    Write-Host "$($result.Icon) $($result.Endpoint)" -ForegroundColor $color
}

$successCount = ($results | Where-Object { $_.Status -eq "SUCCESS" }).Count
$totalCount = $results.Count

Write-Host ""
Write-Host "Results: $successCount/$totalCount endpoints working" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })

if ($successCount -eq $totalCount) {
    Write-Host "🎉 All endpoints are operational!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Some endpoints failed. Check backend logs." -ForegroundColor Yellow
}
