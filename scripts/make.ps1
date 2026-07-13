#Requires -Version 5.1
# StoreDesk task runner (Windows). Called by Makefile and make.cmd.
# Usage: make dev   OR   .\make.cmd dev   OR   .\scripts\make.ps1 dev

param(
    [Parameter(Position = 0)]
    [string]$Target = "help"
)

$ErrorActionPreference = "Stop"
$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$server = Join-Path $root "store-desk-server"
$electron = Join-Path $root "store-desk-electron"
$mobile = Join-Path $root "store-desk-mobile"

function Show-Help {
    Write-Host ""
    Write-Host "  StoreDesk - run from repo root"
    Write-Host "  =============================="
    Write-Host ""
    Write-Host "  make dev            MongoDB check + server + desktop"
    Write-Host "  make server         API only (new window)"
    Write-Host "  make electron       Desktop UI only"
    Write-Host "  make stop           Stop server / Vite"
    Write-Host "  make status         Health check"
    Write-Host "  make setup          Create .env files"
    Write-Host "  make mongo          Verify MongoDB"
    Write-Host "  make mongo-reset    Wipe MongoDB data"
    Write-Host "  make apk            Build Buddy APK"
    Write-Host "  make install        npm install"
    Write-Host "  make ci             Run CI checks"
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
    Write-Host "Start the MongoDB Windows service, then run make dev again."
    Write-Host "Install: https://www.mongodb.com/try/download/community"
    exit 1
}

function Ensure-Env {
    if (Test-Path (Join-Path $server ".env")) { return }
    Write-Host "No .env found - running make setup first."
    Invoke-Setup
}

function Invoke-Setup {
    Write-Host "StoreDesk - setup .env and folders (MongoDB data is kept)"
    foreach ($dir in @(
        (Join-Path $server "uploads"),
        (Join-Path $electron "uploads")
    )) {
        if (Test-Path $dir) {
            Get-ChildItem $dir -Force | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "Cleared $dir"
        }
    }
    $envLines = @(
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
        "SKIP_EMAIL_VERIFICATION=true"
    )
    $envContent = $envLines -join "`n"
    Set-Content -Path (Join-Path $server ".env") -Value $envContent -Encoding UTF8
    $electronEnv = ($envLines + @("VITE_API_URL=http://localhost:4310/api")) -join "`n"
    Set-Content -Path (Join-Path $electron ".env") -Value $electronEnv -Encoding UTF8
    foreach ($downloads in @(
        (Join-Path $server "downloads"),
        (Join-Path $electron "downloads")
    )) {
        New-Item -ItemType Directory -Force -Path $downloads | Out-Null
    }
    Write-Host "Done. Run: make dev"
}

function Invoke-MongoReset {
    $mongoUri = if ($env:MONGO_URI) { $env:MONGO_URI } else { "mongodb://127.0.0.1:27017/storedesk" }
    Write-Host "Dropping StoreDesk MongoDB database at $mongoUri"
    $mongosh = Get-Command mongosh -ErrorAction SilentlyContinue
    if ($mongosh) {
        & mongosh $mongoUri --eval "db.dropDatabase()" | Write-Host
        Write-Host "MongoDB database dropped."
        return
    }
    $mongo = Get-Command mongo -ErrorAction SilentlyContinue
    if ($mongo) {
        & mongo $mongoUri --eval "db.dropDatabase()" | Write-Host
        Write-Host "MongoDB database dropped."
        return
    }
    Write-Host "mongosh not found. Run manually:"
    Write-Host '  mongosh mongodb://127.0.0.1:27017/storedesk --eval "db.dropDatabase()"'
    exit 1
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
    if ($info) {
        $lan = @($info.localAddresses | Where-Object { $_ -match '^192\.168\.' } | Select-Object -First 1)
        if (-not $lan) { $lan = $info.localIp }
        $base = "http://${lan}:$($info.port)"
        return @{
            Api = $base
            Apk = "$base/downloads/storedesk-buddy.apk"
        }
    }
    return @{
        Api = "http://127.0.0.1:4310"
        Apk = "http://127.0.0.1:4310/downloads/storedesk-buddy.apk"
    }
}

function Show-PhoneUrls {
    $urls = Get-PhoneUrls
    Write-Host ""
    Write-Host "  Phone server:  $($urls.Api)"
    Write-Host "  Buddy APK:     $($urls.Apk)"
    Write-Host ""
}

