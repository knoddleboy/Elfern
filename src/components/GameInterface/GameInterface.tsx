import React, { useState, useRef, useEffect } from "react";

import StartBlinkingTitle from "./StartBlinkingTitle";
import PlayAreaSidebarButtons from "./PlayAreaSidebarButtons";
import SettingsButton from "@components/Sidebar/SettingsButton";

import CardLinker from "@utils/CardLinker";
import CardLinkerAPI from "@utils/CardLinker/CardLinkerAPI";
import Deck from "@utils/generateDeck";

import useTranslation from "@utils/hooks/useTranslation";
import useAudio from "@utils/hooks/useAudio";
import useBoundingRect from "@utils/hooks/useBoundingRect";

import _ from "@utils/_";
import { getTranslateValues } from "@utils/utils";

import { CARDS_IN_DECK, APPLICATION_MEDIA } from "@constants/global";

import "./GameInterface.scss";

const CARD_SIZE = 8;
let deck = Deck.createDeck();

// Each of above consists card indices (i.e. numbers)
const holder = {
    stock: [...Array(CARDS_IN_DECK + 1).keys()],
    player: new Array<number>(),
    opponent: new Array<number>(),
    deal: -1,
};

// const cardsTranslateX: { [key: number]: number } = {};
const cardsRawTranslateX: { [key: number]: { per: string; num: string } } = {};

