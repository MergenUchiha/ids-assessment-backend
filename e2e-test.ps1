Write-Host "🔐 Login..."

$login = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:3000/auth/login" `
  -ContentType "application/json" `
  -Body '{"email":"admin@test.com","password":"admin123"}'

$token = $login.access_token
Write-Host "Token received"

Write-Host "📦 Get experiments..."
$experiments = Invoke-RestMethod -Method GET `
  -Uri "http://localhost:3000/experiments" `
  -Headers @{ Authorization = "Bearer $token" }

$experimentId = $experiments[0].id
Write-Host "Experiment:" $experimentId

Write-Host "🎯 Get scenarios..."
$scenarios = Invoke-RestMethod -Method GET `
  -Uri "http://localhost:3000/scenarios" `
  -Headers @{ Authorization = "Bearer $token" }

$scenarioId = $scenarios[0].id
Write-Host "Scenario:" $scenarioId

Write-Host "▶ Create run..."
$run = Invoke-RestMethod -Method POST `
  -Uri "http://localhost:3000/runs/$experimentId/$scenarioId" `
  -Headers @{ Authorization = "Bearer $token" }

$runId = $run.id
Write-Host "Run created:" $runId

Write-Host "⏳ Waiting for run to finish..."

Start-Sleep -Seconds 15

Write-Host "📊 Fetch report..."
$report = Invoke-RestMethod -Method GET `
  -Uri "http://localhost:3000/runs/$runId/report" `
  -Headers @{ Authorization = "Bearer $token" }

$report | ConvertTo-Json -Depth 5