import { useSelector } from "react-redux";
import { State } from "@state/index";

import { bindKeyValuePairs, getByDotNotation } from "@utils/utils";
import { availableTranslations } from "@constants/global";

import us from "@assets/locales/us/translation.json";
import ua from "@assets/locales/ua/translation.json";
import de from "@assets/locales/de/translation.json";

const langs = bindKeyValuePairs(availableTranslations, [us, ua, de]);

const useTranslation = () => {
    const currentLang = useSelector((state: State) => state.LANGUAGE);

    const t = (key: string) => {
        return getByDotNotation(langs[currentLang] as Record<string, any>, key, true);
    };

    return {
        t: t,
        lang: currentLang,
    };
};

export default useTranslation;
