# Complete Build Instructions

## Step 1: Install Dependencies
Open your command prompt in the project directory and run:
```bash
npm install
```

## Step 2: Test in Development Mode
```bash
npm run electron
```

## Step 3: Build for Production
```bash
npm run build-electron
```

## Step 4: Create Installer
```bash
npm run dist
```

## Step 5: Find Your Files
- The built application will be in the `dist` folder
- Look for `Daybook Desktop Setup.exe` (Windows installer)
- Or `Daybook Desktop.exe` (standalone executable)

## Troubleshooting

### If you get "electron not found" error:
```bash
npm install electron --save-dev
```

### If you get "electron-builder not found" error:
```bash
npm install electron-builder --save-dev
```

### If you need to rebuild node modules:
```bash
npm run rebuild
```

## File Structure After Build:
```
project/
├── dist/
│   ├── Daybook Desktop Setup.exe  (installer)
│   └── unpacked/
│       └── Daybook Desktop.exe    (executable)
├── main.js
├── preload.js
├── package.json
└── your web files...
```

## Optional: Add Application Icon
1. Create an `assets` folder in your project
2. Add `icon.png` (256x256 pixels) and `icon.ico` (for Windows)
3. Update the icon paths in `main.js` and `package.json`

## Distribution:
- Share the `Daybook Desktop Setup.exe` for easy installation
- Or share the `Daybook Desktop.exe` for portable use
- The installer will create shortcuts and handle uninstallation
