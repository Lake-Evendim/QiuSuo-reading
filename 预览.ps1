$ErrorActionPreference = 'Stop'
$readingProjectRoot = $PSScriptRoot
$readingPythonCommand = Get-Command python -ErrorAction Stop
$readingPort = 8807
$readingListener = Get-NetTCPConnection -LocalPort $readingPort -State Listen -ErrorAction SilentlyContinue
if (-not $readingListener) {
    Start-Process -FilePath $readingPythonCommand.Source -ArgumentList '-m', 'http.server', "$readingPort", '--bind', '127.0.0.1' -WorkingDirectory $readingProjectRoot -WindowStyle Hidden
} else {
    $readingExistingProcess = Get-CimInstance Win32_Process -Filter "ProcessId = $($readingListener[0].OwningProcess)"
    if ($readingExistingProcess.CommandLine -notmatch 'http\.server\s+8807') {
        throw '8807端口已被其他服务占用，请先释放端口后重试。'
    }
}
Write-Output "在浏览器打开：http://127.0.0.1:$readingPort/prototype/"
Write-Output "比较三套设计：http://127.0.0.1:$readingPort/design-lab/"
