import React, { useState, useRef, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import StartBlinkingTitle from "./StartBlinkingTitle";
import PlayAreaSidebarButtons from "./PlayAreaSidebarButtons";
import Alert from "./Alert";
import Modal from "@components/Modal";
import Scoring, { IHonors } from "./Scoring";

import CardLinker from "@utils/CardLinker";
import CardLinkerAPI from "@utils/CardLinker/CardLinkerAPI";
import Deck from "@utils/generateDeck";

import useTranslation from "@utils/hooks/useTranslation";
import useAudio from "@utils/hooks/useAudio";

import DoubleArrowIcon from "@mui/icons-material/DoubleArrow";

import _ from "@utils/_";
import { normalizedRank, detectCollision } from "@utils/utils";

import { CARDS_IN_DECK, APPLICATION_MEDIA, CARDS_WITHOUT_SQUEEZING, NO_CARD_AVAILABLE } from "@constants/global";

import "./GameInterface.scss";

const CARD_SIZE = 8;
let deck = Deck.createDeck();

// Each of above consists card indices (i.e. numbers)
const holder = {
    stock: [...Array(CARDS_IN_DECK + 1).keys()],
    player: new Array<number>(),
    opponent: new Array<number>(),
};

let cardOpposingDelay = 0;

const timeouts: NodeJS.Timeout[] = [];

// const cardsTranslateX: { [key: number]: number } = {};
const cardsRawTranslateX: { [key: number]: { per: string; num: string } } = {};

const GameInterface: React.FC = () => {
    //* External state management
    const dispatch = useDispatch();
    const { setTimerState } = bindActionCreators(actionCreators, dispatch);

    const roundStats = useSelector((state: State) => state.ROUND_STATS);
    const timerState = useSelector((state: State) => state.TIMER_STATE);
    const currentScore = useSelector((state: State) => state.CURRENT_SCORE);

    // Game reset state
    const [gameResetState, setGameResetState] = useState(false);

    // Ref to the game interface (current component)
    const gameInterfaceScreenRef = useRef<HTMLDivElement>(null);

    // Ref to the stock
    const stockRef = useRef<HTMLDivElement>(null);

    const playAreaRef = useRef<HTMLDivElement>(null);

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

    const roundEnd = useRef(false);

    // Array of refs to each card in the stock
    const stockCardsRefs = useRef(new Array<HTMLDivElement>());
    stockCardsRefs.current = [];

    // Populate `stockCardsRefs` with cards
    const addToStockRefs = (currentCard: HTMLDivElement) => {
        if (currentCard && !stockCardsRefs.current.includes(currentCard)) stockCardsRefs.current.push(currentCard);
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

    // Keeps track of the dealing card of both player and opponent
    const [dealingCard, setDealingCard] = useState<{
        idx: number;
        idxInHand: number;
        origin: "player" | "opponent";
    } | null>(null);

    // const [sideTurn, setSideTurn] = useState<"player" | "opponent">(_.randIntRange(0, 1) ? "player" : "opponent");
    const [batchDealer, setBatchDealer] = useState<"player" | "opponent" | null>("player");

    const playerDealtCardIdx = useRef<number | null>();
    const opponentDealtCardIdx = useRef<number | null>();

    const lastCardBy = useRef<"player" | "opponent">();

    const [playerCanMove, setPlayerCanMove] = useState(batchDealer === "player");

    // Any time when card falls into deal area (thus dealingCard changes), remove it from the origin hand
    useEffect(() => {
        if (!dealingCard) return;

        if (dealingCard.origin === "player") {
            playerDealtCardIdx.current = dealingCard.idx;
            holder.player = _.remove(holder.player, dealingCard.idx);
            lastCardBy.current = "player";
        } else {
            opponentDealtCardIdx.current = dealingCard.idx;
            holder.opponent = _.remove(holder.opponent, dealingCard.idx);
            lastCardBy.current = "opponent";
        }

        stockCardsRefs.current[dealingCard.idx].style.cursor = "default";
    }, [dealingCard]);

    // Since holder is a global variable, we cannot react on its change in useEffect,
    // so we create a separate state handFlow, that holds the number of cards in a player hand.
    // And when handFlow actually overflows the crucial number of cards in the hand
    // (here crucial number is the number of cards, that can fit in the hand without overflowing it),
    // we react on that and squeeze cards.
    const [handFlow, setHandFlow] = useState({
        player: 0,
        opponent: 0,
    });

    // Indicates the number of cards in the stock at the moment
    const [stockFlow, setStockFlow] = useState<number>(holder.stock.length);

    function squeezer(hand: "player" | "opponent" | React.RefObject<HTMLElement>) {
        if (typeof hand === "string") {
            const currentHand = hand === "player" ? holder.player : holder.opponent;
            return currentHand.length < CARDS_WITHOUT_SQUEEZING ? 4 : 5;
        }
        const currentHand = hand === playerHandRef ? holder.player : holder.opponent;
        return currentHand.length < CARDS_WITHOUT_SQUEEZING ? 4 : 5;
    }

    const placeCardIntoHand = (
        cardsRefs: React.MutableRefObject<HTMLDivElement[]>,
        handRef: React.RefObject<HTMLElement>,
        cardIndex: number,
        shouldMoveFromStock: boolean = true
    ) => {
        if (holder.stock.length === 0) {
            console.warn("⚠ The Card Stock is empty.");
        }

        if (!(cardsRefs.current || handRef.current)) return;

        let currentHand: number[];

        // Move card's index number from stock array to either player or opponent's hand array
        if (handRef === playerHandRef) {
            flipCard(cardIndex);
            holder.player.push(cardIndex);
            currentHand = holder.player;

            setHandFlow((prevState) => ({
                ...prevState,
                player: prevState.player + 1,
            }));
        } else {
            holder.opponent.push(cardIndex);
            currentHand = holder.opponent;

            setHandFlow((prevState) => ({
                ...prevState,
                opponent: prevState.opponent + 1,
            }));
        }
        if (shouldMoveFromStock && stockFlow) {
            holder.stock.pop();
            setStockFlow((prev) => prev - 1);
        }

        const handRect = handRef.current!.getBoundingClientRect();

        const card = cardsRefs.current[cardIndex],
            cardRect = card.getBoundingClientRect(),
            cardComputedTop = parseFloat(window.getComputedStyle(card).top),
            cardComputedLeft = parseFloat(window.getComputedStyle(card).left);

        const prevCardInHand = cardsRefs.current[currentHand.at(-2)!],
            prevCardZIdx = prevCardInHand ? +prevCardInHand.style.zIndex : -1;

        // We can change how cards overlay on each other by setting their zIndex as shown below:
        card.style.zIndex = `${prevCardInHand ? prevCardZIdx + 1 : 31 - cardIndex}`;

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
            const prevCard = cardsRefs.current[currentHand[i]];
            if (!prevCard) continue;

            const prevCardComputedLeft = parseFloat(prevCard.style.left);

            prevCard.style.left = `${
                prevCardComputedLeft - cardRect.width / (currentHand.length < CARDS_WITHOUT_SQUEEZING ? 4 : 5)
            }px`;
        }

        // Since we can place cards not only from the stock, but also from one hand to another,
        // we set cardsRawTranslateX only when a card comes from the stock, to be sure that existing settings won't reset
        if (!cardsRawTranslateX[cardIndex]) {
            cardsRawTranslateX[cardIndex] = {
                per: "-50%",
                num: "0",
            };
        }
    };

    const [wasPlayerSqueezed, wasOpponentSqueezed] = [useRef(false), useRef(false)];

    const squeezeHand = (observableHand: "player" | "opponent") => {
        const [currentHand, observable, wasSqueezed] =
            observableHand === "player"
                ? [holder.player, handFlow.player, wasPlayerSqueezed]
                : [holder.opponent, handFlow.opponent, wasOpponentSqueezed];

        // Squeeze all the cards available in a hand
        if (observable === CARDS_WITHOUT_SQUEEZING) {
            const middleCardIdx = Math.floor((currentHand.length - 1) / 2);

            for (let i = middleCardIdx - 1, q = 1; i >= 0; i--, q++) {
                const card = stockCardsRefs.current[currentHand[i]];
                card.style.transform = `translate3d(calc(-50% + ${(q * card.offsetWidth) / 10}px), -50%, 0)`;

                cardsRawTranslateX[currentHand[i]] = {
                    per: "-50%",
                    num: `${(q * card.offsetWidth) / 10}`,
                };
            }

            for (let i = middleCardIdx + 1, q = 1; i < currentHand.length; i++, q++) {
                const card = stockCardsRefs.current[currentHand[i]];
                card.style.transform = `translate3d(calc(-50% - ${(q * card.offsetWidth) / 10}px), -50%, 0)`;

                cardsRawTranslateX[currentHand[i]] = {
                    per: "-50%",
                    num: `${-(q * card.offsetWidth) / 10}`,
                };
            }

            wasSqueezed.current = true;
        } else if (wasSqueezed.current && observable < CARDS_WITHOUT_SQUEEZING) {
            // Reset squeezing
            for (let i = 0; i < currentHand.length; i++) {
                const card = stockCardsRefs.current[currentHand[i]];
                card.style.transform = `translate3d(-50%, -50%, 0)`;

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

        if (wasSqueezed.current && currentHand.length >= CARDS_WITHOUT_SQUEEZING) {
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
    };

    useEffect(() => {
        squeezeHand("player");
    }, [handFlow.player]);

    useEffect(() => {
        squeezeHand("opponent");
    }, [handFlow.opponent]);

    // Center cards in a hand when any card goes in a deal
    useEffect(() => {
        if (!dealingCard) return; // return if unset

        const [currentHand, handCards] =
            dealingCard.origin === "player"
                ? [playerHandRef.current, holder.player]
                : [opponentHandRef.current, holder.opponent];
        if (!currentHand) return;

        const stock = stockCardsRefs.current;
        // const handSqueezer = squeezer(dealingCard.origin);

        for (let i = dealingCard.idxInHand - 1; i >= 0; i--) {
            const card = stock[handCards[i]];
            const prevLeft = card.offsetLeft;

            card.style.left = `${prevLeft + card.offsetWidth / (handCards.length < 16 ? 4 : 5)}px`;

            // Sometimes when a card goes to a deal, the mouseLeave function does not executes thus resets in
            // this function does not strike. To address this issue we reset the transform here as well.
            card.style.transform = `translate3d(calc(${cardsRawTranslateX[handCards[i]].per} + ${
                cardsRawTranslateX[handCards[i]].num
            }px), -50%, 0)`;
        }

        for (let i = dealingCard.idxInHand; i < handCards.length; i++) {
            const card = stock[handCards[i]];
            const prevLeft = card.offsetLeft;

            card.style.left = `${prevLeft - card.offsetWidth / (handCards.length < 16 ? 4 : 5)}px`;

            // Sometimes when a card goes to a deal, the mouseLeave function does not executes thus the resets in
            // this function does not strike. To address this issue we reset the transform here as well.
            card.style.transform = `translate3d(calc(${cardsRawTranslateX[handCards[i]].per} + ${
                cardsRawTranslateX[handCards[i]].num
            }px), -50%, 0)`;
        }
    }, [dealingCard]);

    const addCardToPlayerHand = () => () => {
        // placeCardIntoHand(stockCardsRefs, playerHandRef, holder.stock[holder.stock.length - 1]);
        // console.log(playerDealtCardIdx.current, opponentDealtCardIdx.current);
        // console.log("Stock:", holder);
        // console.log("Dealing card:", dealingCard);
        console.log("Player H:", holder.player);
    };

    const addCardToOpponentHand = () => () => {
        // placeCardIntoHand(stockCardsRefs, opponentHandRef, holder.stock[holder.stock.length - 1]);
        // console.log(stockCardsRefs.current);
        // console.log("Current batch dealer:", batchDealer);
        console.log("Raw translates:", cardsRawTranslateX);
        // console.log("Player H:", holder.opponent);
    };

    // Deal first 6 cards for each player
    useEffect(() => {
        if (gameStartState) {
            // Deal the last 6 cards (counting from the top of the deck) to the player
            for (let i = 31; i >= 2; i--) {
                placeCardIntoHand(stockCardsRefs, playerHandRef, i);
            }
            // Deal next 6 cards to the opponent
            for (let i = 1; i >= 0; i--) {
                placeCardIntoHand(stockCardsRefs, opponentHandRef, i);
            }
            // setTimeout(() => toggleShuffleSound(), 200);
        }
    }, [gameStartState]); // Execute only once i.e. when game starts (thus dealing first six cards)

    //*     MOVING CARDS    *//

    // How many cards will be expanded on hover
    const numberOfCardInExpand = 2;

    // The value of expanding
    const expandingValue = handFlow.player < CARDS_WITHOUT_SQUEEZING ? 1.62 : 2;

    const handleCardMouseOver = (e: React.MouseEvent<HTMLDivElement>, cardIndex: number) => {
        if (!(cardIndex && isCardInPlayerHand(cardIndex) && e.currentTarget && playerCanMove && !roundEnd.current))
            return;

        const upOnHover = e.currentTarget.classList.contains("card-active") ? "-50%" : "-60%";

        e.currentTarget.style.transform = `translate3d(calc(${cardsRawTranslateX[cardIndex].per} + ${cardsRawTranslateX[cardIndex].num}px), ${upOnHover}, 0)`;
        e.currentTarget.style.cursor = "grab";

        const _cardIdxInHand = holder.player.indexOf(cardIndex);

        // If current card is the edge one - skip the expanding
        if (holder.player.indexOf(cardIndex) === holder.player.length - 1) return;

        //* EXPAND CARDS ON HOVER *//

        let lLeap = 0;

        // Expands left hand side
        for (
            let i = _cardIdxInHand - 1, e = expandingValue;
            i >= _cardIdxInHand - numberOfCardInExpand - lLeap && lLeap < 2;
            i--, e++
        ) {
            const currentCardIdx = holder.player[i];
            const card = stockCardsRefs.current[currentCardIdx];
            if (!card) {
                lLeap++;
                continue;
            }

            card.style.transform = `translate3d(calc(${cardsRawTranslateX[currentCardIdx].per} + ${
                cardsRawTranslateX[currentCardIdx].num
            }px - ${card.offsetWidth / 2 ** (e - lLeap)}px), -50%, 0)`;
        }

        let rLeap = 0;

        // Expands right hand side
        for (
            let i = _cardIdxInHand + 1, e = expandingValue;
            i <= _cardIdxInHand + numberOfCardInExpand + rLeap && rLeap < 2;
            i++, e++
        ) {
            const currentCardIdx = holder.player[i];
            const card = stockCardsRefs.current[currentCardIdx];
            if (!card) {
                rLeap++;
                continue;
            }

            card.style.transform = `translate3d(calc(${cardsRawTranslateX[currentCardIdx].per} + ${
                cardsRawTranslateX[currentCardIdx].num
            }px + ${card.offsetWidth / 2 ** (e - rLeap)}px), -50%, 0)`;
        }
    };

    // Set default cursor for all the player's cards when player cannot move them
    useEffect(() => {
        if (!playerCanMove) {
            holder.player.forEach((cardIdx) => {
                const card = stockCardsRefs.current[cardIdx];
                card.style.cursor = "default";
            });
        }
    }, [playerCanMove]);

    const handleCardMouseOut = (e: React.MouseEvent<HTMLDivElement>, cardIndex: number) => {
        if (!(cardIndex && isCardInPlayerHand(cardIndex) && e.currentTarget)) return;

        e.currentTarget.style.transform = `translate3d(calc(${cardsRawTranslateX[cardIndex].per} + ${cardsRawTranslateX[cardIndex].num}px), -50%, 0)`;

        const _cardIdxInHand = holder.player.indexOf(cardIndex);

        // If current card is the edge one - skip the constriction
        if (holder.player.indexOf(cardIndex) === holder.player.length - 1) return;

        let lLeap = 0;

        // Reset expanding of the left hand side
        for (
            let i = _cardIdxInHand - 1, e = expandingValue;
            i >= _cardIdxInHand - numberOfCardInExpand - lLeap && lLeap < 2;
            i--, e++
        ) {
            const currentCardIdx = holder.player[i];
            const card = stockCardsRefs.current[currentCardIdx];
            if (!card) {
                lLeap++;
                continue;
            }

            card.style.transform = `translate3d(calc(${cardsRawTranslateX[holder.player[i]].per} + ${
                cardsRawTranslateX[holder.player[i]].num
            }px), -50%, 0)`;
        }

        let rLeap = 0;

        // Reset expanding of the right hand side
        for (
            let i = _cardIdxInHand + 1, e = expandingValue;
            i <= _cardIdxInHand + numberOfCardInExpand + rLeap && rLeap < 2;
            i++, e++
        ) {
            const currentCardIdx = holder.player[i];
            const card = stockCardsRefs.current[currentCardIdx];
            if (!card) {
                rLeap++;
                continue;
            }

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
        if (!(isCardInPlayerHand(cardIndex) && !dealingCard && playerCanMove && !roundEnd.current)) return;

        const currentCard = stockCardsRefs.current[cardIndex];

        currentCard.classList.add("card-active");

        setCardMoveState({
            cardIndex: cardIndex,
            mouse: [clientX, clientY],
            initialPos: {
                top: `${currentCard.offsetTop - 0.1}px`, // Seems like there is some sort of shift down when a card goes
                left: `${currentCard.offsetLeft}px`, // back, so i decided to move it 0.1px up to correct that behavior
            },
            playerHandOrigin: isCardInPlayerHand(cardIndex),
            isPressed: true,
        });
    };

    const showIncompatibleSuitMsg = useRef(false);
    const [showOpponentNoCard, setShowOpponentNoCard] = useState(false);
    const [showPlayerNoCard, setShowPlayerNoCard] = useState(false);

    useEffect(() => {
        const handleCardMouseMove = ({ clientX, clientY }: { clientX: number; clientY: number }) => {
            // Prevent from handling a card move if the card is in the deal area
            if (dealingCard) return;

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
            opponentDealRef.current?.classList.add("deal-active");

            const currentCard = stockCardsRefs.current[cardIndex];
            const playerDeal = playerDealRef.current;
            const playArea = playAreaRef.current;
            const gameInterfaceScreen = gameInterfaceScreenRef.current;

            if (!(currentCard && playerDeal && playArea && gameInterfaceScreen)) return;

            const playerDealTop = playerDeal.getBoundingClientRect().top,
                gameInterfaceTop = gameInterfaceScreen.getBoundingClientRect().top;

            // Minimal bounds of the play area, defined as left and top sides
            const minBoundX = playArea.offsetLeft + currentCard.offsetWidth / 2,
                minBoundY = playArea.offsetTop + currentCard.offsetHeight / 2 - gameInterfaceTop;

            // Maximal bounds of the play area, defined as tight and bottom sides
            const maxBoundX = minBoundX + playArea.offsetWidth - currentCard.offsetWidth,
                maxBoundY = minBoundY + playArea.offsetHeight - currentCard.offsetHeight;

            // Calculate mouse left and top including play area bounds
            const cardLeft = Math.max(minBoundX, Math.min(currentCard.offsetLeft - leftOffset, maxBoundX)),
                cardTop = Math.max(minBoundY, Math.min(currentCard.offsetTop - topOffset, maxBoundY));

            // When the stock is empty, according to the rules, we must oppose the card with the same suit as opponent's one
            if (!stockFlow && batchDealer === "opponent" && typeof opponentDealtCardIdx.current === "number") {
                if (deck[cardIndex].suit !== deck[opponentDealtCardIdx.current].suit) {
                    playerDealRef.current?.classList.add("deal-active");
                    showIncompatibleSuitMsg.current = true;
                }
            }

            // When card enters a dealing area (with offset of 50px), place it inside the area
            if (detectCollision(currentCard, playerDeal, 25) && !showIncompatibleSuitMsg.current) {
                // setSideTurn("opponent");

                setPlayerCanMove(false);

                setDealingCard({
                    idx: cardIndex!,
                    idxInHand: holder.player.indexOf(cardIndex),
                    origin: "player",
                });

                // Set the number of cards in hand flow to one less to keep the original hand length
                setHandFlow((prevState) => ({
                    ...prevState,
                    player: prevState.player - 1,
                }));

                if (batchDealer === "opponent") setPlayerMovedOnOpponentBatch(true);

                handleCardMouseUp();

                currentCard.style.transform = `translate3d(-50%, -50%, 0)`;

                // Place card int the center of the player deal area
                currentCard.style.top = `${playerDealTop - gameInterfaceTop + playerDeal.offsetHeight / 2}px`;
                currentCard.style.left = `${playerDeal.offsetLeft + playerDeal.offsetWidth / 2}px`;

                return;
            }

            // Return `true` is cursor is gone out of left or right bounds
            function detectMouseOutX() {
                if (!playArea) return;
                return clientX < playArea.offsetLeft || clientX > playArea.offsetLeft + playArea.offsetWidth;
            }

            // Return `true` is cursor is gone out of top or bottom bounds
            function detectMouseOutY() {
                if (!playArea) return;
                return clientY < playArea.offsetTop || clientY > playArea.offsetTop + playArea.offsetHeight;
            }

            // Check if the cursor is inside play area
            function detectMouseInside(offset: number = 20) {
                if (!playArea) return;
                return !(
                    clientY < playArea.offsetTop + offset ||
                    clientY > playArea.offsetTop + playArea.offsetHeight - offset ||
                    clientX < playArea.offsetLeft + offset ||
                    clientX > playArea.offsetLeft + playArea.offsetWidth - offset
                );
            }

            // When the cursor goes out of left / right bounds, card moves only up / down
            if (detectMouseOutX()) return (currentCard.style.top = `${cardTop}px`);

            // When the cursor goes out of top / left bounds, card moves only left / right
            if (detectMouseOutY()) return (currentCard.style.left = `${cardLeft}px`);

            // Detect when the cursor is fully inside the play area
            if (detectMouseInside(Math.floor(currentCard.offsetWidth / 4))) {
                // If the cursor is not within the card, we move card to cursor's position
                if (!detectCollision({ x: clientX, y: clientY }, currentCard)) {
                    currentCard.style.top = `${clientY}px`;
                    currentCard.style.left = `${clientX}px`;
                    return;
                }

                // else just move normally the card
                currentCard.style.top = `${cardTop}px`;
                currentCard.style.left = `${cardLeft}px`;
            }
        };

        const handleCardMouseUp = () => {
            const { cardIndex } = cardMoveState;
            if (!cardIndex) return;

            const currentCard = stockCardsRefs.current[cardIndex];

            currentCard.classList.remove("card-active");

            showIncompatibleSuitMsg.current = false;

            // TODO: activate
            opponentDealRef.current?.classList.remove("deal-active");
            playerDealRef.current?.classList.remove("deal-active");

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
    }, [cardMoveState, dealingCard]);

    const isCardInPlayerHand = (cardKey: number) => {
        return holder.player.includes(cardKey);
    };

    //*  PLAY  *//

    const [playerMovedOnOpponentBatch, setPlayerMovedOnOpponentBatch] = useState<boolean>(false);

    //* PLAYERS LAST MOVE
    useEffect(() => {
        if (!dealingCard && !(playerMovedOnOpponentBatch && batchDealer === "opponent")) return;

        // Clean dealt cards, when player placed his card while opponent's batch
        if (playerMovedOnOpponentBatch && batchDealer === "opponent") {
            const timer = setTimeout(() => {
                playerDealtCardIdx.current = null;
                opponentDealtCardIdx.current = null;
                setPlayerMovedOnOpponentBatch(false);
                setDealingCard(null);
            }, 4200);

            timeouts.push(timer);

            return () => clearTimeout(timer);
        }
    }, [playerMovedOnOpponentBatch]);

    // Opponent makes first move, as he won previous batch
    useEffect(() => {
        if (batchDealer === "opponent") {
            // Player cannot move while opponent is moving
            setPlayerCanMove(false);

            // Opponent places card into deal area
            placeOpponentCardDeal(chooseFiringCard());

            const timer = setTimeout(() => {
                // Now, after the move is done, player can move
                setPlayerCanMove(true);
            }, cardOpposingDelay + 500);

            timeouts.push(timer);

            return () => clearTimeout(timer);
        }
    }, [batchDealer]);

    //* OPPONENTS LAST MOVE
    useEffect(() => {
        if (!dealingCard) return; // To prevent first call

        // If player while his batch has already made a move, opponent answers
        if (batchDealer === "player" && dealingCard.origin === "player") {
            // Player cannot move while opponent is moving
            setPlayerCanMove(false);

            // Opponent places card into deal area
            placeOpponentCardDeal(chooseOpposingCard(dealingCard.idx));

            // Cleaning: fires after the batch winner was determined and cards placed into the corresponding hand
            const timer = setTimeout(() => {
                playerDealtCardIdx.current = null;
                opponentDealtCardIdx.current = null;
            }, 4200);

            timeouts.push(timer);

            return () => clearTimeout(timer);
        }
    }, [dealingCard]);

    useEffect(() => {
        if (!batchDealer) return;
        if (batchDealer === "player") {
            console.log("👉 Now is player's batch");
            return;
        }
        console.log("👉 Now is opponent's batch");
    }, [batchDealer]);

    // Find a card in a hand with minimal rank
    function cardWithMinimalRank(hand: number[]) {
        let [minRankCard, minRankCardIdx] = [15, -1]; // 15 since there is no card higher than 14
        hand.forEach((cardIdx) => {
            if (normalizedRank(deck[cardIdx].rank) < minRankCard) {
                minRankCard = normalizedRank(deck[cardIdx].rank);
                minRankCardIdx = cardIdx;
            }
        });

        return minRankCardIdx;
    }

    // Choose a card from an opponent's hand to place first
    const chooseFiringCard = () => {
        const handCards = holder.opponent;

        // If the number of 7 in hand is at least 2, we can return 7. Otherwise no.
        function shouldIncludeSeven() {
            return handCards.filter((card) => deck[card].rank === 7).length > 1 ? true : false;
        }

        // If player's card is bigger than any available card, return unnecessary card: 8, 9
        const unnecessaryCards = handCards.filter(
            (cardIdx) =>
                (normalizedRank(deck[cardIdx].rank) > 7 || shouldIncludeSeven()) &&
                normalizedRank(deck[cardIdx].rank) < 10
        );

        // If there is unnecessary cards, return minimal of them
        if (unnecessaryCards.length) {
            return cardWithMinimalRank(unnecessaryCards);
        }

        // Else return a card with lowest rank
        return cardWithMinimalRank(handCards);
    };

    // Choose the card number in opponent's hand, to answer the player
    const chooseOpposingCard = (playerCardIdx: number) => {
        const playerCard = deck[playerCardIdx];
        const handCards = holder.opponent;

        // Find all cards, that can beat player's one: the card should be the same suit, but bigger in rank
        const possibleBeatingCardsIdc = handCards.filter(
            (cardIdx) =>
                deck[cardIdx].suit === playerCard.suit &&
                normalizedRank(deck[cardIdx].rank) > normalizedRank(playerCard.rank)
        );
        if (possibleBeatingCardsIdc.length) {
            console.log("beating card");
            return _.choice(possibleBeatingCardsIdc);
        }

        // If the number of 7 in hand is at least 2, we can return 7. Otherwise no.
        function shouldIncludeSeven() {
            return handCards.filter((card) => deck[card].rank === 7).length > 1;
        }

        // If player's card is bigger than any available card, return random unnecessary card: 8, 9
        const unnecessaryCards = handCards.filter((cardIdx) =>
            (normalizedRank(deck[cardIdx].rank) > 7 || shouldIncludeSeven()) &&
            normalizedRank(deck[cardIdx].rank) < 10 &&
            stockFlow
                ? 1
                : deck[cardIdx].suit === playerCard.suit
        );
        if (unnecessaryCards.length) {
            console.log(stockFlow);
            return _.choice(unnecessaryCards);
        }

        // else return the lowest in rank card
        return stockFlow ? cardWithMinimalRank(handCards) : NO_CARD_AVAILABLE;
    };

    const placeOpponentCardDeal = (cardIdx: number) => {
        if (cardIdx === NO_CARD_AVAILABLE) {
            setShowOpponentNoCard(true);
            return;
        }

        const card = stockCardsRefs.current[cardIdx];
        const opponentDeal = opponentDealRef.current;
        const gameInterfaceScreen = gameInterfaceScreenRef.current;

        if (!(card && opponentDeal && gameInterfaceScreen)) return;

        const opponentDealTop = opponentDeal.getBoundingClientRect().top,
            gameInterfaceTop = gameInterfaceScreen.getBoundingClientRect().top;

        // Choose the delay for opponent's move (just imitating human's behavior)
        if (
            cardIdx >= holder.opponent[Math.floor(holder.opponent.length / 4)] &&
            cardIdx <= holder.opponent[Math.floor((3 * holder.opponent.length) / 4)]
        ) {
            cardOpposingDelay = _.randIntRange(500, 800);
        } else {
            cardOpposingDelay = _.randIntRange(900, 1200);
        }

        const timer = setTimeout(() => {
            card.style.top = `${opponentDealTop - gameInterfaceTop + opponentDeal.offsetHeight / 2}px`;
            card.style.left = `${opponentDeal.offsetLeft + opponentDeal.offsetWidth / 2}px`;

            // Remove one card from hand flow to keep original hand length
            setHandFlow((prevState) => ({
                ...prevState,
                opponent: prevState.opponent - 1,
            }));

            // Squeeze cards in hand
            setDealingCard({
                idx: cardIdx,
                idxInHand: holder.opponent.indexOf(cardIdx),
                origin: "opponent",
            });

            card.style.transform = `translate3d(-50%, -50%, 0)`;

            // Enable dragging
            setDealingCard(null);
        }, cardOpposingDelay);

        timeouts.push(timer);
    };

    function addCardsFromStock() {
        if (!stockFlow) return;

        const timer = setTimeout(() => {
            placeCardIntoHand(stockCardsRefs, playerHandRef, holder.stock[holder.stock.length - 1]);
            placeCardIntoHand(stockCardsRefs, opponentHandRef, holder.stock[holder.stock.length - 1]);
        }, 1200);

        timeouts.push(timer);
    }

    // When both sides put their cards, decide which one win and move cards to the corresponding hand
    useEffect(() => {
        if (
            !(
                typeof playerDealtCardIdx.current === "number" &&
                typeof opponentDealtCardIdx.current === "number" &&
                !showPlayerNoCard
            )
        )
            return console.log("Dealt cards:", playerDealtCardIdx.current, opponentDealtCardIdx.current);

        const playerCard = deck[playerDealtCardIdx.current],
            opponentCard = deck[opponentDealtCardIdx.current];

        function defineWinningSide(side: "player" | "opponent") {
            const [dealtCard, winningHand] =
                side === "player" ? [playerDealtCardIdx, playerHandRef] : [opponentDealtCardIdx, opponentHandRef];

            const card = stockCardsRefs.current[dealtCard.current!];
            card.classList.add("winning-card");

            const timer = setTimeout(() => {
                card.classList.remove("winning-card");

                placeCardIntoHand(stockCardsRefs, winningHand, playerDealtCardIdx.current!, false);
                const timer1 = setTimeout(() => {
                    placeCardIntoHand(stockCardsRefs, winningHand, opponentDealtCardIdx.current!, false);
                }, 0); // FIX: some sort of delay to be sure that when cards are squeezing (i.e. when hand overflow), the previous
                // card placed in a hand is already squeezed, since we reference the last card that is squeezed

                addCardsFromStock();
                const timer2 = setTimeout(() => {
                    setBatchDealer(null);
                    setBatchDealer(side);
                    setPlayerCanMove(side === "player");
                }, 1500);

                timeouts.push(timer1);
                timeouts.push(timer2);
            }, 2500);

            timeouts.push(timer);
        }

        if (batchDealer === "player") {
            if (playerCard.suit === opponentCard.suit) {
                if (normalizedRank(playerCard.rank) > normalizedRank(opponentCard.rank)) {
                    /// Player wins
                    defineWinningSide("player");
                    return;
                }
                /// Opponent wins
                defineWinningSide("opponent");
                return;
            }
            /// Player wins
            defineWinningSide("player");
            return;
        }

        if (batchDealer === "opponent") {
            if (opponentCard.suit === playerCard.suit) {
                if (normalizedRank(opponentCard.rank) > normalizedRank(playerCard.rank)) {
                    /// Opponent wins
                    defineWinningSide("opponent");
                    return;
                }
                /// Player wins
                defineWinningSide("player");
                return;
            }
            /// Opponent wins
            defineWinningSide("opponent");
            return;
        }
    }, [playerDealtCardIdx.current, opponentDealtCardIdx.current]);

    // Check if there are cards in player's hand to answer the opponent. If there are no cards,
    // announce the end of the round and start counting points
    useEffect(() => {
        if (!(!stockFlow && dealingCard && batchDealer === "opponent")) return;

        const playerCards = holder.player;
        let cardToAnswer = 0;

        if (playerCards.length) {
            playerCards.forEach((card) => {
                if (deck[card].suit === deck[dealingCard.idx].suit) {
                    cardToAnswer++;
                }
            });
        }

        if (!cardToAnswer) {
            setShowPlayerNoCard(true);

            // TODO: same thing for player's card & hand
            // since opponent have already put his card into a deal and the round has ended,
            // we put the card's index back to his hand to include it into honor counting
            holder.opponent.push(dealingCard.idx);
        }
    }, [dealingCard, batchDealer]);

    // Additional styling to indicate that there are no cards in player's hand to answer the opponent
    useEffect(() => {
        if (showPlayerNoCard) {
            roundEnd.current = true;
            holder.player.forEach((card) => {
                stockCardsRefs.current[card].style.filter = "brightness(0.8) grayscale(0.8)";
            });
        }
    }, [showPlayerNoCard]);

    // Additional styling to indicate that there are no cards in opponent's to answer the player
    useEffect(() => {
        if (showOpponentNoCard) {
            roundEnd.current = true;
            holder.opponent.forEach((card) => {
                stockCardsRefs.current[card].style.filter = "brightness(0.8) grayscale(0.8)";
            });
        }
    }, [showOpponentNoCard]);

    // After the round is over, wait 3500ms and show scoring window
    const [showScoringWin, setShowScoringWin] = useState(false);
    useEffect(() => {
        if (roundEnd.current) {
            // When round is over and any card is in the deal, return in to the origin hand
            if (dealingCard) {
                if (dealingCard.origin === "player") holder.player.push(dealingCard.idx);
                else holder.opponent.push(dealingCard.idx);
            }

            const timer = setTimeout(() => {
                // Hide no card warning
                setShowPlayerNoCard(false);
                setShowOpponentNoCard(false);

                // Show scoring window
                setShowScoringWin(true);
            }, 3000);
            timeouts.push(timer);
            return () => clearTimeout(timer);
        }
    }, [roundEnd.current]);

    // After the point count window is showed (just starting point), we calculate the number of honors
    // in each hand, and save it into `roundHonors`, which will be passed to the scoring window
    const [roundHonors, setRoundHonors] = useState<IHonors | null>();
    useEffect(() => {
        if (!showScoringWin) return;

        const playerCards = holder.player,
            opponentCards = holder.opponent;

        const totalHonors = {
            player: new Map(),
            opponent: new Map(),
        };

        playerCards.forEach((card) => {
            const prevHonor = totalHonors.player.get(deck[card].rank);

            if (prevHonor) return totalHonors.player.set(deck[card].rank, prevHonor + 1);
            totalHonors.player.set(deck[card].rank, 1);
        });

        opponentCards.forEach((card) => {
            const prevHonor = totalHonors.opponent.get(deck[card].rank);

            if (prevHonor) return totalHonors.opponent.set(deck[card].rank, prevHonor + 1);
            totalHonors.opponent.set(deck[card].rank, 1);
        });

        setRoundHonors({
            player: Object.fromEntries(totalHonors.player),
            opponent: Object.fromEntries(totalHonors.opponent),
        });
    }, [showScoringWin]);

    // Reset all internal states when setting up a new game
    useEffect(() => {
        if (!gameStartState) return;

        if (!(gameInterfaceScreenRef.current && stockRef.current)) return;

        setGameStartState((prevState) => !prevState);

        // Clear all timeouts fired before
        timeouts.forEach((t) => clearTimeout(t));

        // Append animations
        gameInterfaceScreenRef.current.classList.add("GameInterface--in-animation");
        stockRef.current.classList.add("Stock--in-animation");

        // Set default cards' position
        if (!stockCardsRefs.current) return;
        stockCardsRefs.current.forEach((card, idx) => {
            card.style.top = 50 + idx / 12 + "%";
            card.style.left = "50%";
            card.style.transform = "translate3d(-50%, -50%, 0)";
            card.style.zIndex = `${idx}`;
        });

        // Regenerate a new deck
        deck = Deck.createDeck();

        // Reset holder
        holder.stock = [...Array(CARDS_IN_DECK + 1).keys()];
        holder.player.length = 0;
        holder.opponent.length = 0;

        holder.stock.forEach((card) => {
            stockCardsRefs.current[card].style.filter = "";
        });

        // Update all cards to be facedown: isShirt={true}
        setShirtStates((prevStates) => prevStates.fill(true));

        roundEnd.current = false;

        setShirtStates(deck.map(() => true));

        // Reset to null to be sure that any card (that was in a deal) is movable again
        setDealingCard(null);

        const defineBatchDealer = "player";

        setBatchDealer(defineBatchDealer);

        playerDealtCardIdx.current = undefined;
        opponentDealtCardIdx.current = undefined;

        lastCardBy.current = undefined;

        setPlayerCanMove(defineBatchDealer === "player");

        setHandFlow({
            player: 0,
            opponent: 0,
        });

        wasPlayerSqueezed.current = false;
        wasOpponentSqueezed.current = false;

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

        showIncompatibleSuitMsg.current = false;

        setShowOpponentNoCard(false);

        setShowPlayerNoCard(false);

        setPlayerMovedOnOpponentBatch(false);

        setShowScoringWin(false);

        setRoundHonors(null);

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
    }, [gameResetState]); // No need to include gameStartState as it would re-render the game start state

    // When gameStartState set to true (i.e. the actual game has started), we start the timer. Otherwise reset it.
    useEffect(() => {
        if (gameStartState) {
            console.log("fires in game interface");
            setTimerState({
                ...timerState,
                start: true,
                pause: false,
                reset: false
            });
        }
    }, [gameStartState]);

    return (
        <React.Fragment>
            {showScoringWin && roundHonors && (
                <Modal
                    isOpen={true}
                    toggleModal={() => {}}
                    unclosable={true}
                    disableScrollBar
                >
                    <Scoring honors={roundHonors!} handleNextRound={setGameResetState} />
                </Modal>
            )}
            <div
                className="GameInterface GameInterface--in-animation w-full h-full flex"
                ref={gameInterfaceScreenRef}
                onAnimationEnd={() => {
                    gameInterfaceScreenRef.current?.classList.remove("GameInterface--in-animation");
                }}
            >
                <div
                    className={`Stock Stock--in-animation h-full relative bg-green-300 border-r-4 border-[#276f35]`}
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
                                // isShirt={shirtStates[i]}
                                isShirt={false}
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
                    ref={playAreaRef}
                >
                    {!gameStartState ? (
                        <StartBlinkingTitle elementRef={gameInterfaceScreenRef} shouldStartGame={setGameStartState} />
                    ) : (
                        <React.Fragment>
                            <Alert isMounted={showIncompatibleSuitMsg.current} msg={`👉 ${t("pop-up.incomp-suits")}`} />
                            <Alert isMounted={showOpponentNoCard} msg={`${t("pop-up.opponent-no-card")}`} />
                            <Alert isMounted={showPlayerNoCard} msg={`${t("pop-up.player-no-card")}`} />
                            <div
                                className={`Hand-Opponent w-full bg-green-300 flex items-center`}
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
                                    {currentScore.opponent}
                                </h1>
                            </div>
                            <div
                                className={`Deal w-full flex-center my-[5%] lg:my-[4%]`}
                                style={{
                                    height: `calc(${cardLinkerAPI.cardHeight}px + 3%)`,
                                }}
                            >
                                <div
                                    className="Deal-Opponent h-full mr-[6%]
                        border-[3px] md:border-4 xl:border-[6px] border-green-300 border-dashed"
                                    style={{
                                        width: `calc(${cardLinkerAPI.cardWidth}px + 3%)`,
                                        borderRadius: cardLinkerAPI.cardBorderRadius,
                                    }}
                                    ref={opponentDealRef}
                                    onClick={addCardToPlayerHand()}
                                ></div>
                                {/* {batchWinner.current && (
                                <DoubleArrowIcon
                                    className="WinningSideArrow absolute text-green-800 brightness-125 rotate-0"
                                    sx={{
                                        fontSize: "7vw",
                                        transform: `rotate(${batchWinner.current === "player" ? "0" : "180"}deg)`,
                                    }}
                                />
                            )} */}
                                <div
                                    className="Deal-Player h-full ml-[6%]
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
                                className="Hand-Player w-full bg-green-300 flex items-center"
                                style={{
                                    minHeight: cardLinkerAPI.cardHeight,
                                }}
                                ref={playerHandRef}
                            >
                                <h1 className="absolute right-3 top-1/2 text-green-800 brightness-110">
                                    {t("game-interface.round-title")}
                                    {roundStats.current}
                                </h1>
                                <h1
                                    className="absolute left-0 text-center text-green-800 lg:text-5xl brightness-90"
                                    style={{
                                        width: `${CARD_SIZE + 3}%`,
                                    }}
                                >
                                    {currentScore.player}
                                </h1>
                            </div>
                        </React.Fragment>
                    )}
                    <PlayAreaSidebarButtons gameStartState={gameStartState} gameResetHandler={setGameResetState} />
                </div>
            </div>
        </React.Fragment>
    );
};

export default GameInterface;
