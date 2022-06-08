import { useSelector } from "react-redux";
import { State } from "@state/index";

import { bindKeyValuePairs, DotNotation } from "@utils/utils";
import { LOCALES } from "@src/constants";

const langs = bindKeyValuePairs(Object.keys(LOCALES), [LOCALES.us, LOCALES.ua, LOCALES.de]);

const useTranslation = () => {
    const currentLang = useSelector((state: State) => state.LANGUAGE);

    const t = (key: string) => {
        return DotNotation.getByDotNotation(langs[currentLang] as Record<string, any>, key, true);
    };

    return {
        t: t,
        lang: currentLang,
    };
};

export default useTranslation;
