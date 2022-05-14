const Store = require("./utils/Store/index");

const globalSettings = new Store({
    configName: "settings",
    defaults: {
        ENABLE_AUDIO: true,
        LANGUAGE: "us",
    },
});

module.exports = {
    globalSettings,
};
