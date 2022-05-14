import media_click from "@assets/media/plastic-click.ogg";
import media_flip from "@assets/media/flip.ogg";
import media_shuffle from "@assets/media/shuffle.ogg";

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
};

export const availableTranslations = ["us", "ua", "de"] as const;
