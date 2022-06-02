import { combineReducers } from "redux";
import audioReducer from "./audio.reducer";
import langReducer from "./lang.reducer";
import roundStatsReducer from "./roundStats.reducer";
import initialSetupReducer from "./initialSetup.reducer";
import timerStateReducer from "./timerState.reducer";
import currentScoreReducer from "./currentScore.reducer";

const reducers = combineReducers({
    ENABLE_AUDIO: audioReducer,
    LANGUAGE: langReducer,
    ROUND_STATS: roundStatsReducer,
    INITIAL_SETUP: initialSetupReducer,
    TIMER_STATE: timerStateReducer,
    CURRENT_SCORE: currentScoreReducer,
});

export type State = ReturnType<typeof reducers>;

export default reducers;
