#Requires -Version 5.1
# StoreDesk task runner (Windows). Called by Makefile and make.cmd.
# Usage: make dev   OR   .\make.cmd dev   OR   .\scripts\make.ps1 dev
#
# Same-PC local stack:
#   Hub  :8080  (memory demo store SD-DEMO01)
#   Worker :4310 (+ outbound Hub agent)
#   Desktop → http://127.0.0.1:4310
#   Mobile LAN → http://127.0.0.1:4310 (emulator: 10.0.2.2:4310)
#   Mobile Hub → ws://127.0.0.1:8080/ws

param(
    [Parameter(Position = 0)]
    [string]$Target = "help"
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$worker = Join-Path $root "store-desk-worker"
$hub = Join-Path $root "store-desk-cloud-backend"
$electron = Join-Path $root "store-desk-electron"
$mobile = Join-Path $root "store-desk-mobile"

# Legacy alias used by older docs
$server = $worker

function Show-Help {
    Write-Host ""
    Write-Host "  StoreDesk - run from repo root"
    Write-Host "  =============================="
    Write-Host ""
    Write-Host "  make setup          Create .env files (Worker + Hub + Desktop)"
    Write-Host "  make hub            Cloud Hub only (:8080)"
    Write-Host "  make worker         Worker API only (:4310, joins local Hub)"
    Write-Host "  make server         Alias for make worker"
    Write-Host "  make electron       Desktop UI (expects Worker on :4310)"
    Write-Host "  make stack          Hub + Worker + Desktop (same-PC DEV only)"
    Write-Host "  make dev            Worker + Desktop (starts Hub if missing)"
    Write-Host "  make stop           Stop Hub / Worker / Vite / Electron"
    Write-Host "  make status         Health check (Mongo, Hub, Worker, Desktop)"
    Write-Host "  make mongo          Verify MongoDB"
    Write-Host "  make apk            Build StoreDesk Mobile APK"
    Write-Host "  make install        npm install (worker + hub + electron)"
    Write-Host "  make ci             Run CI checks"
    Write-Host ""
    Write-Host "  Deploy is unchanged (not via make):"
    Write-Host "    Hub: docker build / Cloud Run in store-desk-cloud-backend"
    Write-Host "    Worker: install on store PC with real HUB_WS_URL + keys"
    Write-Host ""
    Write-Host "  Same-PC Mobile (dev):"
    Write-Host "    LAN pair host 127.0.0.1:4310  (Android emulator: 10.0.2.2:4310)"
    Write-Host "    Hub ws://127.0.0.1:8080/ws  storeId=SD-DEMO01  key=sk_dev_demo_key"
    Write-Host "  Docs: docs/local-same-pc.md"
    Write-Host ""
}

function Test-Port([int]$port) {
    try {
        $tcp = New-Object System.Net.Sockets.TcpClient
        $tcp.Connect("127.0.0.1", $port)
        $tcp.Close()
        return $true
    } catch {
        return $false
    }
}

function Ensure-Mongo {
    if (Test-Port 27017) {
        Write-Host "MongoDB is listening on port 27017."
        return
    }
    Write-Host "MongoDB is not running on 127.0.0.1:27017."
    Write-Host "Start the MongoDB Windows service, then run make again."
    Write-Host "Install: https://www.mongodb.com/try/download/community"
    exit 1
}

function Ensure-Env {
    if (Test-Path (Join-Path $worker ".env")) { return }
    Write-Host "No Worker .env found - running make setup first."
    Invoke-Setup
}

function Invoke-Setup {
    Write-Host "StoreDesk - setup .env (same-PC Hub + Worker + Desktop)"
    foreach ($dir in @(
        (Join-Path $worker "uploads"),
        (Join-Path $electron "uploads")
    )) {
        if (Test-Path $dir) {
            Get-ChildItem $dir -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "Cleared $dir"
        }
    }

    $workerEnv = @(
        "PORT=4310",
        "NODE_ENV=development",
        "MONGO_URI=mongodb://127.0.0.1:27017/storedesk",
        "STOREDESK_SKIP_CATALOG_SEED=true",
        "UPLOAD_DIR=uploads",
        "CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173",
        "APP_SECRET=storedesk-local-dev-secret",
        "JWT_EXPIRES_IN=7d",
        "APP_URL=http://127.0.0.1:5173",
        "AUTH_DISABLED=true",
        "SKIP_EMAIL_VERIFICATION=true",
        "HUB_WS_URL=ws://127.0.0.1:8080/ws",
        "STORE_ID=SD-DEMO01",
        "AGENT_KEY=sk_dev_demo_key"
    ) -join "`n"
    Set-Content -Path (Join-Path $worker ".env") -Value $workerEnv -Encoding UTF8

    $hubEnv = @("PORT=8080", "HEARTBEAT_MS=30000") -join "`n"
    Set-Content -Path (Join-Path $hub ".env") -Value $hubEnv -Encoding UTF8

    $electronEnv = @(
        "PORT=4310",
        "NODE_ENV=development",
        "MONGO_URI=mongodb://127.0.0.1:27017/storedesk",
        "AUTH_DISABLED=true",
        "SKIP_EMAIL_VERIFICATION=true",
        "VITE_API_URL=http://127.0.0.1:4310/api",
        "HUB_WS_URL=ws://127.0.0.1:8080/ws",
        "STORE_ID=SD-DEMO01",
        "AGENT_KEY=sk_dev_demo_key"
    ) -join "`n"
    Set-Content -Path (Join-Path $electron ".env") -Value $electronEnv -Encoding UTF8

    foreach ($downloads in @(
        (Join-Path $worker "downloads"),
        (Join-Path $electron "downloads")
    )) {
        New-Item -ItemType Directory -Force -Path $downloads | Out-Null
    }

    Write-Host "Wrote Worker/Hub/Desktop .env for same-PC testing."
    Write-Host "Demo Hub credentials: storeId=SD-DEMO01 agentKey=sk_dev_demo_key"
    Write-Host "Next: make stack   (or make hub && make worker && make electron)"
}

function Invoke-MongoReset {
    Ensure-Mongo
    Write-Host "Dropping local MongoDB database 'storedesk'..."
    mongosh --quiet --eval "db.getSiblingDB('storedesk').dropDatabase()" 2>$null
    if ($LASTEXITCODE -ne 0) {
        mongo storedesk --eval "db.dropDatabase()" 2>$null
    }
    Write-Host "Done."
}

function Get-LanServerInfo {
    try {
        return Invoke-RestMethod -Uri "http://127.0.0.1:4310/api/server-info" -TimeoutSec 3
    } catch {
        return $null
    }
}

function Get-PhoneUrls {
    $info = Get-LanServerInfo
    $lan = if ($info -and $info.localIp) { $info.localIp } else { "127.0.0.1" }
    $port = if ($info -and $info.port) { $info.port } else { 4310 }
    return @{
        LanApi = "http://${lan}:${port}"
        LocalApi = "http://127.0.0.1:${port}"
        EmulatorApi = "http://10.0.2.2:${port}"
        Apk = "http://${lan}:${port}/downloads/storedesk-buddy.apk"
        HubWs = "ws://127.0.0.1:8080/ws"
        StoreId = "SD-DEMO01"
        AgentKey = "sk_dev_demo_key"
    }
}

function Show-PhoneUrls {
    $urls = Get-PhoneUrls
    Write-Host ""
    Write-Host "Same-PC / phone URLs"
    Write-Host "--------------------"
    Write-Host "  Desktop Worker:     $($urls.LocalApi)"
    Write-Host "  Phone (Wi-Fi LAN):  $($urls.LanApi)"
    Write-Host "  Android emulator:   $($urls.EmulatorApi)"
    Write-Host "  Hub WebSocket:      $($urls.HubWs)"
    Write-Host "  Hub storeId:        $($urls.StoreId)"
    Write-Host "  Hub agentKey:       $($urls.AgentKey)"
    Write-Host "  APK:                $($urls.Apk)"
    Write-Host ""
}

function Start-BackgroundNpm([string]$dir, [string]$name) {
    $logDir = Join-Path $root ".logs"
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    $outLog = Join-Path $logDir "$name.out.log"
    $errLog = Join-Path $logDir "$name.err.log"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev" -WorkingDirectory $dir `
        -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog
}

function Invoke-Hub {
    if (-not (Test-Path (Join-Path $hub "package.json"))) {
        Write-Error "Hub missing. Run: git submodule update --init store-desk-cloud-backend"
    }
    if (-not (Test-Path (Join-Path $hub ".env"))) {
        Invoke-Setup
    }
    if (Test-Port 8080) {
        Write-Host "Cloud Hub already running on port 8080."
        return
    }
    Write-Host "Starting Cloud Hub (port 8080)..."
    Start-BackgroundNpm $hub "hub"
    Start-Sleep -Seconds 3
    if (Test-Port 8080) {
        Write-Host "Cloud Hub is up (ws://127.0.0.1:8080/ws)."
    } else {
        Write-Host "Hub may still be starting. Check .logs\hub.err.log if it fails."
    }
}

function Invoke-Worker {
    Ensure-Env
    Ensure-Mongo
    if (-not (Test-Port 8080)) {
        Write-Host "Hub not on 8080 — starting local Hub so Worker agent can join..."
        Invoke-Hub
        Start-Sleep -Seconds 2
    }
    if (Test-Port 4310) {
        Write-Host "StoreDesk Worker already running on port 4310."
        Show-PhoneUrls
        return
    }
    Write-Host "Starting StoreDesk Worker (port 4310, Hub agent enabled)..."
    Start-BackgroundNpm $worker "worker"
    Start-Sleep -Seconds 4
    if (Test-Port 4310) {
        Write-Host "StoreDesk Worker is up."
    } else {
        Write-Host "Worker may still be starting. Check .logs\worker.err.log if it fails."
    }
    Show-PhoneUrls
}

function Invoke-Electron {
    Write-Host "Starting StoreDesk desktop (Worker http://127.0.0.1:4310)..."
    if (-not (Test-Port 4310)) {
        Write-Host "Worker not on 4310 yet — starting Hub + Worker first..."
        Invoke-Worker
        Start-Sleep -Seconds 2
    }
    Set-Location $electron
    npm run dev:external
}

function Invoke-Dev {
    Invoke-Worker
    Start-Sleep -Seconds 2
    Invoke-Electron
}

function Invoke-Stack {
    Invoke-Hub
    Start-Sleep -Seconds 1
    Invoke-Worker
    Start-Sleep -Seconds 2
    Invoke-Electron
}

function Invoke-Stop {
    function Stop-Port([int]$port, [string]$label) {
        $pids = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
            Select-Object -ExpandProperty OwningProcess -Unique)
        if (-not $pids.Count) {
            Write-Host "Nothing on port $port ($label)."
            return
        }
        foreach ($procId in $pids) {
            Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            Write-Host "Stopped $label (PID $procId, port $port)."
        }
    }
    Write-Host "Stopping StoreDesk local stack..."
    Stop-Port 8080 "Cloud Hub"
    Stop-Port 4310 "StoreDesk Worker"
    Stop-Port 5173 "Vite dev server"
    $electronProcs = @(Get-Process -Name electron -ErrorAction SilentlyContinue)
    if ($electronProcs.Count) {
        $count = $electronProcs.Count
        $electronProcs | Stop-Process -Force -ErrorAction SilentlyContinue
        Write-Host ("Stopped Electron ({0} processes)." -f $count)
    } else {
        Write-Host "Nothing for Electron."
    }
}

