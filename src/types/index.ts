import React from "react";
import { TRANSLATION_COUNTRY_CODES } from "@src/constants";

export type ReactSetState = React.Dispatch<React.SetStateAction<boolean>>;

/** Available translations */
export type TTranslationCountryCodes = typeof TRANSLATION_COUNTRY_CODES[number];
