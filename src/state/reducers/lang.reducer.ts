import { Action } from "../actions";
import { ActionType } from "../action-types";
import { AvailableCountryCodes } from "@src/types";

import TransferStore from "@state/transferStore";

const INITIAL_STATE: AvailableCountryCodes = TransferStore.get("LANGUAGE") as AvailableCountryCodes;

const langReducer = (state = INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case ActionType.LANGUAGE:
            TransferStore.send({ lang: action.payload });
            return action.payload;
        default:
            return state;
    }
};

export default langReducer;
