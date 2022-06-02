import { Dispatch } from "redux";
import { Action, ISetRoundStats, ISetTimerState, ISetCurrentScore } from "../actions";
import { ActionType } from "../action-types";
import { AvailableCountryCodes } from "@src/types";

export const toggleAudio = () => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.ENABLE_AUDIO,
        });
    };
};

export const setTranslation = (languageCode: AvailableCountryCodes) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.LANGUAGE,
            payload: languageCode,
        });
    };
};

export const setRoundStats = (roundStats: ISetRoundStats["payload"]) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.ROUND_STATS,
            payload: roundStats,
        });
    };
};

export const toggleInitialSetup = () => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.IS_INITIAL_SETUP,
        });
    };
};

export const setTimerState = (timerState: ISetTimerState["payload"]) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.TIMER_STATE,
            payload: timerState,
        });
    };
};

export const setCurrentScore = (currentScore: ISetCurrentScore["payload"]) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.CURRENT_SCORE,
            payload: currentScore,
        });
    };
};
