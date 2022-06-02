const Store = require("./utils/Store/index");

const storeDefaults = {
    ENABLE_AUDIO: true,
    LANGUAGE: "us",
    ROUND_STATS: {
        current: 1,
        max: 1,
    },
    INITIAL_SETUP: true,
    TIMER_STATE: {
        time: 0,
        start: false,
        pause: false,
        resume: false,
        reset: false,
    },
    CURRENT_SCORE: {
        player: 0,
        opponent: 0,
    },
};

const globalSettings = new Store({
    configName: "settings",
    defaults: storeDefaults,
});

module.exports = {
    globalSettings,
    storeDefaults,
};
