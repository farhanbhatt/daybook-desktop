const { app, BrowserWindow, Menu, ipcMain, dialog, shell } = require('electron');
const https = require('https');
const path = require('path');
const fs = require('fs').promises;
const os = require('os');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            allowRunningInsecureContent: false,
            experimentalFeatures: false,
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'default',
        show: false,
        autoHideMenuBar: false
    });

    // Load the app
    console.log('Loading application...');
    console.log('isDev:', isDev);
    console.log('__dirname:', __dirname);
    
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        const htmlPath = path.join(__dirname, 'index.html');
        console.log('Loading HTML from:', htmlPath);
        mainWindow.loadFile(htmlPath);
        // Temporarily enable dev tools for debugging
        mainWindow.webContents.openDevTools();
    }

    // Add error handling
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
        console.error('Failed to load:', errorCode, errorDescription, validatedURL);
    });

    mainWindow.webContents.on('dom-ready', () => {
        console.log('DOM ready');
    });

    mainWindow.webContents.on('did-finish-load', () => {
        console.log('Page loaded successfully');
    });

    mainWindow.once('ready-to-show', () => {
        console.log('Window ready to show');
        mainWindow.show();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.whenReady().then(() => {
    createWindow();

    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Entry',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('menu-new-entry');
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Exit',
                    accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
                    click: () => {
                        app.quit();
                    }
                }
            ]
        },
        {
            label: 'View',
            submenu: [
                {
                    label: 'Dashboard',
                    accelerator: 'CmdOrCtrl+1',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('menu-navigate', 'dashboard');
                        }
                    }
                },
                {
                    label: 'Income',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('menu-navigate', 'income');
                        }
                    }
                },
                {
                    label: 'Expense',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('menu-navigate', 'expense');
                        }
                    }
                },
                {
                    label: 'Ledger',
                    accelerator: 'CmdOrCtrl+4',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('menu-navigate', 'ledger');
                        }
                    }
                },
                { type: 'separator' },
                {
                    label: 'Reload',
                    accelerator: 'CmdOrCtrl+R',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.reload();
                        }
                    }
                },
                {
                    label: 'Toggle Developer Tools',
                    accelerator: 'F12',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.toggleDevTools();
                        }
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'Check for Updates',
                    click: () => {
                        checkForUpdates();
                    }
                },
                { type: 'separator' },
                {
                    label: 'About',
                    click: () => {
                        if (mainWindow) {
                            mainWindow.webContents.send('menu-about');
                        }
                    }
                }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle IPC messages
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

// Manual update checking
function checkForUpdates() {
    const currentVersion = app.getVersion();
    const updateUrl = 'https://golden-sorbet-3b1fc2.netlify.app/update.json';
    
    console.log('Checking for updates...');
    console.log('Current version:', currentVersion);
    console.log('Update URL:', updateUrl);
    
    https.get(updateUrl, (res) => {
        let data = '';
        
        console.log('Response status:', res.statusCode);

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            try {
                console.log('Raw response data:', data);
                const updateData = JSON.parse(data);
                const remoteVersion = updateData.version;
                
                console.log('Remote version:', remoteVersion);
                console.log('Version comparison:', currentVersion, '!==', remoteVersion, '=', currentVersion !== remoteVersion);
                
                if (currentVersion !== remoteVersion) {
                    console.log('Update available! Showing notification...');
                    notifyUpdateAvailable(remoteVersion, updateData);
                } else {
                    console.log('No update available. App is up to date.');
                    // Show "no update" message when manually checking
                    if (mainWindow) {
                        dialog.showMessageBox(mainWindow, {
                            type: 'info',
                            buttons: ['OK'],
                            title: 'No Updates',
                            message: 'You are running the latest version of Daybook Desktop.'
                        });
                    }
                }
            } catch (error) {
                console.error('Error parsing update data:', error);
                console.error('Raw data that failed to parse:', data);
            }
        });
    }).on('error', (err) => {
        console.error('Error checking for updates:', err);
        if (mainWindow) {
            dialog.showMessageBox(mainWindow, {
                type: 'error',
                buttons: ['OK'],
                title: 'Update Check Failed',
                message: 'Unable to check for updates. Please check your internet connection.'
            });
        }
    });
}