const GameInterface: React.FC = () => {
    // Game reset state
    const [gameResetState, setGameResetState] = useState(false);

    // Ref to the game interface (current component)
    const gameInterfaceScreenRef = useRef<HTMLDivElement>(null);

    // Ref to the stock
    const stockRef = useRef<HTMLDivElement>(null);

    // Ref to the opponent hand area
    const opponentHandRef = useRef<HTMLDivElement>(null);

    // Ref to the player hand area
    const playerHandRef = useRef<HTMLDivElement>(null);

    // Ref to the player deal place
    const playerDealRef = useRef<HTMLDivElement>(null);

    // Ref to the opponent deal place
    const opponentDealRef = useRef<HTMLDivElement>(null);

    // State that defines when to start dealing cards
    const [gameStartState, setGameStartState] = useState(false);

    const cardLinkerAPI = new CardLinkerAPI(CARD_SIZE, { ref: gameInterfaceScreenRef });

    const { t, lang } = useTranslation();

    const [toggleShuffleSound] = useAudio(APPLICATION_MEDIA.shuffle);

    // Array of refs to each card in the stock
    const stockCardsRefs = useRef(new Array<HTMLDivElement>());
    stockCardsRefs.current = [];

    // Populate `stockCardsRefs` with cards
    const addToStockRefs = (currentCard: HTMLDivElement) => {
        if (currentCard && !stockCardsRefs.current.includes(currentCard)) stockCardsRefs.current.push(currentCard);
    };

    // Whether cursor with a card entered player deal area
    const [cardToDeal, setCardToDeal] = useState<{
        idx: number;
        origin: Exclude<keyof typeof holder, "stock" | "deal">;
    } | null>(null);

    // Any time when card falls into deal area (thus cardToDeal changes), remove it from the origin hand
    useEffect(() => {
        if (!cardToDeal) return;
        if (cardToDeal.origin === "player") {
            // holder.player = _.remove(holder.player, cardToDeal.idx);
            holder.player[holder.player.indexOf(cardToDeal.idx)] = -1;
        } else if (cardToDeal.origin === "opponent") {
            // holder.opponent = _.remove(holder.opponent, cardToDeal.idx);
            holder.opponent[holder.opponent.indexOf(cardToDeal.idx)] = -1;
        }
        holder.deal = cardToDeal.idx;
        stockCardsRefs.current[cardToDeal.idx].style.cursor = "default";
    }, [cardToDeal]);

    // isShirt values of all cards
    const [shirtStates, setShirtStates] = useState(deck.map(() => true));

    const flipCard = (cardIndex: number) => {
        setShirtStates((prevStates) =>
            prevStates.map((state, i) => {
                return i === cardIndex ? !state : state;
            })
        );
    };

    const ref = useRef(holder);

    // useEffect(() => {
    //     console.log(ref.current);
    // }, [ref.current]);

    // Since holder is a global variable, we cannot react on its change in useEffect,
    // so we create a separate state handOverflow, that holds the number of cards in a player hand.
    // And when handOverflow actually overflows the crucial number of cards in the hand
    // (here crucial number is the number of cards, that can fit in the hand without overflowing it),
    // we react on that and squeeze cards.
    const [handOverflow, setHandOverflow] = useState({
        player: 0,
        opponent: 0,
    });

    const placeCardIntoHand = (
        cardsRefs: React.MutableRefObject<HTMLDivElement[]>,
        handRef: React.RefObject<HTMLElement>,
        cardIndex: number
    ) => {
        if (holder.stock.length === 0) {
            console.warn("⚠ The Card Stock is empty.");
            return;
        }

        if (!(cardsRefs.current || handRef.current)) return;

        let currentHand: number[];

        // Move card's index number from stock array to either player or opponent's hand array
        if (handRef === playerHandRef) {
            flipCard(cardIndex);
            holder.player.push(cardIndex);
            currentHand = holder.player;

            setHandOverflow((prevState) => ({
                ...prevState,
                player: prevState.player + 1,
            }));
        } else {
            holder.opponent.push(cardIndex);
            currentHand = holder.opponent;

            setHandOverflow((prevState) => ({
                ...prevState,
                opponent: prevState.opponent + 1,
            }));
        }
        holder.stock.pop();

        // const squeezeParam = currentHand.length >= 16 ? 12 : 4;

        const handRect = handRef.current!.getBoundingClientRect();

        const card = cardsRefs.current[cardIndex],
            cardRect = card.getBoundingClientRect(),
            cardComputedTop = parseFloat(window.getComputedStyle(card).top),
            cardComputedLeft = parseFloat(window.getComputedStyle(card).left);

        // We can change haw cards overlay on each other by setting their zIndex as shown below:
        card.style.zIndex = `${31 - cardIndex}`;

        // Stick every card to the top of the hand area
        card.style.top = `${_.toFixed(cardComputedTop + handRect.y - cardRect.y, 2)}px`;

        // Calculate hand area center
        const handCenter = cardComputedLeft + handRect.x - cardRect.x + handRect.width / 2 - cardRect.width / 2;

        // Calculate how much current card should move forwards from center
        const currentCardCenterOffset = handCenter + (currentHand.length * cardRect.width) / 4;

        // Place card after previous one and move it backwards half its width (so that it is under previous card)
        card.style.left = `${currentCardCenterOffset}px`;

        // Move all remaining cards backwards
        for (let i = 0; i < currentHand.length; i++) {
            const prevCardInHand = cardsRefs.current[currentHand[i]],
                prevCardInHandComputedLeft = parseFloat(prevCardInHand.style.left);

            prevCardInHand.style.left = `${
                prevCardInHandComputedLeft - cardRect.width / (currentHand.length < 16 ? 4 : 5)
            }px`;
        }

        // cardsTranslateX[cardIndex] = getTranslateValues(card)!.x;
        cardsRawTranslateX[cardIndex] = {
            per: "-50%",
            num: "0",
        };

        // TODO: fix some issues when squeezing the hand
        // Squeeze cards in a hand after the 16th card received
        // if (currentHand.length === 16) {
        //     const middleCardIdx = Math.floor((currentHand.length - 1) / 2);

        //     for (let i = middleCardIdx - 1, q = 1; i >= 0; i--, q++) {
        //         const card = cardsRefs.current[currentHand[i]];
        //         const prevLeft = card.offsetLeft;
        //         // card.style.left = `${prevLeft + (q * card.offsetWidth) / 10}px`;
        //         card.style.transform = `translate3d(calc(-50% + ${(q * card.offsetWidth) / 10}px), -50%, 0)`;
        //     }

        //     for (let i = middleCardIdx + 1, q = 1; i < currentHand.length - 1; i++, q++) {
        //         const card = cardsRefs.current[currentHand[i]];
        //         const prevLeft = card.offsetLeft;
        //         // card.style.left = `${prevLeft - (q * card.offsetWidth) / 10}px`;
        //         card.style.transform = `translate3d(calc(-50% - ${(q * card.offsetWidth) / 10}px), -50%, 0)`;
        //     }
        // } else {
        //     for (let i = 0; i < currentHand.length; i++) {
        //         const card = cardsRefs.current[currentHand[i]];
        //         card.style.transform = `translate3d(-50%, -50%, 0)`;
        //     }
        // }

        // if (currentHand.length >= 16) {
        //     console.log(currentHand.length);

        //     card.style.transform = `translate3d(calc(-50% - ${
        //         ((currentHand.length / 2) * card.offsetWidth) / 10
        //     }px), -50%, 0)`;
        // } else {
        //     card.style.transform = `translate3d(-50%, -50%, 0)`;
        // }

        // if (currentHand.length === 16) {
        //     for (let l = Math.floor(currentHand.length / 2), idx = 0; l >= 0; l--, idx++) {
        //         const currentCard = cardsRefs.current[currentHand[l]],
        //             currentCardLeft = parseFloat(currentCard.style.left);
        //         currentCard.style.left = `${
        //             currentCardLeft + (idx * cardRect.width) / squeezeParam
        //         }px`;
        //     }

        //     for (
        //         let r = Math.floor(currentHand.length / 2), idx = 0;
        //         r <= currentHand.length - 1;
        //         r++, idx++
        //     ) {
        //         const currentCard = cardsRefs.current[currentHand[r]],
        //             currentCardLeft = parseFloat(currentCard.style.left);
        //         currentCard.style.left = `${
        //             currentCardLeft - (idx * cardRect.width) / squeezeParam
        //         }px`;
        //     }
        // }
    };

    const wasSqueezed = useRef(false);
    useEffect(() => {
        // console.log(handOverflow);

        // if (handOverflow.player === 17) {
        //     const handCards = holder.player;
        //     const stock = stockCardsRefs.current;

        //     const middleCardIdx = Math.floor((handCards.length - 1) / 2);

        //     // for (let i = middleCardIdx, q = 1; i >= 0; i--, q++) {
        //     //     const card = stock[handCards[i]];
        //     //     const prevLeft = card.offsetLeft;
        //     //     card.style.left = `${prevLeft + (q * card.offsetWidth) / 8}px`;
        //     // }

        //     // for (let i = middleCardIdx + 1, q = 1; i < handCards.length - 1; i++, q++) {
        //     //     const card = stock[handCards[i]];
        //     //     const prevLeft = card.offsetLeft;
        //     //     card.style.left = `${prevLeft - (q * card.offsetWidth) / 8}px`;
        //     // }

        //     for (let i = handCards.length - 3, q = 1; i >= 0; i--, q++) {
        //         const card = stock[handCards[i]];
        //         const prevLeft = card.offsetLeft;
        //         card.style.left = `${prevLeft + (q * card.offsetWidth) / 10}px`;
        //     }

        //     // for (let i = middleCardIdx + 1; i < handCards.length; i++) {
        //     //     const cardIdx = handCards[i];
        //     //     const prevLeft = stock[cardIdx].offsetLeft;
        //     //     stock[cardIdx].style.left = `${prevLeft - stock[cardIdx].offsetWidth / 5}px`;
        //     // }
        // }

        const currentHand = holder.player;
        // Squeeze all the cards available in a hand
        if (handOverflow.player === 16) {
            const middleCardIdx = Math.floor((currentHand.length - 1) / 2);

            for (let i = middleCardIdx - 1, q = 1; i >= 0; i--, q++) {
                const card = stockCardsRefs.current[currentHand[i]];
                card.style.transform = `translate3d(calc(-50% + ${(q * card.offsetWidth) / 10}px), -50%, 0)`;

                // setTimeout(() => (cardsTranslateX[currentHand[i]] = getTranslateValues(card)!.x), 500);
                cardsRawTranslateX[currentHand[i]] = {
                    per: "-50%",
                    num: `${(q * card.offsetWidth) / 10}`,
                };
            }

            for (let i = middleCardIdx + 1, q = 1; i < currentHand.length; i++, q++) {
                const card = stockCardsRefs.current[currentHand[i]];
                card.style.transform = `translate3d(calc(-50% - ${(q * card.offsetWidth) / 10}px), -50%, 0)`;

                // setTimeout(() => (cardsTranslateX[currentHand[i]] = getTranslateValues(card)!.x), 500);
                cardsRawTranslateX[currentHand[i]] = {
                    per: "-50%",
                    num: `${-(q * card.offsetWidth) / 10}`,
                };
            }

            wasSqueezed.current = true;
        } else if (wasSqueezed.current && handOverflow.player < 16) {
            for (let i = 0; i < currentHand.length; i++) {
                const card = stockCardsRefs.current[currentHand[i]];
                card.style.transform = `translate3d(-50%, -50%, 0)`;

                // cardsTranslateX[currentHand[i]] = getTranslateValues(card)!.x;
                cardsRawTranslateX[currentHand[i]] = {
                    per: "-50%",
                    num: "0",
                };
            }
            wasSqueezed.current = false;
        }

        // Continue squeezing each next card while overflowed
        const lastEntryCardIndex = currentHand[currentHand.length - 1];
        const lastEntryCard = stockCardsRefs.current[lastEntryCardIndex];

        if (currentHand.length >= 16) {
            const offset = ((currentHand.length / 2) * lastEntryCard.offsetWidth) / 10;
            lastEntryCard.style.transform = `translate3d(calc(-50% - ${offset}px), -50%, 0)`;
            cardsRawTranslateX[lastEntryCardIndex] = {
                per: "-50%",
                num: `${-offset}`,
            };
        } else if (lastEntryCard) {
            lastEntryCard.style.transform = `translate3d(-50%, -50%, 0)`;
            cardsRawTranslateX[lastEntryCardIndex] = {
                per: "-50%",
                num: "0",
            };
        }
    }, [handOverflow]);

    // Move cards in a hand when any card goes in a deal
    useEffect(() => {
        if (!cardToDeal) return; // return if unset

        const [currentHand, handCards] =
            cardToDeal.origin === "player"
                ? [playerHandRef.current, holder.player]
                : [opponentHandRef.current, holder.opponent];
        if (!currentHand) return;

        const stock = stockCardsRefs.current;

        console.log(handCards);

        for (let i = handCards.indexOf(-1) - 1; i >= 0; i--) {
            const card = stock[handCards[i]];
            const prevLeft = card.offsetLeft;

            card.style.left = `${prevLeft + card.offsetWidth / 4}px`;

            // Sometimes when a card goes to a deal, the mouseLeave function does not executes thus the resets in
            // this function dows not strike. To address this issue we reset the transform here as well.
            card.style.transform = `translate3d(calc(${cardsRawTranslateX[holder.player[i]].per} + ${
                cardsRawTranslateX[holder.player[i]].num
            }px), -50%, 0)`;
        }

        for (let i = handCards.indexOf(-1) + 1; i < handCards.length; i++) {
            const card = stock[handCards[i]];
            const prevLeft = card.offsetLeft;

            card.style.left = `${prevLeft - card.offsetWidth / 4}px`;

            // Sometimes when a card goes to a deal, the mouseLeave function does not executes thus the resets in
            // this function dows not strike. To address this issue we reset the transform here as well.
            card.style.transform = `translate3d(calc(${cardsRawTranslateX[holder.player[i]].per} + ${
                cardsRawTranslateX[holder.player[i]].num
            }px), -50%, 0)`;
        }
    }, [cardToDeal]);

    const addCardToPlayerHand = () => () => {
        placeCardIntoHand(stockCardsRefs, playerHandRef, holder.stock[holder.stock.length - 1]);
        console.log(holder);
    };

    const addCardToOpponentHand = () => () => {
        placeCardIntoHand(stockCardsRefs, opponentHandRef, holder.stock[holder.stock.length - 1]);
    };

    useEffect(() => {
        if (gameStartState) {
            // Deal the last 6 cards (counting from the top of the deck) to the player
            for (let i = 31; i >= 26; i--) {
                placeCardIntoHand(stockCardsRefs, playerHandRef, i);
            }
            // Deal next 6 cards to the opponent
            for (let i = 25; i >= 20; i--) {
                placeCardIntoHand(stockCardsRefs, opponentHandRef, i);
            }
            // setTimeout(() => toggleShuffleSound(), 200);
        }
    }, [gameStartState]); // Execute only once i.e. when game starts (thus dealing first six cards)

    // React to gameResetState to reset the game
    useEffect(() => {
        // Toggle game start screen
        if (gameStartState) setGameStartState((prevState) => !prevState);

        if (!(gameInterfaceScreenRef.current || stockRef.current)) return;

        // Append animations
        gameInterfaceScreenRef.current?.classList.add("GameInterface--in-animation");
        stockRef.current?.classList.add("Stock--in-animation");

        // Reset holder
        holder.stock = [...Array(CARDS_IN_DECK + 1).keys()];
        holder.player.length = 0;
        holder.opponent.length = 0;

        // Set default cards' position
        if (!stockCardsRefs.current) return;
        stockCardsRefs.current.forEach((card, idx) => {
            card.style.top = 50 + idx / 12 + "%";
            card.style.left = "50%";
            card.style.transform = "translate3d(-50%, -50%, 0)";
            card.style.zIndex = `${idx}`;
        });

        // Update all cards to be facedown: isShirt={true}
        setShirtStates((prevStates) => prevStates.fill(true));

        // Reset all the card moving properties
        setCardMoveState({
            cardIndex: null,
            mouse: [0, 0],
            initialPos: {
                top: null,
                left: null,
            },
            playerHandOrigin: true,
            isPressed: false,
        });

        // Reset to null to be sure that any card (that was in a deal) can be moved again
        setCardToDeal(null);

        // Regenerate the deck
        deck = Deck.createDeck();
    }, [gameResetState]); // No need to include gameStartState as it would re-render the game start state

    //*     MOVING CARDS    *//

    // How many cards will be expanded on hover
    const numberOfCardInExpand = 2;

    // .The value of expanding
    const expandingValue = handOverflow.player < 16 ? 1.62 : 2;

    const handleCardMouseOver = (e: React.MouseEvent<HTMLDivElement>, cardIndex: number) => {
        if (!(cardIndex && verifyCardIsOccupied(cardIndex) && e.currentTarget)) return;
        // e.currentTarget.style.transform = `translate3d(${cardsTranslateX[cardIndex]}px, -60%, 0)`;
        e.currentTarget.style.transform = `translate3d(calc(${cardsRawTranslateX[cardIndex].per} + ${cardsRawTranslateX[cardIndex].num}px), -60%, 0)`;
        e.currentTarget.style.cursor = "grab";

        const _cardIdxInHand = holder.player.indexOf(cardIndex); //* <------ use here var. currentHand

        // If current card is the edge one - skip the expanding
        if (holder.player.indexOf(cardIndex) === holder.player.length - 1) return;

        //* EXPAND CARDS ON HOVER *//

        // Expands left hand side
        for (let i = _cardIdxInHand - 1, e = expandingValue; i >= _cardIdxInHand - numberOfCardInExpand; i--, e++) {
            const card = stockCardsRefs.current[holder.player[i]];
            if (!card) break;

            // const trn = getTranslateValues(card);

            // card.style.transform = `translate3d(calc(-50% - ${card.offsetWidth / 2 ** e}px), -50%, 0)`;
            // card.style.transform = `translate3d(${
            //     cardsTranslateX[holder.player[i]] - card.offsetWidth / 2 ** e
            // }px, -50%, 0)`;
            card.style.transform = `translate3d(calc(${cardsRawTranslateX[holder.player[i]].per} + ${
                cardsRawTranslateX[holder.player[i]].num
            }px - ${card.offsetWidth / 2 ** e}px), -50%, 0)`;
        }

        // Expands right hand side
        for (let i = _cardIdxInHand + 1, e = expandingValue; i <= _cardIdxInHand + numberOfCardInExpand; i++, e++) {
            const card = stockCardsRefs.current[holder.player[i]];
            if (!card) break;

            // const trn = getTranslateValues(card);

            // card.style.transform = `translate3d(calc(-50% + ${card.offsetWidth / 2 ** e}px), -50%, 0)`;
            // card.style.transform = `translate3d(${
            //     cardsTranslateX[holder.player[i]] + card.offsetWidth / 2 ** e
            // }px, -50%, 0)`;
            card.style.transform = `translate3d(calc(${cardsRawTranslateX[holder.player[i]].per} + ${
                cardsRawTranslateX[holder.player[i]].num
            }px + ${card.offsetWidth / 2 ** e}px), -50%, 0)`;
        }

        // console.log(cardsRawTranslateX);
    };

    const handleCardMouseOut = (e: React.MouseEvent<HTMLDivElement>, cardIndex: number) => {
        if (!(cardIndex && verifyCardIsOccupied(cardIndex) && e.currentTarget)) return;

        // e.currentTarget.style.transform = `translate3d(${cardsTranslateX[cardIndex]}px, -50%, 0)`;
        e.currentTarget.style.transform = `translate3d(calc(${cardsRawTranslateX[cardIndex].per} + ${cardsRawTranslateX[cardIndex].num}px), -50%, 0)`;

        const _cardIdxInHand = holder.player.indexOf(cardIndex); //* <------ and here...

        // If current card is the edge one - skip the constriction
        if (holder.player.indexOf(cardIndex) === holder.player.length - 1) return;

        // Reset expanding of the left hand side
        for (let i = _cardIdxInHand - 1, e = expandingValue; i >= _cardIdxInHand - numberOfCardInExpand; i--, e++) {
            const card = stockCardsRefs.current[holder.player[i]];
            if (!card) continue;

            // card.style.transform = `translate3d(${cardsTranslateX[holder.player[i]]}px, -50%, 0)`;
            card.style.transform = `translate3d(calc(${cardsRawTranslateX[holder.player[i]].per} + ${
                cardsRawTranslateX[holder.player[i]].num
            }px), -50%, 0)`;
        }

        // Reset expanding of the right hand side
        for (let i = _cardIdxInHand + 1, e = expandingValue; i <= _cardIdxInHand + numberOfCardInExpand; i++, e++) {
            const card = stockCardsRefs.current[holder.player[i]];
            if (!card) continue;

            // card.style.transform = `translate3d(${cardsTranslateX[holder.player[i]]}px, -50%, 0)`;
            card.style.transform = `translate3d(calc(${cardsRawTranslateX[holder.player[i]].per} + ${
                cardsRawTranslateX[holder.player[i]].num
            }px), -50%, 0)`;
        }
    };

    interface ICardMoveState {
        cardIndex: number | null;
        mouse: number[];
        initialPos: {
            top: string | null;
            left: string | null;
        };
        playerHandOrigin: boolean;
        isPressed: boolean;
    }

    const [cardMoveState, setCardMoveState] = useState<ICardMoveState>({
        cardIndex: null,
        mouse: [0, 0],
        initialPos: {
            top: null,
            left: null,
        },
        playerHandOrigin: true,
        isPressed: false,
    });

    const handleCardMouseDown = ([clientX, clientY]: [number, number], cardIndex: number) => {
        // Check if the clicked card is player's one and there is no card in a deal
        if (!(verifyCardIsOccupied(cardIndex) && !cardToDeal)) return;

        const currentCard = stockCardsRefs.current[cardIndex];

        currentCard.classList.add("card-active");

        setCardMoveState({
            cardIndex: cardIndex,
            mouse: [clientX, clientY],
            initialPos: {
                top: `${currentCard.offsetTop - 0.1}px`, // Seems like there is some sort of shift down when a card goes
                left: `${currentCard.offsetLeft}px`, // back, so i decided to move it 0.1px up to correct that behavior
            },
            playerHandOrigin: verifyCardIsOccupied(cardIndex),
            isPressed: true,
        });
    };

    /**
     * Detects whether the `element` entered the `region` viewport.
     * @param expand - Defines the expand of the region (in px), where collision starts to be detected.
     */
    const detectCollision = (element: HTMLElement, region: HTMLElement, expand: number = 0) => {
        const elementRect = element.getBoundingClientRect(),
            regionRect = region.getBoundingClientRect();

        return !(
            elementRect.y + elementRect.height < regionRect.y + expand ||
            elementRect.y > regionRect.y + regionRect.height - expand ||
            elementRect.x + elementRect.width < regionRect.x + expand ||
            elementRect.x > regionRect.x + regionRect.width - expand
        );
    };

    useEffect(() => {
        const handleCardMouseMove = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
            // Prevent from handling a card move if the card is in the deal area
            if (cardToDeal) return;

            const {
                cardIndex,
                mouse: [x, y],
            } = cardMoveState;

            if (!cardIndex) return;

            const topOffset = y - clientY,
                leftOffset = x - clientX;

            setCardMoveState((prevState) => ({
                ...prevState,
                mouse: [clientX, clientY],
            }));

            // TODO: activate
            // if (playerDealRef.current) playerDealRef.current.classList.add("deal-active");

            const currentCard = stockCardsRefs.current[cardIndex];
            const playerDeal = playerDealRef.current;
            const gameInterfaceScreen = gameInterfaceScreenRef.current;

            if (!(currentCard && playerDeal && gameInterfaceScreen)) return;

            const playerDealTop = playerDeal.getBoundingClientRect().top,
                gameInterfaceTop = gameInterfaceScreen.getBoundingClientRect().top;

            // When card enters a dealing area, place it inside the area
            if (detectCollision(currentCard, playerDeal, 50)) {
                setCardToDeal({
                    idx: cardIndex!,
                    origin: "player",
                });

                handleCardMouseUp();

                // currentCard.style.transform = `translate3d(calc(${cardsRawTranslateX[cardIndex].per} + ${cardsRawTranslateX[cardIndex].num}px), -50%, 0)`;
                currentCard.style.transform = `translate3d(-50%, -50%, 0)`;

                // Place card int the center of the player deal area
                currentCard.style.top = `${playerDealTop - gameInterfaceTop + playerDeal.offsetHeight / 2}px`;
                currentCard.style.left = `${playerDeal.offsetLeft + playerDeal.offsetWidth / 2}px`;

                return;
            }

            currentCard.style.top = `${currentCard.offsetTop - topOffset}px`;
            currentCard.style.left = `${currentCard.offsetLeft - leftOffset}px`;
        };

        const handleCardMouseUp = () => {
            const { cardIndex } = cardMoveState;
            if (!cardIndex) return;

            const currentCard = stockCardsRefs.current[cardIndex];

            currentCard.classList.remove("card-active");

            // TODO: activate
            // if (playerDealRef.current) playerDealRef.current.classList.remove("deal-active");

            currentCard.style.top = cardMoveState.initialPos.top!;
            currentCard.style.left = cardMoveState.initialPos.left!;

            setCardMoveState((prevState) => ({
                ...prevState,
                initialPos: {
                    top: null,
                    left: null,
                },
                isPressed: false,
            }));
        };

        if (!(window && cardMoveState.isPressed)) return;
        window.addEventListener("mousemove", handleCardMouseMove);
        window.addEventListener("mouseup", handleCardMouseUp);

        return () => {
            window.removeEventListener("mousemove", handleCardMouseMove);
            window.removeEventListener("mouseup", handleCardMouseUp);
        };
    }, [cardMoveState, cardToDeal]);

    const verifyCardIsOccupied = (cardKey: number) => {
        return holder.player.includes(cardKey);
    };

    return (
        <div
            className="GameInterface GameInterface--in-animation w-full h-full flex"
            ref={gameInterfaceScreenRef}
            onAnimationEnd={() => {
                gameInterfaceScreenRef.current?.classList.remove("GameInterface--in-animation");
            }}
        >
            <div
                className={`Stock Stock--in-animation h-full relative bg-green-300`}
                style={{
                    width: `${CARD_SIZE + 3}%`,
                }}
                ref={stockRef}
                onAnimationEnd={() => {
                    stockRef.current?.classList.remove("Stock--in-animation");
                }}
            >
                <div
                    className="absolute bg-green-500 flex-center
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
                {deck.map((card, i) => {
                    return (
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
                            cyrillic={lang === "ua"}
                            className={`card-${i} absolute`}
                            linkerRef={addToStockRefs}
                            style={{
                                top: 50 + i / 12 + "%",
                                left: "50%",
                                transform: "translate3d(-50%, -50%, 0)",
                                zIndex: i,
                            }}
                            onMouseEnter={(e) => handleCardMouseOver(e, i)}
                            onMouseLeave={(e) => handleCardMouseOut(e, i)}
                            onMouseDown={(e) => handleCardMouseDown([e.clientX, e.clientY], i)}
                        />
                    );
                })}
            </div>
            <div
                className={`PlayArea flex-center flex-col flex-grow`}
                style={{
                    width: `calc(100% - ${CARD_SIZE}% - 3%)`,
                }}
            >
                {!gameStartState ? (
                    <StartBlinkingTitle elementRef={gameInterfaceScreenRef} shouldStartGame={setGameStartState} />
                ) : (
                    <React.Fragment>
                        <div
                            className={`Hand-Opponent w-full bg-dark-600 flex items-center`}
                            style={{
                                minHeight: cardLinkerAPI.cardHeight,
                            }}
                            ref={opponentHandRef}
                        >
                            <h1
                                className="absolute left-0 text-center text-green-800 lg:text-5xl brightness-90"
                                style={{
                                    width: `${CARD_SIZE + 3}%`,
                                }}
                            >
                                0
                            </h1>
                        </div>
                        <div
                            className={`Deal w-full flex-center my-[5%] lg:my-[4%]`}
                            style={{
                                height: `calc(${cardLinkerAPI.cardHeight}px + 3%)`,
                            }}
                        >
                            <div
                                className="Deal-Opponent h-full mr-[5%]
                        border-[3px] md:border-4 xl:border-[6px] border-green-300 border-dashed"
                                style={{
                                    width: `calc(${cardLinkerAPI.cardWidth}px + 3%)`,
                                    borderRadius: cardLinkerAPI.cardBorderRadius,
                                }}
                                ref={opponentDealRef}
                                onClick={addCardToPlayerHand()}
                            ></div>
                            <div
                                className="Deal-Player h-full ml-[5%]
                        border-[3px] md:border-4 xl:border-[6px] border-green-300 border-dashed"
                                style={{
                                    width: `calc(${cardLinkerAPI.cardWidth}px + 3%)`,
                                    borderRadius: cardLinkerAPI.cardBorderRadius,
                                }}
                                ref={playerDealRef}
                                onClick={addCardToOpponentHand()}
                            ></div>
                        </div>
                        <div
                            className="Hand-Player w-full bg-dark-600 flex items-center"
                            style={{
                                minHeight: cardLinkerAPI.cardHeight,
                            }}
                            ref={playerHandRef}
                        >
                            <h1 className="absolute right-3 top-1/2 text-green-800 brightness-110">
                                {t("game-interface.round-title")}1
                            </h1>
                            <h1
                                className="absolute left-0 text-center text-green-800 lg:text-5xl brightness-90"
                                style={{
                                    width: `${CARD_SIZE + 3}%`,
                                }}
                            >
                                0
                            </h1>
                        </div>
                    </React.Fragment>
                )}
                <PlayAreaSidebarButtons gameStartState={gameStartState} gameResetHandler={setGameResetState} />
            </div>
        </div>
    );
};

export default GameInterface;
