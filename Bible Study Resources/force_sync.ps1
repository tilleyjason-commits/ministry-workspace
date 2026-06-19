# Force OneDrive to download these files
$paths = @(
    "C:\Users\user\OneDrive\Desktop\Ephesians\Ephesians Overview.docx",
    "C:\Users\user\OneDrive\Desktop\Ephesians\Ephesians Chapter 1.docx",
    "C:\Users\user\OneDrive\Desktop\Ephesians\Ephesians Chapter 2.docx",
    "C:\Users\user\OneDrive\Desktop\Ephesians\Ephesians Chapter 3.docx",
    "C:\Users\user\OneDrive\Desktop\Ephesians\Blessed Beyond Measure -Moved Beyond Myself.docx"
)

foreach ($path in $paths) {
    $item = Get-Item -Path $path -Force
    Write-Host "File: $($item.Name)"
    Write-Host "  Size: $($item.Length)"
    Write-Host "  Attributes: $($item.Attributes)"
    
    # Try to open and read a few bytes to force download
    try {
        $stream = [System.IO.File]::OpenRead($path)
        $bytes = New-Object byte[] 100
        $read = $stream.Read($bytes, 0, 100)
        $stream.Close()
        Write-Host "  Read $read bytes - file is available locally"
    } catch {
        Write-Host "  ERROR: $_"
    }
    Write-Host ""
}

Write-Host "DONE"