function Invoke-Server {
    Ensure-Env
    Ensure-Mongo
    if (Test-Port 4310) {
        Write-Host "StoreDesk Server already running on port 4310."
        Show-PhoneUrls
        return
    }
    Write-Host "Starting StoreDesk Server (port 4310) in background..."
    $logDir = Join-Path $root ".logs"
    New-Item -ItemType Directory -Force -Path $logDir | Out-Null
    $outLog = Join-Path $logDir "server.out.log"
    $errLog = Join-Path $logDir "server.err.log"
    Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "npm run dev" -WorkingDirectory $server `
        -WindowStyle Hidden -RedirectStandardOutput $outLog -RedirectStandardError $errLog
    Start-Sleep -Seconds 4
    if (Test-Port 4310) {
        Write-Host "StoreDesk Server is up."
    } else {
        Write-Host "Server may still be starting. Check .logs\server.err.log if it fails."
    }
    Show-PhoneUrls
}

function Invoke-Electron {
    Write-Host "Starting StoreDesk desktop (API at http://127.0.0.1:4310)..."
    if (-not (Test-Port 4310)) {
        Write-Host "Server not on 4310 yet - starting it first..."
        Invoke-Server
        Start-Sleep -Seconds 2
    }
    Set-Location $electron
    npm run dev:external
}

function Invoke-Dev {
    Invoke-Server
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
    Write-Host "Stopping StoreDesk..."
    Stop-Port 4310 "StoreDesk Server"
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
    Write-Host "StoreDesk status"
    Write-Host "================"
    if (Test-Port 27017) {
        Write-Host "[ok]  MongoDB          port 27017"
    } else {
        Write-Host "[ERR]  MongoDB          not running - run: make mongo"
    }
    try {
        $health = Invoke-RestMethod -Uri "http://127.0.0.1:4310/api/health" -TimeoutSec 3
        Write-Host "[ok]  StoreDesk Server port 4310  (database: $($health.databaseMode))"
        $urls = Get-PhoneUrls
        Write-Host "      Phone server: $($urls.Api)"
        Write-Host "      Buddy APK:    $($urls.Apk)"
    } catch {
        Write-Host "[ERR]  StoreDesk Server not running - run: make dev"
    }
    if (Test-Port 5173) {
        Write-Host "[ok]  Desktop UI       port 5173"
    } else {
        Write-Host "[--]  Desktop UI       not running"
    }
    $electronCount = @(Get-Process -Name electron -ErrorAction SilentlyContinue).Count
    if ($electronCount -gt 0) {
        Write-Host ("[ok]  Electron         {0} processes" -f $electronCount)
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
    Write-Host "Building StoreDesk Buddy APK..."
    & $flutter pub get
    & $flutter build apk --release
    $apkSource = Join-Path $mobileDir "build\app\outputs\flutter-apk\app-release.apk"
    if (-not (Test-Path $apkSource)) { Write-Error "APK build failed." }
    foreach ($target in @(
        (Join-Path $root "store-desk-server\downloads\storedesk-buddy.apk"),
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
    "dev" { Invoke-Dev }
    "server" { Invoke-Server }
    "electron" { Invoke-Electron }
    "stop" { Invoke-Stop }
    "status" { Invoke-Status }
    "apk" { Invoke-BuildApk }
    "install" {
        Invoke-Npm $server "npm install"
        Invoke-Npm $electron "npm install"
    }
    "install-server" { Invoke-Npm $server "npm install" }
    "install-electron" { Invoke-Npm $electron "npm install" }
    "install-mobile" {
        if (Get-Command flutter -ErrorAction SilentlyContinue) {
            Invoke-Npm $mobile "flutter pub get"
        } else {
            Write-Host "Flutter not in PATH."
        }
    }
    "ci-server" { Invoke-Npm $server "npm run ci" }
    "ci-electron" { Invoke-Npm $electron "npm run ci" }
    "ci" {
        Invoke-Npm $server "npm run ci"
        Invoke-Npm $electron "npm run ci"
    }
    "ci-mobile" { Invoke-Npm $mobile "flutter analyze; flutter test" }
    default {
        Write-Host "Unknown target: $Target"
        Show-Help
        exit 1
    }
}
