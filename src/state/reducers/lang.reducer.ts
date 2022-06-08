import { Action } from "../actions";
import { ActionType } from "../action-types";
import { globalSettings } from "@src/configs";

const INITIAL_STATE = globalSettings.get("LANGUAGE");

const langReducer = (state = INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case ActionType.LANGUAGE:
            return action.payload;
        default:
            return state;
    }
};

export default langReducer;
