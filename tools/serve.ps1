# Petit serveur local pour tester le jeu sans Node ni Python : http://localhost:8765/ (ASCII seulement : PowerShell 5.1)
# Usage : powershell -NoProfile -ExecutionPolicy Bypass -File tools/serve.ps1 [dossier] [port]
param([string]$root = (Split-Path $PSScriptRoot -Parent), [int]$port = 8765)
$root = (Resolve-Path $root).Path
$types = @{ '.html'='text/html; charset=utf-8'; '.js'='text/javascript; charset=utf-8'; '.css'='text/css; charset=utf-8';
  '.json'='application/json; charset=utf-8'; '.png'='image/png'; '.jpg'='image/jpeg'; '.svg'='image/svg+xml'; '.ink'='text/plain; charset=utf-8' }
$l = New-Object System.Net.HttpListener
$l.Prefixes.Add("http://localhost:$port/")
$l.Start()
Write-Host "NEO-BXL Voxel : http://localhost:$port/  (Ctrl+C pour arreter)"
while ($l.IsListening) {
  $c = $l.GetContext()
  $rel = [Uri]::UnescapeDataString($c.Request.Url.AbsolutePath.TrimStart('/'))
  if ($rel -eq '') { $rel = 'index.html' }
  $path = [IO.Path]::GetFullPath((Join-Path $root $rel))
  if ($path.StartsWith($root) -and (Test-Path $path -PathType Leaf)) {
    $b = [IO.File]::ReadAllBytes($path)
    $ext = [IO.Path]::GetExtension($path).ToLower()
    $c.Response.ContentType = $(if ($types[$ext]) { $types[$ext] } else { 'application/octet-stream' })
    $c.Response.Headers.Add('Cache-Control', 'no-store')
    $c.Response.OutputStream.Write($b, 0, $b.Length)
  } else { $c.Response.StatusCode = 404 }
  $c.Response.Close()
}
