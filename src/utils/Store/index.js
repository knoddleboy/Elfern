const { isAbsolute, join } = require("path");
const { app, ipcMain, ipcRenderer } = require("electron");

const ConfigHandler = require("../ConfigHandler/dist/index");

let isInitialized = false;

// Set up the `ipcMain` handler for communication between renderer and main process.
const initDataListener = () => {
    if (!ipcMain || !app) {
        throw new Error("Store: You need to call `.initRenderer()` from the main process.");
    }

    const appData = {
        defaultCwd: app.getPath("userData"),
    };

    if (isInitialized) {
        return appData;
    }

    ipcMain.on("store-get-app-data", (event) => {
        event.returnValue = appData;
    });

    isInitialized = true;

    return appData;
};

class Store extends ConfigHandler {
    constructor(options) {
        let defaultCwd;

        if (ipcRenderer) {
            // Send request to ipcMain for getting cwd from electron
            const appData = ipcRenderer.sendSync("store-get-app-data");

            if (!appData) {
                throw new Error("Electron Store: You need to call `.initRenderer()` from the main process.");
            }

            ({ defaultCwd } = appData);
        } else if (ipcMain && app) {
            ({ defaultCwd } = initDataListener());
        }

        options = {
            ...options,
        };

        // If cwd was provided when configuring store, check if the value is absolute path.
        // If cwd was not provided, set its value with path, received from electron's getPath method.
        if (options.cwd) {
            options.cwd = isAbsolute(options.cwd) ? options.cwd : join(defaultCwd, options.cwd);
        } else {
            options.cwd = defaultCwd;
        }

        super(options);
    }

    static initRenderer() {
        initDataListener();
    }
}

module.exports = Store;
