import { Action } from "../actions";
import { ActionType } from "../action-types";

import TransferStore from "@state/transferStore";

const INITIAL_STATE: boolean = TransferStore.get("INITIAL_SETUP");

const initialSetupReducer = (state = INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case ActionType.IS_INITIAL_SETUP:
            TransferStore.send({ INITIAL_SETUP: !state });
            return !state;
        default:
            return state;
    }
};

export default initialSetupReducer;
