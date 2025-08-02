# Daybook Desktop Auto Backup Script
# This script creates automated backups of Daybook data

param(
    [string]$BackupPath = "$env:USERPROFILE\Documents\Daybook Backups",
    [int]$RetainDays = 30
)

# Create backup directory if it doesn't exist
if (!(Test-Path $BackupPath)) {
    New-Item -ItemType Directory -Path $BackupPath -Force | Out-Null
    Write-Host "Created backup directory: $BackupPath"
}

# Get current date for backup naming
$Date = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$BackupFileName = "daybook_system_backup_$Date.json"
$BackupFilePath = Join-Path $BackupPath $BackupFileName

# Paths where Daybook data might be stored
$DataSources = @(
    "$env:APPDATA\daybook-desktop",
    "$env:LOCALAPPDATA\daybook-desktop",
    "$env:USERPROFILE\Documents\Daybook Backups"
)

# Create backup data structure
$BackupData = @{
    backupDate = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
    systemInfo = @{
        computerName = $env:COMPUTERNAME
        userName = $env:USERNAME
        osVersion = (Get-WmiObject -Class Win32_OperatingSystem).Caption
    }
    dataSources = @()
}

# Collect data from various sources
foreach ($source in $DataSources) {
    if (Test-Path $source) {
        $sourceInfo = @{
            path = $source
            files = @()
        }
        
        Get-ChildItem -Path $source -Recurse -File | ForEach-Object {
            if ($_.Extension -eq ".json" -or $_.Name -like "*daybook*") {
                try {
                    $content = Get-Content $_.FullName -Raw -ErrorAction Stop
                    $sourceInfo.files += @{
                        name = $_.Name
                        relativePath = $_.FullName.Replace($source, "")
                        content = $content
                        lastModified = $_.LastWriteTime.ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
                    }
                } catch {
                    Write-Warning "Could not read file: $($_.FullName)"
                }
            }
        }
        
        if ($sourceInfo.files.Count -gt 0) {
            $BackupData.dataSources += $sourceInfo
        }
    }
}

# Save backup
try {
    $BackupData | ConvertTo-Json -Depth 10 | Out-File -FilePath $BackupFilePath -Encoding UTF8
    Write-Host "✅ System backup created: $BackupFilePath"
    
    # Clean up old backups
    $OldBackups = Get-ChildItem -Path $BackupPath -Filter "daybook_system_backup_*.json" | 
                  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-$RetainDays) }
    
    foreach ($oldBackup in $OldBackups) {
        Remove-Item $oldBackup.FullName -Force
        Write-Host "🗑️  Removed old backup: $($oldBackup.Name)"
    }
    
    Write-Host "📊 Backup Summary:"
    Write-Host "   • Backup file: $BackupFileName"
    Write-Host "   • Data sources found: $($BackupData.dataSources.Count)"
    Write-Host "   • Total files backed up: $(($BackupData.dataSources | ForEach-Object { $_.files.Count } | Measure-Object -Sum).Sum)"
    
} catch {
    Write-Error "❌ Failed to create backup: $($_.Exception.Message)"
    exit 1
}

# Create scheduled task setup script
$SetupTaskScript = @"
# Run this script as Administrator to set up automated backups
`$TaskName = "Daybook Auto Backup"
`$ScriptPath = "$($MyInvocation.MyCommand.Path)"

# Check if task already exists
if (Get-ScheduledTask -TaskName `$TaskName -ErrorAction SilentlyContinue) {
    Write-Host "Task already exists. Updating..."
    Unregister-ScheduledTask -TaskName `$TaskName -Confirm:`$false
}

# Create the scheduled task
`$Trigger = New-ScheduledTaskTrigger -Daily -At "02:00AM"
`$Action = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-ExecutionPolicy Bypass -File '`$ScriptPath'"
`$Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries

Register-ScheduledTask -TaskName `$TaskName -Trigger `$Trigger -Action `$Action -Settings `$Settings -Description "Automated backup for Daybook Desktop application"

Write-Host "✅ Scheduled task '$TaskName' created successfully!"
Write-Host "   • Runs daily at 2:00 AM"
Write-Host "   • Backs up to: $BackupPath"
Write-Host "   • Retains backups for: $RetainDays days"
"@

# Save the setup script
$SetupScriptPath = Join-Path $BackupPath "setup-scheduled-backup.ps1"
$SetupTaskScript | Out-File -FilePath $SetupScriptPath -Encoding UTF8

Write-Host ""
Write-Host ""
Write-Host "🔄 To set up automated daily backups:"
Write-Host "   1. Run PowerShell as Administrator"
Write-Host "   2. Execute: `"& '$SetupScriptPath'"
Write-Host ""
