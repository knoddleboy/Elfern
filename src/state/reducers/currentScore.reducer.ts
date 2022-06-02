import { Action } from "../actions";
import { ActionType } from "../action-types";

import TransferStore from "@state/transferStore";

const INITIAL_STATE = TransferStore.get("CURRENT_SCORE");

const currentScoreReducer = (state = INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case ActionType.CURRENT_SCORE:
            TransferStore.send({ CURRENT_SCORE: action.payload });
            return action.payload;
        default:
            return state;
    }
};

export default currentScoreReducer;
