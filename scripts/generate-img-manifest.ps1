$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$imgDir = Join-Path $root 'img'
$manifestPath = Join-Path $imgDir 'manifest.json'
$extensions = @('.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif')
$nameOverrides = @{
    'background.webp' = 'خلفية افتراضية'
    'background.jpg' = 'خلفية افتراضية'
}

function Get-DisplayName([string]$fileName) {
    if ($nameOverrides.ContainsKey($fileName)) {
        return $nameOverrides[$fileName]
    }
    $base = [System.IO.Path]::GetFileNameWithoutExtension($fileName) -replace '[-_]+', ' '
    if ($base.Length -gt 48) {
        return ($base.Substring(0, 45) + '...')
    }
    return $base.Trim()
}

if (-not (Test-Path $imgDir)) {
    throw "Missing folder: $imgDir"
}

$images = Get-ChildItem -Path $imgDir -File |
    Where-Object { $extensions -contains $_.Extension.ToLower() -and $_.Name -ne 'manifest.json' } |
    Sort-Object {
        if ($_.Name -eq 'background.webp' -or $_.Name -eq 'background.jpg') { '000' } else { $_.Name }
    } |
    ForEach-Object {
        [ordered]@{
            src = "img/$($_.Name)"
            name = Get-DisplayName $_.Name
        }
    }

$manifest = [ordered]@{
    updatedAt = (Get-Date).ToUniversalTime().ToString('o')
    images = @($images)
}

$manifest | ConvertTo-Json -Depth 5 | Set-Content -Path $manifestPath -Encoding UTF8
Write-Host "Updated $manifestPath with $($images.Count) image(s)."
