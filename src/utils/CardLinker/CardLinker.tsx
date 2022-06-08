import React from "react";

import CardLinkerAPI from "./CardLinkerAPI";
import { ICardDisplayProps, ICardLinkerProps } from "./CardLinker.types";

import Sprite from "@assets/images/sprites/sprite.svg";
import "./CardLinker.scss";

/** Pre-defined black and red colors for game theme. */
enum SuitColors {
    Black = "#2f3a58",
    Red = "#ef5050",
}

/** Card color. Whether _black_ or _red_. Selects based on the provided _suit_ value. */
let suitColor: "red" | "black" | undefined;

/**
 * Links chosen `rank`, `suit` and `figure` with corresponding props and sizes thus
 * forming an independent card component.
 *
 * @returns linked card component
 */
const CardLinker: React.FC<
    ICardLinkerProps &
        ICardDisplayProps &
        React.HTMLAttributes<HTMLDivElement> & {
            linkerRef?: (currentCard: HTMLDivElement) => void;
        }
> = ({
    suit,
    rank,
    cyrillic,
    cardSize,
    relativeElement,
    cardColor,
    shadow,
    isShirt,
    style,
    linkerRef,
    ...otherProps
}) => {
    // Get via api parameters describing a card component
    const cardLinkerAPI = new CardLinkerAPI(cardSize, relativeElement);

    /**
     * Set suitColor to either `black` for clubs or spades or `red` for diamonds
     * or hearts. Otherwise – undefined.
     */
    if (suit === "clubs" || suit === "spades") suitColor = "black";
    else if (suit === "diamonds" || suit === "hearts") suitColor = "red";
    else suitColor = undefined;

    return (
        <div
            id="card-container"
            style={{
                width: cardLinkerAPI.cardWidth,
                height: cardLinkerAPI.cardHeight,
                padding: cardLinkerAPI.cardEdgePadding,
                paddingBottom: cardLinkerAPI.cardFigureBottomIndent,
                borderRadius: cardLinkerAPI.cardBorderRadius,
                backgroundColor: `${cardColor ? cardColor : "#fff"}`,
                boxShadow: shadow ? shadow : "none",
                ...style,
            }}
            {...otherProps}
            ref={linkerRef}
        >
            {/* Render either shirt or card component */}
            {isShirt ? (
                <svg
                    viewBox="0 0 138.71481 200"
                    style={{
                        borderRadius: "inherit",
                    }}
                >
                    <use href={Sprite + "#shirt"} />
                </svg>
            ) : (
                <React.Fragment>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",

                            width: "auto",
                            height: "max-content",
                            flex: 1,

                            marginTop: cardLinkerAPI.cardRankSuitAdjustmentMargins,
                            marginLeft: cardLinkerAPI.cardRankSuitAdjustmentMargins,
                            marginRight: cardLinkerAPI.cardRankSuitAdjustmentMargins,
                        }}
                    >
                        {/* Render card's rank */}
                        <svg
                            fill={suitColor === "black" ? SuitColors.Black : SuitColors.Red}
                            style={{
                                maxWidth: cardLinkerAPI.cardRankSuitSize,
                                maxHeight: cardLinkerAPI.cardRankSuitSize,
                            }}
                        >
                            <use
                                href={
                                    Sprite +
                                    `#${typeof rank === "string" ? (cyrillic ? "cy-" + rank : rank) : "_" + rank}`
                                }
                                width={cardLinkerAPI.cardRankSuitSize}
                            />
                        </svg>

                        {/** Render card's suit */}
                        <svg
                            style={{
                                maxWidth: cardLinkerAPI.cardRankSuitSize,
                                maxHeight: cardLinkerAPI.cardRankSuitSize,
                            }}
                        >
                            <use href={Sprite + `#${suit}`} width={cardLinkerAPI.cardRankSuitSize} />
                        </svg>
                    </div>

                    {/** Render card's rank's figure */}
                    <svg
                        style={{
                            maxWidth: cardLinkerAPI.cardFigureSize,
                            height: cardLinkerAPI.cardFigureSize,
                            margin: "0 auto",
                            transform: `scale(${rank !== "ace" && typeof rank === "string" ? 1 : 0.9})`,
                        }}
                    >
                        <use
                            href={
                                Sprite + `#${rank !== "ace" && typeof rank === "string" ? suitColor + "-" + rank : suit}`
                            }
                        />
                    </svg>
                </React.Fragment>
            )}
        </div>
    );
};

export default CardLinker;
