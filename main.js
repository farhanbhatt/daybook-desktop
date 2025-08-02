const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
    // Create the browser window
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/icon.png'), // Add your icon here
        titleBarStyle: 'default',
        show: false // Don't show until ready
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, 'dist/index.html'));
    }

    // Show window when ready
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    // Create application menu
    const template = [
        {
            label: 'File',
            submenu: [
                {
                    label: 'New Entry',
                    accelerator: 'CmdOrCtrl+N',
                    click: () => {
                        mainWindow.webContents.send('menu-new-entry');
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
                        mainWindow.webContents.send('menu-navigate', 'dashboard');
                    }
                },
                {
                    label: 'Income',
                    accelerator: 'CmdOrCtrl+2',
                    click: () => {
                        mainWindow.webContents.send('menu-navigate', 'income');
                    }
                },
                {
                    label: 'Expense',
                    accelerator: 'CmdOrCtrl+3',
                    click: () => {
                        mainWindow.webContents.send('menu-navigate', 'expense');
                    }
                },
                {
                    label: 'Ledger',
                    accelerator: 'CmdOrCtrl+4',
                    click: () => {
                        mainWindow.webContents.send('menu-navigate', 'ledger');
                    }
                }
            ]
        },
        {
            label: 'Help',
            submenu: [
                {
                    label: 'About',
                    click: () => {
                        mainWindow.webContents.send('menu-about');
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

// Quit when all windows are closed
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// Handle IPC messages
ipcMain.handle('get-app-version', () => {
    return app.getVersion();
});

ipcMain.handle('show-message-box', async (event, options) => {
    const { dialog } = require('electron');
    const result = await dialog.showMessageBox(mainWindow, options);
    return result;
});
