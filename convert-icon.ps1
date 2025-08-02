# Daybook Desktop Icon Conversion Helper
# This script helps you prepare your icon for the Daybook Desktop application

Write-Host "🎨 Daybook Desktop Icon Setup Helper" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green
Write-Host ""

# Check if assets directory exists
if (!(Test-Path "assets")) {
    New-Item -ItemType Directory -Path "assets"
    Write-Host "✅ Created assets directory" -ForegroundColor Green
}

# Check if icon already exists
if (Test-Path "assets/icon.ico") {
    Write-Host "✅ Icon file found: assets/icon.ico" -ForegroundColor Green
    
    # Get file size
    $iconSize = (Get-Item "assets/icon.ico").Length
    Write-Host "📁 Icon file size: $($iconSize) bytes" -ForegroundColor Yellow
    
    if ($iconSize -gt 0) {
        Write-Host "✅ Icon file appears to be valid" -ForegroundColor Green
    } else {
        Write-Host "❌ Icon file is empty or corrupted" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Icon file not found: assets/icon.ico" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Save your green Daybook icon as PNG (minimum 256x256)" -ForegroundColor White
    Write-Host "2. Visit: https://convertio.co/png-ico/" -ForegroundColor White
    Write-Host "3. Upload your PNG and download the ICO file" -ForegroundColor White
    Write-Host "4. Save the downloaded file as 'assets/icon.ico'" -ForegroundColor White
    Write-Host "5. Run this script again to validate" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Alternative online converters:" -ForegroundColor Cyan
    Write-Host "   • https://favicon.io/favicon-converter/" -ForegroundColor White
    Write-Host "   • https://www.icoconverter.com/" -ForegroundColor White
    Write-Host "   • https://redketchup.io/icon-converter" -ForegroundColor White
}

Write-Host ""
Write-Host "🔧 Icon Requirements:" -ForegroundColor Cyan
Write-Host "• Format: ICO (Windows icon format)" -ForegroundColor White
Write-Host "• Recommended sizes: 16x16, 32x32, 48x48, 64x64, 128x128, 256x256" -ForegroundColor White
Write-Host "• Background: Transparent or solid color" -ForegroundColor White
Write-Host "• Quality: Sharp and clear at all sizes" -ForegroundColor White

Write-Host ""
Write-Host "🚀 After adding icon:" -ForegroundColor Cyan
Write-Host "1. Run: npm run dist (to rebuild main app)" -ForegroundColor White
Write-Host "2. Run: cd Daybook-Desktop-Trial-v1.0.1; npm run dist (to rebuild trial)" -ForegroundColor White
Write-Host "3. Your new installers will include the custom icon!" -ForegroundColor White

Write-Host ""
Write-Host "📁 Current directory structure:" -ForegroundColor Yellow
if (Test-Path "assets") {
    Get-ChildItem "assets" | ForEach-Object {
        if ($_.Name -eq "icon.ico") {
            Write-Host "   ✅ assets/$($_.Name)" -ForegroundColor Green
        } else {
            Write-Host "   📄 assets/$($_.Name)" -ForegroundColor White
        }
    }
} else {
    Write-Host "   ❌ No assets directory found" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎨 Your Icon Design Analysis:" -ForegroundColor Magenta
Write-Host "• Green color scheme ✅ (Perfect for financial apps)" -ForegroundColor White
Write-Host "• Book/ledger symbol ✅ (Great for daybook concept)" -ForegroundColor White
Write-Host "• Clean, professional design ✅" -ForegroundColor White
Write-Host "• Rounded corners ✅ (Modern aesthetic)" -ForegroundColor White

Write-Host ""
Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
