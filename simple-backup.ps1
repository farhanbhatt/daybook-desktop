# Simple Daybook Desktop Backup Script
param(
    [string]$BackupPath = "$env:USERPROFILE\Documents\Daybook Backups"
)

# Create backup directory
if (!(Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    Write-Host "Created backup directory: $BackupPath"
}

# Create backup file
$Date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupFileName = "daybook_backup_$Date.json"
$BackupFilePath = Join-Path $BackupPath $BackupFileName

# Create basic backup data
$BackupData = @{
    backupDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    computerName = $env:COMPUTERNAME
    userName = $env:USERNAME
    note = "Manual system backup created"
}

# Save backup
try {
    $BackupData | ConvertTo-Json | Out-File -FilePath $BackupFilePath -Encoding UTF8
    Write-Host "Backup created successfully: $BackupFilePath"
} catch {
    Write-Error "Failed to create backup: $($_.Exception.Message)"
}
