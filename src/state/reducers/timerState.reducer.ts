import { Action } from "../actions";
import { ActionType } from "../action-types";

import TransferStore from "@state/transferStore";

const INITIAL_STATE = TransferStore.get("TIMER_STATE");

const timerStateReducer = (state = INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case ActionType.TIMER_STATE:
            TransferStore.send({ TIMER_STATE: action.payload });
            return action.payload;
        default:
            return state;
    }
};

export default timerStateReducer;
