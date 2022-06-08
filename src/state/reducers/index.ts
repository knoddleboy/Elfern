import { combineReducers } from "redux";
import audioReducer from "./audio.reducer";
import langReducer from "./lang.reducer";
import initialSetupReducer from "./initialSetup.reducer";
import storeSessionSignalReducer from "./storeSessionSignal.reducer";
import progressReducer from "./progress.reducer";
import statsReducer from "./stats.reducer";

const reducers = combineReducers({
    ENABLE_AUDIO: audioReducer,
    LANGUAGE: langReducer,
    INITIAL_SETUP: initialSetupReducer,
    STORE_SESSION_SIGNAL: storeSessionSignalReducer,
    PROGRESS: progressReducer,
    STATS: statsReducer,
});

export type State = ReturnType<typeof reducers>;

export default reducers;
