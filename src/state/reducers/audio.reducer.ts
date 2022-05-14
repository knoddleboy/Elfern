import { Action } from "../actions";
import { ActionType } from "../action-types";

import TransferStore from "@state/transferStore";

const INITIAL_STATE: boolean = TransferStore.get("ENABLE_AUDIO");

const audioReducer = (state = INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case ActionType.ENABLE_AUDIO:
            TransferStore.send({ audio: !state });
            return !state;
        default:
            return state;
    }
};

export default audioReducer;
