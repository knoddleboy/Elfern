import { combineReducers } from "redux";
import audioReducer from "./audio.reducer";
import langReducer from "./lang.reducer";

const reducers = combineReducers({
    audio: audioReducer,
    lang: langReducer,
});

export type State = ReturnType<typeof reducers>;

export default reducers;
