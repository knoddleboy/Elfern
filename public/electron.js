const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const __DEV__ = require("electron-is-dev");

require("@electron/remote/main").initialize();

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 640,
        minHeight: 480,
        center: true,
        frame: false,
        icon: path.join(__dirname, "./favicon.ico"),
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false, // Get access to IPC
        },
    });

    // mainWindow.resizable = false;

    if (__DEV__) {
        mainWindow.loadURL("http://localhost:3000"); // Load from localhost the index.html
        mainWindow.webContents.openDevTools(); // Open the DevTools
    } else {
        mainWindow.loadURL(`file://${path.join(__dirname, "../build/index.html")}`);
    }

    mainWindow.on("maximize", () => {
        mainWindow.webContents.send("window-maximized");
    });

    mainWindow.on("unmaximize", () => {
        mainWindow.webContents.send("window-restored");
    });

    ipcMain.on("minimize-app", () => {
        mainWindow.minimize();
    });

    ipcMain.on("maximize-restore-app", () => {
        if (mainWindow.isMaximized()) {
            mainWindow.restore();
            return;
        }

        mainWindow.maximize();
    });

    ipcMain.on("close-app", () => {
        mainWindow.close();
    });

    ipcMain.on("store-get-app-data", (event) => {
        event.returnValue = app.getPath("userData");
    });
};

/**
 * This method will be called when Electron has finished
 * initialization and is ready to create browser windows.
 * Some APIs can only be used after this event occurs.
 */
app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        /**
         * On macOS it's common to re-create a window in the app when the
         * dock icon is clicked and there are no other windows open.
         */
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

/**
 * Quit when all windows are closed, except on macOS. There, it's common
 * for applications and their menu bar to stay active until the user quits
 * explicitly with Cmd + Q.
 */
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
