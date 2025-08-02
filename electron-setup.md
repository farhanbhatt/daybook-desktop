# Step-by-Step Guide to Convert Daybook Web App to .exe

## Step 1: Install Node.js
1. Download and install Node.js from https://nodejs.org/
2. Choose the LTS version
3. Verify installation by opening command prompt and typing:
   ```
   node --version
   npm --version
   ```

## Step 2: Install Electron globally
Open command prompt and run:
```
npm install -g electron
```

## Step 3: Create Electron configuration files
You'll need to create these files in your project directory:

### 3.1: Update package.json
### 3.2: Create main.js (Electron main process)
### 3.3: Create preload.js (optional but recommended)

## Step 4: Install Electron dependencies
Run this command in your project directory:
```
npm install electron --save-dev
npm install electron-builder --save-dev
```

## Step 5: Test the desktop app
```
npm run electron
```

## Step 6: Build the .exe file
```
npm run build
```

## Step 7: Find your .exe file
The .exe file will be in the `dist` folder after building.

## Next Steps
Follow the file creations below for the complete setup.
