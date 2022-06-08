import { Dispatch } from "redux";
import { Action, ISetTranslation, ISetStoreSessionSignal, ISetProgress, ISetStats } from "../actions";
import { ActionType } from "../action-types";

export const toggleAudio = (state?: boolean) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.ENABLE_AUDIO,
            payload: state,
        });
    };
};

export const setTranslation = (languageCode: ISetTranslation["payload"]) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.LANGUAGE,
            payload: languageCode,
        });
    };
};

export const toggleInitialSetup = (state?: boolean) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.IS_INITIAL_SETUP,
            payload: state,
        });
    };
};

export const setStoreSessionSignal = (session: ISetStoreSessionSignal["payload"]) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.STORE_SESSION_SIGNAL,
            payload: session,
        });
    };
};

export const setProgress = (progress: ISetProgress["payload"]) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.PROGRESS,
            payload: progress,
        });
    };
};

export const setStats = (stats: ISetStats["payload"]) => {
    return (dispatch: Dispatch<Action>) => {
        dispatch({
            type: ActionType.STATS,
            payload: stats,
        });
    };
};
