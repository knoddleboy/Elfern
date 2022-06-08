import Store from "@utils/Store";
import { IGlobalSettingsDefaults, IActiveSessionDefaults } from "./types";

export const globalSettingsDefaults: IGlobalSettingsDefaults = {
    ENABLE_AUDIO: true,
    LANGUAGE: "ua",
};

export const activeSessionDefaults: IActiveSessionDefaults = {
    INITIAL_SETUP: true,
    STATS: {
        ROUND_STATS: {
            current: 1,
            max: 1,
        },
        CURRENT_SCORE: {
            player: 0,
            opponent: 0,
        },
    },
    PROGRESS: {
        DECK: [],
        HOLDER: {
            stock: [],
            player: [],
            opponent: [],
        },
        BATCH_DEALER: null,
    },
};

/** Config with application internal and external settings */
export const globalSettings = new Store({
    configName: "settings",
    defaults: globalSettingsDefaults,
});

/** Config with stored game session */
export const activeSession = new Store({
    configName: "session",
    defaults: activeSessionDefaults,
});
