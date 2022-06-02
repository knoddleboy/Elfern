import { ModelHEX, ModelRGB, ModelRGBA } from "@src/types";

export const SUITS = [7, 8, 9, 10, "jack", "queen", "king", "ace"] as const;
export const RANKS = ["clubs", "diamonds", "hearts", "spades"] as const;

export type CardRank = typeof SUITS[number];
export type CardSuit = typeof RANKS[number];

export interface ICardLinkerProps {
    /** Defines card suit to be displayed */
    suit?: CardSuit;

    /** Defines card rank to be displayed */
    rank?: CardRank;

    /**
     * *--customization prop--*
     *
     * Set `true` to use _cyrillic_ card theme.
     * @default false
     */
    cyrillic?: boolean;
}

export interface ICardDisplayProps {
    /**
     * Defines card's width and height.
     *
     * Specify a _percentage_ of `ref` to calculate sizes relative to ref's sizes.
     */
    cardSize: number;

    /**
     * Provide `ref` element to calculate **card size** relatively to one (i.e. card is responsive).
     */
    relativeElement: {
        ref: React.RefObject<HTMLElement>;
    };

    /**
     * *--customization prop--*
     *
     * Changes card's background color. This is needed when customizing game theme.
     *
     * @default #fff (white)
     */
    cardColor?: ModelHEX | ModelRGB | ModelRGBA;

    /**
     * *--customization prop--*
     *
     * Sets box-shadow on a card.
     *
     * @default false
     */
    shadow?: string;

    /**
     * Defines whether a card component should be a shirt or not.
     *
     * @default false
     */
    isShirt?: boolean;
}

export interface ICardComponentParameters {
    /** Card component width. */
    readonly cardWidth: number;

    /** Card component height. */
    readonly cardHeight: number;

    /** Represents sizes of both `rank` and `suit` elements as their sizes should be the same. */
    readonly cardRankSuitSize: number;

    /** Represents _top, left and right_ margins of rank and suit block. */
    readonly cardRankSuitAdjustmentMargins: number;

    /** Size of card's figure. */
    readonly cardFigureSize: number;

    /** Card's figure bottom margin. */
    readonly cardFigureBottomIndent: number;

    /** Card component edge padding. */
    readonly cardEdgePadding: number;

    /** Card component border radius. */
    readonly cardBorderRadius: number;
}
