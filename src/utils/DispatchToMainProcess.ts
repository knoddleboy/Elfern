import { ipcRenderer } from "electron";

class DispatchToMainProcess {
    static minimizeApp() {
        ipcRenderer.send("minimize-app");
    }

    static maximizeRestoreApp() {
        ipcRenderer.send("maximize-restore-app");
    }

    static closeApp() {
        ipcRenderer.send("close-app");
    }
}

export default DispatchToMainProcess;
