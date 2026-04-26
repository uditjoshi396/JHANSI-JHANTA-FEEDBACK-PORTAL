$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$serverDir = $PSScriptRoot
$repoRoot = Resolve-Path (Join-Path $serverDir "..")
$logsDir = Join-Path $repoRoot "logs"
New-Item -ItemType Directory -Path $logsDir -Force | Out-Null

$outLog = Join-Path $logsDir "server-smoke.out.log"
$errLog = Join-Path $logsDir "server-smoke.err.log"
$pidFile = Join-Path $logsDir "server-smoke.pid"

New-Item -ItemType File -Path $outLog -Force | Out-Null
New-Item -ItemType File -Path $errLog -Force | Out-Null

Write-Host "Starting server..."
$proc = Start-Process -FilePath "node" -ArgumentList "index.js" -WorkingDirectory $serverDir -RedirectStandardOutput $outLog -RedirectStandardError $errLog -PassThru
Set-Content -Path $pidFile -Value $proc.Id

function Stop-Server {
  if (Test-Path $pidFile) {
    $serverPid = Get-Content $pidFile | Select-Object -First 1
    if ($serverPid) {
      $running = Get-Process -Id $serverPid -ErrorAction SilentlyContinue
      if ($running) { Stop-Process -Id $serverPid -Force }
    }
  }
}

function Wait-For-Server {
  for ($i = 0; $i -lt 30; $i++) {
    Start-Sleep -Seconds 1
    $out = (Test-Path $outLog) ? (Get-Content $outLog -Raw) : ""
    $err = (Test-Path $errLog) ? (Get-Content $errLog -Raw) : ""
    if ($err -match "Mongo connect error") { throw "Mongo connect error. See $errLog" }
    if ($err -match "EADDRINUSE") { throw "Port already in use. See $errLog" }
    if ($out -match "Server listening") { return }
  }
  throw "Server did not start. See logs in $outLog / $errLog"
}

function Get-LastCode([string]$subject) {
  if (-not (Test-Path $outLog)) { return $null }
  $text = Get-Content $outLog -Raw
  $pattern = [regex]::Escape("Subject: $subject") + "(.|\r|\n)*?<h2[^>]*>(\d{6})</h2>"
  $matches = [regex]::Matches($text, $pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if ($matches.Count -eq 0) { return $null }
  return $matches[$matches.Count - 1].Groups[2].Value
}

function Wait-For-Code([string]$subject, [int]$timeoutSeconds = 15) {
  for ($i = 0; $i -lt $timeoutSeconds; $i++) {
    $code = Get-LastCode $subject
    if ($code) { return $code }
    Start-Sleep -Seconds 1
  }
  return $null
}

try {
  Wait-For-Server

  $base = if ($env:AUTH_BASE_URL) { $env:AUTH_BASE_URL } else { "http://localhost:5000/api/auth" }
  $email = "test.user+ci.$([DateTime]::Now.ToString('yyyyMMddHHmmss'))@local.test"
  $pass = "P@ssw0rd123!"
  $newPass = "N3wP@ssw0rd123!"

  Write-Host "Registering $email"
  try {
    Invoke-RestMethod -Method Post -Uri "$base/register" -ContentType "application/json" -Body (ConvertTo-Json @{ name = "Test User"; email = $email; password = $pass; role = "citizen" }) | Out-Null
  } catch {
    if ($_.Exception.Response.StatusCode.Value__ -ne 409) { throw }
  }

  Write-Host "Logging in (2FA expected)"
  $loginRes = Invoke-RestMethod -Method Post -Uri "$base/login" -ContentType "application/json" -Body (ConvertTo-Json @{ email = $email; password = $pass })
  if ($loginRes.requires2FA) {
    $code = Wait-For-Code "Your verification code"
    if (-not $code) { throw "2FA code not found in log (enable MAILER_LOG_ONLY or check SMTP)" }
    Invoke-RestMethod -Method Post -Uri "$base/verify-2fa" -ContentType "application/json" -Body (ConvertTo-Json @{ email = $email; code = $code; method = "email" }) | Out-Null
  } elseif (-not $loginRes.token) {
    throw "Login did not return token or 2FA requirement"
  }

  Write-Host "Requesting password reset"
  Invoke-RestMethod -Method Post -Uri "$base/forgot-password" -ContentType "application/json" -Body (ConvertTo-Json @{ email = $email }) | Out-Null
  $resetCode = Wait-For-Code "Your password reset code"
  if (-not $resetCode) { throw "Reset code not found in log (enable MAILER_LOG_ONLY or check SMTP)" }

  Write-Host "Verifying reset code"
  Invoke-RestMethod -Method Post -Uri "$base/verify-reset-code" -ContentType "application/json" -Body (ConvertTo-Json @{ email = $email; code = $resetCode }) | Out-Null

  Write-Host "Resetting password"
  Invoke-RestMethod -Method Post -Uri "$base/reset-password" -ContentType "application/json" -Body (ConvertTo-Json @{ email = $email; code = $resetCode; password = $newPass }) | Out-Null

  Write-Host "Logging in with new password (2FA expected)"
  $loginRes2 = Invoke-RestMethod -Method Post -Uri "$base/login" -ContentType "application/json" -Body (ConvertTo-Json @{ email = $email; password = $newPass })
  if ($loginRes2.requires2FA) {
    $code2 = Wait-For-Code "Your verification code"
    if (-not $code2) { throw "2FA code not found in log after reset" }
    Invoke-RestMethod -Method Post -Uri "$base/verify-2fa" -ContentType "application/json" -Body (ConvertTo-Json @{ email = $email; code = $code2; method = "email" }) | Out-Null
  } elseif (-not $loginRes2.token) {
    throw "Login after reset did not return token or 2FA requirement"
  }

  Write-Host "Smoke tests completed"
} finally {
  Stop-Server
}
