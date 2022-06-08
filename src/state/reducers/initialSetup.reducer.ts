import { Action } from "../actions";
import { ActionType } from "../action-types";
import { activeSession } from "@src/configs";

const INITIAL_STATE = activeSession.get("INITIAL_SETUP");

const initialSetupReducer = (state = INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case ActionType.IS_INITIAL_SETUP:
            if (action.payload) return action.payload;
            return !state;
        default:
            return state;
    }
};

export default initialSetupReducer;
