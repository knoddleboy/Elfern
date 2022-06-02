import { Action, ISetRoundStats } from "../actions";
import { ActionType } from "../action-types";

import TransferStore from "@state/transferStore";

const INITIAL_STATE: ISetRoundStats["payload"] = TransferStore.get("ROUND_STATS");

const roundStatsReducer = (state = INITIAL_STATE, action: Action) => {
    switch (action.type) {
        case ActionType.ROUND_STATS:
            TransferStore.send({ ROUND_STATS: action.payload });
            return action.payload;
        default:
            return state;
    }
};

export default roundStatsReducer;