function Invoke-Status {
    Write-Host "StoreDesk status (same-PC)"
    Write-Host "========================="
    if (Test-Port 27017) {
        Write-Host "[ok]  MongoDB           port 27017"
    } else {
        Write-Host "[ERR] MongoDB           not running - run: make mongo"
    }
    try {
        $hubHealth = Invoke-RestMethod -Uri "http://127.0.0.1:8080/health" -TimeoutSec 3
        Write-Host "[ok]  Cloud Hub         port 8080  (atlas=$($hubHealth.atlas))"
    } catch {
        Write-Host "[--]  Cloud Hub         not running - run: make hub"
    }
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:4310/api/health" -TimeoutSec 3
        $hubState = if ($health.hub) { "hub.connected=$($health.hub.connected)" } else { "hub=n/a" }
        Write-Host "[ok]  StoreDesk Worker  port 4310  (db=$($health.databaseMode); $hubState)"
        Show-PhoneUrls
    } catch {
        Write-Host "[ERR] StoreDesk Worker  not running - run: make worker"
    }
    if (Test-Port 5173) {
        Write-Host "[ok]  Desktop UI        port 5173"
    } else {
        Write-Host "[--]  Desktop UI        not running"
    }
    $electronCount = @(Get-Process -Name electron -ErrorAction SilentlyContinue).Count
    if ($electronCount -gt 0) {
        Write-Host ("[ok]  Electron          {0} processes" -f $electronCount)
    }
}

