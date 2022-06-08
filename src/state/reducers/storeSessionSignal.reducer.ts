import { Action } from "../actions";
import { ActionType } from "../action-types";

const INITIAL_STATE: boolean = false;

const storeSessionSignalReducer = (state = INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case ActionType.STORE_SESSION_SIGNAL:
            return action.payload;
        default:
            return state;
    }
};

export default storeSessionSignalReducer;
