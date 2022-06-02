import media_click from "@assets/media/switch-on.ogg";
import media_flip from "@assets/media/flip.ogg";
import media_shuffle from "@assets/media/shuffle.ogg";
import switch_on from "@assets/media/switch-on.ogg";
import switch_off from "@assets/media/switch-off.ogg";
import winscreen from "@assets/media/winscreen.ogg";
import losescreen from "@assets/media/losescreen.ogg";
import count_up from "@assets/media/count-up.ogg";

/**
 * Total number of cards in deck (starting from 0).
 * @value 31
 */
export const CARDS_IN_DECK: number = 31;

/**
 * Defines card's aspect ratio (height / width).
 * @value 0.719
 */
export const CARD_ASPECT_RATIO: number = 0.719;

export const APPLICATION_MEDIA = {
    click: media_click,
    flip: media_flip,
    shuffle: media_shuffle,
    switchOn: switch_on,
    switchOff: switch_off,
    winscreen: winscreen,
    losescreen: losescreen,
};

export const availableTranslations = ["us", "ua", "de"] as const;

export const EMOJIS = {
    win: ["🎉", "🥂", "🍕"],
    lose: ["😒", "🤷‍♀️", "😢"],
};

export const DETERMINING_BATCH_WINNER_TIME = 4200;

export const CARDS_WITHOUT_SQUEEZING = 16;

export const NO_CARD_AVAILABLE = -2;