function Invoke-BuildApk {
    $buildRoot = $root
    if ($root.Path -match "\s") {
        $junctionRoot = if ($env:STOREDESK_FLUTTER_WORKSPACE) { $env:STOREDESK_FLUTTER_WORKSPACE } else { "C:\StoreDeskBuild" }
        if (-not (Test-Path $junctionRoot)) {
            New-Item -ItemType Junction -Path $junctionRoot -Target $root.Path | Out-Null
        }
        $buildRoot = Resolve-Path $junctionRoot
    }
    $mobileDir = Join-Path $buildRoot "store-desk-mobile"
    $flutterBat = Join-Path $buildRoot "tools\flutter\bin\flutter.bat"
    $flutter = if (Get-Command flutter -ErrorAction SilentlyContinue) { "flutter" }
        elseif (Test-Path $flutterBat) { $flutterBat }
        else { "" }
    if (-not $flutter) {
        Write-Error "Flutter not found. Install Flutter or place SDK at tools\flutter."
    }
    Set-Location $mobileDir
    Write-Host "Building StoreDesk Mobile APK..."
    & $flutter pub get
    & $flutter build apk --release
    $apkSource = Join-Path $mobileDir "build\app\outputs\flutter-apk\app-release.apk"
    if (-not (Test-Path $apkSource)) { Write-Error "APK build failed." }
    foreach ($target in @(
        (Join-Path $root "store-desk-worker\downloads\storedesk-buddy.apk"),
        (Join-Path $root "store-desk-electron\downloads\storedesk-buddy.apk")
    )) {
        New-Item -ItemType Directory -Force -Path (Split-Path $target -Parent) | Out-Null
        Copy-Item -Path $apkSource -Destination $target -Force
        $sizeMb = [math]::Round((Get-Item $target).Length / 1MB, 1)
        Write-Host ("Copied APK ({0} MB) to {1}" -f $sizeMb, $target)
    }
}

