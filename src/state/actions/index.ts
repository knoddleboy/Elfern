import { ActionType } from "../action-types";
import { AvailableCountryCodes } from "@src/types";

interface IToggleAudio {
    type: ActionType.ENABLE_AUDIO;
}

export interface ISetTranslation {
    type: ActionType.LANGUAGE;
    payload: AvailableCountryCodes;
}

export type Action = IToggleAudio | ISetTranslation;