function notifyUpdateAvailable(remoteVersion, updateData) {
    if (mainWindow) {
        console.log('Creating update notification dialog...');
        
        // Make the main window flash to get attention
        mainWindow.flashFrame(true);
        
        // Show a more detailed update dialog
        dialog.showMessageBox(mainWindow, {
            type: 'info',
            buttons: ['Download Update', 'View Details', 'Remind Me Later'],
            defaultId: 0,
            title: '🚀 Update Available - Daybook Desktop',
            message: `A new version (v${remoteVersion}) is available!`,
            detail: `Current version: v${app.getVersion()}\nLatest version: v${remoteVersion}\n\nWhat's new:\n${updateData.releaseNotes ? updateData.releaseNotes.map(note => `• ${note}`).join('\n') : 'Bug fixes and improvements'}\n\nWould you like to download the update now?`,
            noLink: true,
            normalizeAccessKeys: false
        }).then((result) => {
            console.log('User clicked button:', result.response);
            if (result.response === 0) {
                // Download Update
                console.log('Opening download page...');
                shell.openExternal(updateData.downloadUrl || 'https://golden-sorbet-3b1fc2.netlify.app/');
            } else if (result.response === 1) {
                // View Details
                console.log('Opening update page...');
                shell.openExternal(updateData.downloadUrl || 'https://golden-sorbet-3b1fc2.netlify.app/');
            }
            // Option 2 = Remind Me Later (do nothing)
        }).catch((error) => {
            console.error('Error showing update dialog:', error);
        });
    } else {
        console.log('Main window not available for update notification');
    }
}

// Add IPC handlers for update checking
ipcMain.handle('check-for-updates', () => {
    checkForUpdates();
});

// Check for updates on app ready (but only in production)
if (!isDev) {
    app.whenReady().then(() => {
        // Delay initial update check by 5 seconds to let the app fully load
        setTimeout(checkForUpdates, 5000);
    });
}

ipcMain.handle('show-message-box', async (event, options) => {
    if (mainWindow) {
        const result = await dialog.showMessageBox(mainWindow, options);
        return result;
    }
    return { response: 0 };
});

// File operations
ipcMain.handle('show-save-dialog', async (event, options) => {
    if (mainWindow) {
        const result = await dialog.showSaveDialog(mainWindow, options);
        return result.canceled ? null : result.filePath;
    }
    return null;
});

ipcMain.handle('show-open-dialog', async (event, options) => {
    if (mainWindow) {
        const result = await dialog.showOpenDialog(mainWindow, options);
        return result.canceled ? null : result.filePaths;
    }
    return null;
});

ipcMain.handle('save-file', async (event, filePath, data) => {
    try {
        await fs.writeFile(filePath, data, 'utf8');
        return true;
    } catch (error) {
        console.error('Error saving file:', error);
        throw error;
    }
});

ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const data = await fs.readFile(filePath, 'utf8');
        return data;
    } catch (error) {
        console.error('Error reading file:', error);
        throw error;
    }
});

ipcMain.handle('create-auto-backup', async (event, data) => {
    try {
        // Create backups directory in user's documents
        const documentsPath = os.homedir();
        const backupDir = path.join(documentsPath, 'Documents', 'Daybook Backups');
        
        // Ensure backup directory exists
        try {
            await fs.mkdir(backupDir, { recursive: true });
        } catch (mkdirError) {
            console.log('Backup directory already exists or could not be created');
        }
        
        // Create backup file with timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFileName = `daybook_auto_backup_${timestamp}.json`;
        const backupFilePath = path.join(backupDir, backupFileName);
        
        await fs.writeFile(backupFilePath, data, 'utf8');
        
        // Keep only the last 10 auto backups
        const files = await fs.readdir(backupDir);
        const autoBackupFiles = files
            .filter(file => file.startsWith('daybook_auto_backup_'))
            .map(file => ({
                name: file,
                path: path.join(backupDir, file),
                time: fs.stat(path.join(backupDir, file)).then(stats => stats.mtime)
            }));
        
        if (autoBackupFiles.length > 10) {
            const sortedFiles = await Promise.all(
                autoBackupFiles.map(async file => ({
                    ...file,
                    time: await file.time
                }))
            );
            
            sortedFiles.sort((a, b) => b.time - a.time);
            
            // Delete oldest files
            for (let i = 10; i < sortedFiles.length; i++) {
                try {
                    await fs.unlink(sortedFiles[i].path);
                } catch (unlinkError) {
                    console.error('Could not delete old backup:', unlinkError);
                }
            }
        }
        
        return true;
    } catch (error) {
        console.error('Error creating auto backup:', error);
        return false;
    }
});
