// Locales
import locale_us from "@assets/locales/us/translation.json";
import locale_ua from "@assets/locales/ua/translation.json";
import locale_de from "@assets/locales/de/translation.json";

// Rules
import rules_us from "@assets/locales/us/rules.md";
import rules_ua from "@assets/locales/ua/rules.md";
import rules_de from "@assets/locales/de/rules.md";

// Audio
import media_click from "@assets/media/switch-on.ogg";
import media_flip from "@assets/media/flip.ogg";
import media_shuffle from "@assets/media/shuffle.ogg";
import switch_on from "@assets/media/switch-on.ogg";
import switch_off from "@assets/media/switch-off.ogg";
import winscreen from "@assets/media/winscreen.ogg";
import losescreen from "@assets/media/losescreen.ogg";

/** All available translations */
export const LOCALES = {
    us: locale_us,
    ua: locale_ua,
    de: locale_de,
};

/** Rules, translated into available languages */
export const RULES = {
    us: rules_us,
    ua: rules_ua,
    de: rules_de,
};

/** Translation country codes */
export const TRANSLATION_COUNTRY_CODES = Object.keys(LOCALES) as unknown as Readonly<Array<keyof typeof LOCALES>>;

/** Paths to application media */
export const APPLICATION_MEDIA = {
    click: media_click,
    flip: media_flip,
    shuffle: media_shuffle,
    switchOn: switch_on,
    switchOff: switch_off,
    winscreen: winscreen,
    losescreen: losescreen,
};

/** Total number of cards in deck (starting from 0) */
export const CARDS_IN_DECK: number = 31;

/** Defines card's aspect ratio (height / width). */
export const CARD_ASPECT_RATIO: number = 0.719;

/** Defines how many cards can fit in a hand without overflowing it */
export const CARDS_WITHOUT_SQUEEZING = 20;

/** How many cards will be expanded when hovering on a card in a hand */
export const CARDS_IN_EXPAND_NUMBER = 3;

/** No cards available signal */
export const NO_CARD_AVAILABLE = -2;

/** Once this time has elapsed, batch dealer is determined  */
export const DETERMINING_BATCH_WINNER_TIME = 4200;

/** Time after which the alert disappears */
export const ALERT_VISIBLE_TIME = 2000;

/** Delay for the card flip sound */
export const CARD_FLIP_SOUND_DELAY = 250;

/** Once this time has elapsed, scoring window appears */
export const SHOW_SCORING_WIN_DELAY = 3000;

/** Once this time has elapsed, cards leave the deal area */
export const CARDS_IN_DEAL_DURATION = 2500;

/** Once this time has elapsed, the batch dealer and playerCanMove are set for the next use */
export const DEFINE_WINNING_SIDE_CLEARING = 1500;

/** Once this time has elapsed, cards from stock are dealt for each side */
export const ADD_CARDS_FROM_STOCK_DELAY = 1200;

/** Duration of the dialog window's fade out animation */
export const DIALOG_FADEOUT_ANIMATION_DURATION = 300;

/** Emojis to display in final window (chosen randomly) */
export const EMOJIS = {
    win: ["🎉", "🥂", "🍕"],
    lose: ["😒", "🤷‍♀️", "😢"],
};
