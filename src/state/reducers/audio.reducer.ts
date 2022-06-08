import { Action } from "../actions";
import { ActionType } from "../action-types";
import { globalSettings } from "@src/configs";

const INITIAL_STATE = globalSettings.get("ENABLE_AUDIO");

const audioReducer = (state = INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case ActionType.ENABLE_AUDIO:
            if (action.payload) return action.payload;
            return !state;
        default:
            return state;
    }
};

export default audioReducer;
