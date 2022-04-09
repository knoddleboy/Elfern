import React, { useState, useRef, useEffect } from "react";

import StartBlinkingTitle from "./StartBlinkingTitle";
import PlayAreaSidebarButtons from "./PlayAreaSidebarButtons";

import CardLinker from "@utils/CardLinker";
import CardLinkerAPI from "@utils/CardLinker/CardLinkerAPI";
import Deck from "@utils/generateDeck";

import useBoundingRect from "@utils/hooks/useBoundingRect";

import { CARDS_IN_DECK } from "@constants/global";

import "./GameInterface.scss";

const CARD_SIZE = 8;
const deck = Deck.createDeck();

// *--Cards Flow Controllers--* //
// Each of above consists card indices (i.e. numbers)
const Stock = [...Array(CARDS_IN_DECK + 1).keys()],
    PlayerHand = new Array<number>(),
    OpponentHand = new Array<number>();

const GameInterface: React.FC = () => {
    // Ref to the game interface (current component)
    const gameInterfaceScreenRef = useRef<HTMLDivElement>(null);

    const stockUnderlay = useRef<HTMLDivElement>(null);

    // Ref to opponent hand area
    const opponentHandRef = useRef<HTMLDivElement>(null);

    // Ref to player hand area
    const playerHandRef = useRef<HTMLDivElement>(null);

    // Game state. Defines when to start dealing cards
    const [gameStartState, setGameStartState] = useState(false);

    const cardLinkerAPI = new CardLinkerAPI(CARD_SIZE, { ref: gameInterfaceScreenRef });

    // Array of refs to each card in stock
    const stockCardsRefs = useRef(new Array<HTMLDivElement>());
    stockCardsRefs.current = [];

    // Populate `stockCardsRefs` with cards
    const addToStockRefs = (currentCard: HTMLDivElement) => {
        if (currentCard && !stockCardsRefs.current.includes(currentCard))
            stockCardsRefs.current.push(currentCard);
    };

    // isShirt values of all cards
    const [shirtStates, setShirtStates] = useState(deck.map(() => true));

    const flipCard = (cardIndex: number) => {
        setShirtStates((prevStates) =>
            prevStates.map((state, i) => {
                return i === cardIndex ? !state : state;
            })
        );
    };

    const placeCardIntoHand = (
        cardsRefs: React.MutableRefObject<HTMLDivElement[]>,
        handRef: React.RefObject<HTMLElement>,
        cardIndex: number
    ) => {
        if (!(cardsRefs.current || handRef.current)) return;

        let currentHand: number[];

        // Move card's index number from stock array to either player or opponent's hand array
        if (handRef === playerHandRef) {
            flipCard(cardIndex);
            PlayerHand.push(cardIndex);
            currentHand = PlayerHand;
        } else {
            OpponentHand.push(cardIndex);
            currentHand = OpponentHand;
        }
        Stock.pop();

        // const squeezeParam = PlayerHand.length <= 5 ? 4 : 6;

        const handRect = handRef.current!.getBoundingClientRect();

        const card = cardsRefs.current[cardIndex],
            cardRect = card.getBoundingClientRect(),
            cardComputedTop = parseFloat(window.getComputedStyle(card).top),
            cardComputedLeft = parseFloat(window.getComputedStyle(card).left);

        // Stick every card to the top of the hand area
        card.style.top = `${cardComputedTop + handRect.y - cardRect.y}px`;

        // Calculate hand area center
        const handCenter =
            cardComputedLeft + handRect.x - cardRect.x + handRect.width / 2 - cardRect.width / 2;

        // Calculate how much current card should move forwards from center
        const currentCardCenterOffset = handCenter + (currentHand.length * cardRect.width) / 4;

        // Place card after previous one and move it backwards half its width (so that it is under previous card)
        card.style.left = `${currentCardCenterOffset}px`;

        // Move all remaining cards backwards
        for (let i = 0; i < currentHand.length; i++) {
            const nextCardInStock = cardsRefs.current[currentHand[i]],
                nextCardInStockComputedLeft = parseFloat(nextCardInStock.style.left);

            nextCardInStock.style.left = `${nextCardInStockComputedLeft - cardRect.width / 4}px`;
        }
    };

    const addCardToPlayerHand = () => {
        placeCardIntoHand(stockCardsRefs, playerHandRef, Stock[Stock.length - 1]);
    };

    const addCardToOpponentHand = () => {
        placeCardIntoHand(stockCardsRefs, opponentHandRef, Stock[Stock.length - 1]);
    };

    useEffect(() => {
        if (gameStartState) {
            for (let i = 31; i >= 26; i--) {
                placeCardIntoHand(stockCardsRefs, playerHandRef, i);
            }
            for (let i = 25; i >= 20; i--) {
                placeCardIntoHand(stockCardsRefs, opponentHandRef, i);
            }
        }
    }, [gameStartState]);

    const handleCardMouseOver = (e: React.MouseEvent<HTMLDivElement>, cardKey?: number) => {
        if (cardKey && verifyCardIsOccupied(cardKey) && e.currentTarget) {
            e.currentTarget.style.transform = "translate(-50%, -60%)";
            return;
        }
        e.currentTarget.style.transform = "translate(-50%, -50%)";
        return;
    };

    const verifyCardIsOccupied = (cardKey: number) => {
        return PlayerHand.includes(cardKey);
    };

    return (
        <div
            className="GameInterface interface--in-animation w-full h-full flex"
            ref={gameInterfaceScreenRef}
            onAnimationEnd={() => {
                gameInterfaceScreenRef.current?.classList.remove("interface--in-animation");
            }}
        >
            <div
                className={`Stock stock--in-animation h-full relative bg-green-light`}
                style={{
                    width: `${CARD_SIZE + 3}%`,
                }}
                ref={stockUnderlay}
                onAnimationEnd={() => {
                    stockUnderlay.current?.classList.remove("stock--in-animation");
                }}
            >
                <div
                    className="absolute bg-green-primary flex-center
                    border-[3px] md:border-4 xl:border-[6px] border-green-400
                    top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{
                        width: cardLinkerAPI.cardWidth,
                        height: cardLinkerAPI.cardHeight,
                        borderRadius: cardLinkerAPI.cardBorderRadius,
                    }}
                >
                    <span id="Stock__underlay" className="text-green-400">
                        E
                    </span>
                </div>
                {deck.map((card, i) => (
                    <CardLinker
                        key={`${card.rank}|${card.suit}`}
                        cardSize={CARD_SIZE}
                        relativeElement={{ ref: gameInterfaceScreenRef }}
                        rank={card.rank}
                        suit={card.suit}
                        shadow={
                            shirtStates[i]
                                ? "0 -1px 2px rgb(0 0 0 / 5%)"
                                : "0px 7px 29px 0px rgba(100, 100, 111, 0.3)"
                        }
                        isShirt={shirtStates[i]}
                        className={`card-${i} absolute`}
                        linkerRef={addToStockRefs}
                        style={{
                            top: 50 + i / 12 + "%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            zIndex: i,
                        }}
                        onMouseEnter={(e) => handleCardMouseOver(e, i)}
                        onMouseLeave={(e) => handleCardMouseOver(e)}
                    />
                ))}
            </div>
            <div
                className={`PlayArea flex-center flex-col flex-grow pb-7`}
                style={{
                    width: `calc(100% - ${CARD_SIZE}% - 3%)`,
                }}
            >
                {!gameStartState ? (
                    <StartBlinkingTitle
                        elementRef={gameInterfaceScreenRef}
                        shouldStartGame={setGameStartState}
                    />
                ) : (
                    <React.Fragment>
                        <div
                            className={`Hand-Opponent w-full relative bg-dark-600`}
                            style={{
                                minHeight: cardLinkerAPI.cardHeight,
                            }}
                            ref={opponentHandRef}
                        ></div>
                        <div
                            className={`Deal w-full flex-center my-[5%] lg:my-[4%]`}
                            style={{
                                minHeight: `calc(${cardLinkerAPI.cardHeight}px + 3%)`,
                            }}
                        >
                            <div
                                className="Deal-Opponent h-full mr-[5%]
                        border-[3px] md:border-4 xl:border-[6px] border-green-light border-dashed"
                                style={{
                                    width: `calc(${cardLinkerAPI.cardWidth}px + 3%)`,
                                    borderRadius: cardLinkerAPI.cardBorderRadius,
                                }}
                                onClick={() => addCardToPlayerHand()}
                            ></div>
                            <div
                                className="Deal-Player h-full ml-[5%]
                        border-[3px] md:border-4 xl:border-[6px] border-green-light border-dashed"
                                style={{
                                    width: `calc(${cardLinkerAPI.cardWidth}px + 3%)`,
                                    borderRadius: cardLinkerAPI.cardBorderRadius,
                                }}
                                onClick={() => addCardToOpponentHand()}
                            ></div>
                        </div>
                        <div
                            className="Hand-Player w-full bg-dark-600"
                            style={{
                                minHeight: cardLinkerAPI.cardHeight,
                            }}
                            ref={playerHandRef}
                        ></div>
                    </React.Fragment>
                )}
                <PlayAreaSidebarButtons />
            </div>
        </div>
    );
};

export default GameInterface;
