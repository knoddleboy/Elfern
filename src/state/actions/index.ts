import { ActionType } from "../action-types";
import { AvailableCountryCodes } from "@src/types";

interface IToggleAudio {
    type: ActionType.ENABLE_AUDIO;
}

export interface ISetTranslation {
    type: ActionType.LANGUAGE;
    payload: AvailableCountryCodes;
}

export interface ISetRoundStats {
    type: ActionType.ROUND_STATS;
    payload: {
        current: number;
        max: number;
    };
}

interface IToggleInitialSetup {
    type: ActionType.IS_INITIAL_SETUP;
}

export interface ISetTimerState {
    type: ActionType.TIMER_STATE;
    payload: {
        time: number;
        start: boolean;
        pause: boolean;
        resume: boolean;
        reset: boolean;
    };
}

export interface ISetCurrentScore {
    type: ActionType.CURRENT_SCORE;
    payload: {
        player: number;
        opponent: number;
    };
}

export type Action =
    | IToggleAudio
    | ISetTranslation
    | ISetRoundStats
    | IToggleInitialSetup
    | ISetTimerState
    | ISetCurrentScore;
