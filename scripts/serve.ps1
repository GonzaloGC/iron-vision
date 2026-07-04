param(
    [int]$BackendPort = 8000,
    [int]$FrontendPort = 3000
)

$ErrorActionPreference = "Stop"

# Detect local IP
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.InterfaceAlias -notmatch "Loopback|Virtual|Bluetooth|Docker" -and $_.PrefixOrigin -eq "Dhcp"
} | Select-Object -First 1).IPAddress

if (-not $ip) {
    $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
        $_.InterfaceAlias -notmatch "Loopback|Virtual|Bluetooth|Docker"
    } | Select-Object -First 1).IPAddress
}

$root = Split-Path $PSScriptRoot -Parent

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  IronVision - Servidor de red local" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "IP local: $ip" -ForegroundColor Yellow
Write-Host ""

# Start backend
$env:NEXT_PUBLIC_API_URL = "http://${ip}:${BackendPort}"

Write-Host "[1/2] Iniciando backend en http://${ip}:${BackendPort} ..." -ForegroundColor Green
$backendJob = Start-Job -ScriptBlock {
    param($root, $port)
    Set-Location (Join-Path $root "backend")
    uvicorn app.main:app --host 0.0.0.0 --port $port --reload
} -ArgumentList $root, $BackendPort

Start-Sleep -Seconds 3

Write-Host "[2/2] Iniciando frontend en http://${ip}:${FrontendPort} ..." -ForegroundColor Green
$frontendJob = Start-Job -ScriptBlock {
    param($root, $port)
    Set-Location (Join-Path $root "web")
    $env:NEXT_PUBLIC_API_URL = "http://${ip}:${port}"
    npx next dev -H 0.0.0.0 -p $port
} -ArgumentList $root, $FrontendPort

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Servidores listos!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Frontend: http://${ip}:${FrontendPort}" -ForegroundColor Green
Write-Host "  Backend:  http://${ip}:${BackendPort}" -ForegroundColor Green
Write-Host ""
Write-Host "  Abrí http://${ip}:${FrontendPort} desde tu celu" -ForegroundColor White
Write-Host ""
Write-Host "  Presioná Ctrl+C para detener ambos servidores" -ForegroundColor Magenta
Write-Host ""

try {
    while ($true) {
        Start-Sleep -Seconds 1
        if (-not (Get-Job -Id $backendJob.Id -ErrorAction SilentlyContinue).Running -or
            -not (Get-Job -Id $frontendJob.Id -ErrorAction SilentlyContinue).Running) {
            Write-Host "Un servidor se detuvo. Finalizando..." -ForegroundColor Red
            break
        }
    }
} finally {
    Write-Host "Deteniendo servidores..." -ForegroundColor Yellow
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    Write-Host "Detenido." -ForegroundColor Yellow
}
