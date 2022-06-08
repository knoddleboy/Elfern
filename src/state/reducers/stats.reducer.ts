import { Action } from "../actions";
import { ActionType } from "../action-types";
import { activeSession } from "@src/configs";

const INITIAL_STATE = activeSession.get("STATS");

const statsReducer = (state = INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case ActionType.STATS:
            return action.payload;
        default:
            return state;
    }
};

export default statsReducer;
