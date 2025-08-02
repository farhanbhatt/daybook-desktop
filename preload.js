const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    showMessageBox: (options) => ipcRenderer.invoke('show-message-box', options),
    
    // File operations
    showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
    showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
    saveFile: (filePath, data) => ipcRenderer.invoke('save-file', filePath, data),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    createAutoBackup: (data) => ipcRenderer.invoke('create-auto-backup', data),
    
    // Menu events
    onMenuNewEntry: (callback) => ipcRenderer.on('menu-new-entry', callback),
    onMenuNavigate: (callback) => ipcRenderer.on('menu-navigate', callback),
    onMenuAbout: (callback) => ipcRenderer.on('menu-about', callback),
    
    // Remove listeners
    removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
