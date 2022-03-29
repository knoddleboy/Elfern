import React from "react";

import Sprite from "@assets/images/sprites/sprite.svg";

import "./CardLinker.scss";

enum SuitColors {
    /** Default theme's black color */
    B = "#2f3a58",

    /** Default theme's red color */
    R = "#ef5050",
}

type SizeUnits = `${number}px` | `${number}%`;

interface ICardLinkerProps {
    /** Card suit */
    suit: "clubs" | "diamonds" | "hearts" | "spades";

    /** Card rank */
    rank: "ace" | "king" | "queen" | "jack" | 10 | 9 | 8 | 7;

    /**
     * Set `true` to use _cyrillic_ card theme.
     * @default false
     */
    cyrillic?: boolean;
}

interface ICardDisplayProps {
    /**
     * *--customization prop--*
     *
     * Changes card's background color: `#XXXXXX` or `#XXX`.
     * This is needed when customizing game theme.
     *
     * @default #fff (white)
     */
    cardColor?: `#${string}`;

    /**
     * *--customization prop--*
     *
     * Changes card's inner padding.
     *
     * @default 8px
     */
    cardInnerPadding?: SizeUnits;

    /**
     * Sets width and height to the card component.
     *
     * Notice that `h` is optional so height can be *automatically* calculated.
     *
     * @default "auto"
     */
    cardSize?: {
        /** Card total width */
        w: SizeUnits;

        /** Card total height */
        h?: SizeUnits;
    };

    /**
     * Sets width and height to `rank`, `suit` and `figure`.
     *
     * Notice that `suit` is optional. If it is **not** provided, its value
     * inherits `rank`s one.
     *
     * @default "auto"
     */
    packSizes?: {
        /** Card rank size. Set in `px` or `%`. */
        rank: SizeUnits;

        /** Card suit size. Set in `px` or `%`. */
        suit?: SizeUnits;

        /** Set `adjust` to adjust figure size to rank one. */
        figure: SizeUnits | "adjust";
    };

    /**
     * Pass the _width_ of the element relative to which horizontal gaps in the card
     * will be automatically calculated. In many cases, using a _hook_ is justified.
     */
    // horizontalCardGaps?: number;

    /**
     * Pass the _height_ of the element relative to which horizontal gaps in the card
     * will be automatically calculated. In many cases, using a _hook_ is justified.
     */
    // verticalCardGaps?: number;

    innerGaps?: number;
}

/**
 * Links chosen `rank`, `suit` and `figure` with corresponding props thus
 * forming a independent card component.
 *
 * @returns card component
 */
const CardLinker: React.FC<
    ICardLinkerProps & ICardDisplayProps & React.HTMLAttributes<SVGSVGElement | HTMLDivElement>
> = ({
    suit,
    rank,
    cyrillic,
    cardColor,
    cardInnerPadding,
    cardSize,
    packSizes,
    innerGaps,
    ...otherProps
}) => {
    // Card color based on chosen suit (see below)
    let suitColor: "red" | "black" | undefined;

    /**
     * Set suitColor to either `black` for clubs or spades or `red` for diamonds
     * or hearts. Otherwise – undefined.
     */
    if (suit === "clubs" || suit === "spades") suitColor = "black";
    else if (suit === "diamonds" || suit === "hearts") suitColor = "red";
    else suitColor = undefined;

    // Post-calculated given rank, suit and figure sizes.
    const calculatedProps = {
        /**
         * If `packSizes` provided, set to its value.
         *
         * @otherwise "auto"
         */
        _rank: `${packSizes ? packSizes.rank : "auto"}`,

        /**
         * If `packSizes` provided, set to either `.suit` or `.rank` (based on .suit is provided).
         *
         * This guarantees that omitting `.suit` prop in component will not affect the suit size
         * (because it will inherit rank's one).
         *
         * @otherwise "auto"
         */
        _suit: `${packSizes ? (packSizes.suit ? packSizes.suit : packSizes.rank) : "auto"}`,

        /**
         * If `packSizes` provided, set to
         * - `.rank * adjustParameter` – adjusting relatively rank size
         * (_adjustParameter = 2.8_ here, however is arbitrary);
         * - `.figure` – actual provided figure prop.
         *
         * @otherwise "auto"
         */
        _figure: `${
            packSizes
                ? packSizes.figure === "adjust"
                    ? parseInt(packSizes.rank) * 2.8 + "px"
                    : packSizes.figure
                : "auto"
        }`,
    };

    return (
        <div
            style={{
                backgroundColor: `${cardColor ? cardColor : "#fff"}`,
                width: `${cardSize ? cardSize.w : "auto"}`,
                height: `${cardSize ? cardSize.h : "auto"}`,
                padding: cardInnerPadding ? cardInnerPadding : "8px",
            }}
            {...otherProps}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",

                    marginTop: `${innerGaps ? (innerGaps * 0.7) / 100 + "px" : "auto"}`,
                    marginBottom: `${innerGaps ? (innerGaps * 2.5) / 100 + "px" : "auto"}`,

                    marginLeft: `${innerGaps ? (innerGaps * 0.5) / 100 + "px" : "auto"}`,
                    marginRight: `${innerGaps ? (innerGaps * 0.5) / 100 + "px" : "auto"}`,
                }}
            >
                {/** Renders card's rank */}
                <svg
                    fill={suitColor === "black" ? SuitColors.B : SuitColors.R}
                    style={{
                        maxWidth: calculatedProps._rank,
                        maxHeight: calculatedProps._rank,
                    }}
                >
                    <use
                        href={Sprite + `#${typeof rank === "string" ? rank : "_" + rank}`}
                        width={calculatedProps._rank}
                    />
                </svg>

                {/** Renders card's suit */}
                <svg
                    style={{
                        maxWidth: calculatedProps._suit,
                        maxHeight: calculatedProps._suit,
                    }}
                >
                    <use href={Sprite + `#${suit}`} width={calculatedProps._suit} />
                </svg>
            </div>

            {/** Renders card's rank's figure */}
            <svg
                style={{
                    maxWidth: calculatedProps._figure,
                    height: calculatedProps._figure,
                    margin: `0 ${innerGaps ? (innerGaps * 0.7) / 100 + "px" : "auto"} ${
                        innerGaps ? (innerGaps * 0.2) / 100 + "px" : "0px"
                    }`,
                }}
            >
                <use
                    href={
                        Sprite +
                        `#${
                            rank !== "ace" && typeof rank === "string"
                                ? suitColor + "-" + rank
                                : suit
                        }`
                    }
                    width={calculatedProps._figure}
                />
            </svg>
        </div>
    );
};

export default CardLinker;
