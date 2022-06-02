import { ipcRenderer } from "electron";
import { globalSettings } from "../configs";

type StoreType = typeof globalSettings.getStore;

/**
 * This is a helper class. It unifies `get` method of the `Store` (to get data from the store )
 * and `send` method of the `ipcRenderer` (to send the data to the main process).
 *
 * @important
 * Used in conjunction with redux.
 */
class TransferStore {
    /**
     * Get an item from the global config file.
     * @param key - The key of the item to get. Can be represented in a form of either a key in the store or a dot notation.
     */
    static get<Key extends keyof StoreType>(key: Key): StoreType[Key] {
        return globalSettings.get(key);
    }

    /**
     * Send a `value` to the main process to store it locally. Once app is closed, the `value` stores globally in the config file.
     * @param value - Value to send.
     */
    static send(value: Record<string, unknown>): void {
        ipcRenderer.send("dispatch-main-store", value);
    }
}

export default TransferStore;
