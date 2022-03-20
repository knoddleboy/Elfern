import { ipcRenderer } from "electron";

export class TitlebarButtons {
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
