import { ActionType } from "../action-types";
import { IGlobalSettingsDefaults, IActiveSessionDefaults } from "@src/configs/types";

export interface IToggleAudio {
    type: ActionType.ENABLE_AUDIO;
    payload?: boolean;
}

export interface ISetTranslation {
    type: ActionType.LANGUAGE;
    payload: IGlobalSettingsDefaults["LANGUAGE"];
}

export interface IToggleInitialSetup {
    type: ActionType.IS_INITIAL_SETUP;
    payload?: boolean;
}

export interface ISetStoreSessionSignal {
    type: ActionType.STORE_SESSION_SIGNAL;
    payload: boolean;
}

export interface ISetProgress {
    type: ActionType.PROGRESS;
    payload: IActiveSessionDefaults["PROGRESS"];
}

export interface ISetStats {
    type: ActionType.STATS;
    payload: IActiveSessionDefaults["STATS"];
}

export type Action =
    | IToggleAudio
    | ISetTranslation
    | IToggleInitialSetup
    | ISetStoreSessionSignal
    | ISetProgress
    | ISetStats;