function Invoke-Npm([string]$dir, [string]$command) {
    Push-Location $dir
    try { Invoke-Expression $command } finally { Pop-Location }
}

switch ($Target) {
    "help" { Show-Help }
    { $_ -in "setup", "reset-local", "env" } { Invoke-Setup }
    "mongo" { Ensure-Mongo }
    "mongo-reset" { Invoke-MongoReset }
    "hub" { Invoke-Hub }
    { $_ -in "worker", "server" } { Invoke-Worker }
    "electron" { Invoke-Electron }
    "stack" { Invoke-Stack }
    "dev" { Invoke-Dev }
    "stop" { Invoke-Stop }
    "status" { Invoke-Status }
    "apk" { Invoke-BuildApk }
    "install" {
        Invoke-Npm $worker "npm install"
        Invoke-Npm $hub "npm install"
        Invoke-Npm $electron "npm install"
    }
    "install-server" { Invoke-Npm $worker "npm install" }
    "install-electron" { Invoke-Npm $electron "npm install" }
    "install-mobile" {
        if (Get-Command flutter -ErrorAction SilentlyContinue) {
            Invoke-Npm $mobile "flutter pub get"
        } else {
            Write-Host "Flutter not in PATH."
        }
    }
    "ci-server" { Invoke-Npm $worker "npm run ci" }
    "ci-electron" { Invoke-Npm $electron "npm run ci" }
    "ci" {
        Invoke-Npm $worker "npm run ci"
        Invoke-Npm $hub "npm run ci"
        Invoke-Npm $electron "npm run ci"
    }
    "ci-mobile" { Invoke-Npm $mobile "flutter analyze; flutter test" }
    default {
        Write-Host "Unknown target: $Target"
        Show-Help
        exit 1
    }
}
