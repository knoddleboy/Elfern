import { Dispatch } from "redux";
import { Action } from "../actions";
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
