import React, { useState, useRef, useEffect, useMemo } from "react";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import useTranslation from "@utils/hooks/useTranslation";
import useAudio from "@utils/hooks/useAudio";

import StartBlinkingTitle from "./StartBlinkingTitle";
import NewGameButton from "./NewGameButton";
import Alert from "./Alert";
import Modal from "@components/Modal";
import ScoreBoard, { IHonors } from "./ScoreBoard";

import CardLinker from "@utils/CardLinker";
import CardLinkerAPI from "@utils/CardLinker/CardLinkerAPI";
import Deck from "@utils/generateDeck";
import { choosePlayingCard, chooseOpposingCard } from "./scripts";
import { expandCards, resetExpandCards } from "./scripts/utils";

import _ from "@utils/_";
import { normalizedRank } from "@utils/utils";

import {
    CARDS_IN_DECK,
    APPLICATION_MEDIA,
    CARDS_WITHOUT_SQUEEZING,
    NO_CARD_AVAILABLE,
    ALERT_VISIBLE_TIME,
    CARD_FLIP_SOUND_DELAY,
    ADD_CARDS_FROM_STOCK_DELAY,
    DEFINE_WINNING_SIDE_CLEARING,
    CARDS_IN_DEAL_DURATION,
    SHOW_SCORING_WIN_DELAY,
} from "@src/constants";

import "./GameInterface.scss";

/**************************************
 *               Globals              *
 *************************************/

const CARD_SIZE = 8; // Card size, that depends on the window size
let deck = Deck.createDeck(); // Generated deck

// Each of above consists card indices (i.e. numbers)
const holder = {
    stock: [...Array(CARDS_IN_DECK + 1).keys()],
    player: new Array<number>(),
    opponent: new Array<number>(),
};

let cardOpposingDelay = 0;

// Here we hold all the timeouts to be able to clear them when starting a gew game
const timeouts: NodeJS.Timeout[] = [];

// ...
const cardsRawTranslateX: { [key: number]: { per: string; num: string } } = {};

const GameInterface: React.FC<{ restoreSession: boolean }> = ({ restoreSession }) => {
    /**************************************
     *           External state           *
     *************************************/

    const dispatch = useDispatch();
    const { setProgress } = bindActionCreators(actionCreators, dispatch);

    const storeSessionSignal = useSelector((state: State) => state.STORE_SESSION_SIGNAL);
    const sessionProgress = useSelector((state: State) => state.PROGRESS);
    const sessionStats = useSelector((state: State) => state.STATS);

    // If we are restoring a session, grab deck and stock from the saved ones thus restoring the actual deck and stock
    useEffect(() => {
        if (restoreSession) {
            deck = sessionProgress.DECK;
            holder.stock = sessionProgress.HOLDER.stock;
        }
    }, [restoreSession]);

    /**************************************
     *                Hooks               *
     *************************************/

    const { t, lang } = useTranslation(); // Obtain current language along with the lang toggler
    const [playShuffleSound] = useAudio(APPLICATION_MEDIA.shuffle);
    const [playFlipSound] = useAudio(APPLICATION_MEDIA.flip);

    /**************************************
     *           DOM references           *
     *************************************/

    const gameInterfaceScreenRef = useRef<HTMLDivElement>(null); // Ref to the game interface (current component)
    const stockRef = useRef<HTMLDivElement>(null); // Ref to the stock
    const playAreaRef = useRef<HTMLDivElement>(null); // Ref to the play area
    const opponentHandRef = useRef<HTMLDivElement>(null); // Ref to the opponent hand area
    const playerHandRef = useRef<HTMLDivElement>(null); // Ref to the player hand area
    const playerDealRef = useRef<HTMLDivElement>(null); // Ref to the player deal place
    const opponentDealRef = useRef<HTMLDivElement>(null); // Ref to the opponent deal place

    // Array of refs to each card in the stock
    const stockCardsRefs = useRef(new Array<HTMLDivElement>());
    stockCardsRefs.current = [];

    // Populate `stockCardsRefs` with cards
    const addToStockRefs = (currentCard: HTMLDivElement) => {
        if (currentCard && !stockCardsRefs.current.includes(currentCard)) stockCardsRefs.current.push(currentCard);
    };

    /**************************************
     *         Application states         *
     *************************************/

    const [gameStartState, setGameStartState] = useState(false); // State that defines when to start dealing cards
    const [gameResetState, setGameResetState] = useState(false); // Game reset state
    const [shirtStates, setShirtStates] = useState(deck.map(() => true)); // isShirt values of all cards

    // Keeps track of the dealing card of both player and opponent
    const [dealingCard, setDealingCard] = useState<{
        idx: number;
        idxInHand: number;
        origin: "player" | "opponent";
    } | null>(null);

    // On game start batch dealer could be opponent and unlike holder.opponent, whish is populating
    // gradually (see SECTION 1), batchDealer is defined immediately on game start. But since cards are
    // not dealt yet, opponent would try to play with a card, that does not exist. To resolve this problem,
    // when all cards are dealt already, we set `cardsAreDealt` to `true` thus triggering useEffect
    // (see SECTION 5) and telling opponent that cards are dealt now and he can play any he could choose.
    const [cardsAreDealt, setCardsAreDealt] = useState(false);

    // const [batchDealer, setBatchDealer] = useState<"player" | "opponent" | null>(_.randIntRange(0, 1) ? "player" : "opponent");
    const [batchDealer, setBatchDealer] = useState<"player" | "opponent" | null>("player"); //* <----

    // While opponents move, player cannot move so we indicate that here
    const [playerCanMove, setPlayerCanMove] = useState(batchDealer === "player");

    // Since holder is a global variable, we cannot react on its change in useEffect,
    // so we create a separate state handFlow, that holds the number of cards in a player hand.
    // And when handFlow actually overflows the crucial number of cards in the hand
    // (here crucial number is the number of cards, that can fit in the hand without overflowing it),
    // we react on that and squeeze cards.
    const [handFlow, setHandFlow] = useState({
        player: 0,
        opponent: 0,
    });

    // When `true`, show an alert telling no cards available
    const [showPlayerNoCard, setShowPlayerNoCard] = useState(false);
    const [showOpponentNoCard, setShowOpponentNoCard] = useState(false);

    // When player tries to play a card with not the same suit as opponent's one
    // (after stock is empty), show the corresponding message
    const [showIncompatibleSuitMsg, setShowIncompatibleSuitMsg] = useState(false);

    // Is true when either player or opponent don't have cards to play so the current rounds is over
    // const roundEnd = useRef(false);
    const [roundEndState, setRoundEndState] = useState(false);

    /**************************************
     *             References             *
     *************************************/

    const playerDealtCardIdx = useRef<number | null>(); // Card index that player dealt
    const opponentDealtCardIdx = useRef<number | null>(); // Card index that opponent dealt
    const lastCardBy = useRef<"player" | "opponent">();

    const cardLinkerAPI = new CardLinkerAPI(CARD_SIZE, { ref: gameInterfaceScreenRef });

    // Indicates the number of cards in the stock at the moment
    const stockFlow = useRef(holder.stock.length);

    const wasPlayerSqueezed = useRef(false); // Indicates wether player's hand was squeezed
    const wasOpponentSqueezed = useRef(false); // Indicates wether opponent's hand was squeezed

    /**************************************
     *           Internal utils           *
     *************************************/

    const faceUp = (cardIndex: number) => {
        setShirtStates((prevStates) => {
            prevStates[cardIndex] = false;
            return prevStates;
        });
    };

    const faceDown = (cardIndex: number) => {
        setShirtStates((prevStates) => {
            prevStates[cardIndex] = false; // true
            return prevStates;
        });
    };

    /** Returns true is the `cardIndex` exists in holder.play (i.e. card is in the players hand) */
    const isCardInPlayerHand = (cardIndex: number) => {
        return holder.player.includes(cardIndex);
    };

    /**************************************
     *           Update handlers          *
     *************************************/

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

        // Since opponent's cards are not visible, show his card in the deal
        faceUp(dealingCard.idx);

        // Set default cursor for dealing card
        stockCardsRefs.current[dealingCard.idx].style.cursor = "default";
    }, [dealingCard]);

    // Set default cursor for all the player's cards when player cannot move them
    useEffect(() => {
        if (!playerCanMove) {
            holder.player.forEach((cardIdx) => {
                const card = stockCardsRefs.current[cardIdx];
                card.style.cursor = "default";
            });
        }
    }, [playerCanMove]);

    /************************************\
    *              SECTION 0             *
    **************************************
    *  Function to place card into hand  *
    \************************************/

    const placeCardIntoHand = (
        cardsRefs: React.MutableRefObject<HTMLDivElement[]>,
        handRef: React.RefObject<HTMLElement>,
        cardIndex: number,
        shouldMoveFromStock: boolean = true
    ) => {
        if (holder.stock.length === 0) console.warn("⚠ The Card Stock is empty.", cardIndex);

        if (!(cardsRefs.current || handRef.current)) return;

        let currentHand: number[]; // Either holder.player or holder.opponent

        // Move card's index number from stock array to either player or opponent's hand array
        if (handRef === playerHandRef) {
            faceUp(cardIndex); // Make cards face up in player's hand
            holder.player.push(cardIndex); // Add current card index to holder
            currentHand = holder.player; // Set working hand

            setHandFlow((prevState) => ({
                ...prevState,
                player: prevState.player + 1,
            }));
        } else {
            faceDown(cardIndex); // Make cards face down in opponent's hand
            holder.opponent.push(cardIndex); // Add current card index to holder
            currentHand = holder.opponent; // Set working hand

            setHandFlow((prevState) => ({
                ...prevState,
                opponent: prevState.opponent + 1,
            }));
        }

        if (shouldMoveFromStock && stockFlow.current) {
            holder.stock.pop(); // Remove card from stock
            stockFlow.current = stockFlow.current - 1; // Set stock flow one card less
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

    /************************************\
    *              SECTION 1             *
    **************************************
    *     Dealing cards on game start    *
    \************************************/

    // Deal 6 cards for each player when a user starts the game
    useEffect(() => {
        if (!gameStartState) return;

        // Play shuffle sound
        playShuffleSound();

        // If we are restoring session, grab cards to deal from the store
        if (restoreSession) {
            for (let i = 0; i < sessionProgress.HOLDER.player.length; i++) {
                placeCardIntoHand(stockCardsRefs, playerHandRef, sessionProgress.HOLDER.player[i], false);
            }
            for (let i = 0; i < sessionProgress.HOLDER.opponent.length; i++) {
                placeCardIntoHand(stockCardsRefs, opponentHandRef, sessionProgress.HOLDER.opponent[i], false);
            }
            setCardsAreDealt(true); // indicate that cards are dealt
            return;
        }

        // Deal the last 6 cards (taking from the top of the deck) to the player
        for (let i = 31; i >= 16; i--) {
            placeCardIntoHand(stockCardsRefs, playerHandRef, i);
        }

        // Deal next 6 cards to the opponent
        for (let i = 15; i >= 2; i--) {
            placeCardIntoHand(stockCardsRefs, opponentHandRef, i);
        }
        setCardsAreDealt(true); // indicate that cards are dealt
    }, [gameStartState]); // Execute only once i.e. when game starts

     /************************************\
     *              SECTION 2             *
     **************************************
     *    Managing cards layout display   *
     \************************************/

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

    // Observe handFlow.player and .opponent to detect when either of them
    // is big enough for overflow and if so, squeeze a hand
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

        for (let i = dealingCard.idxInHand - 1; i >= 0; i--) {
            const card = stock[handCards[i]];
            const prevLeft = card.offsetLeft;

            card.style.left = `${prevLeft + card.offsetWidth / (handCards.length < CARDS_WITHOUT_SQUEEZING ? 4 : 5)}px`;

            // Sometimes when a card goes to a deal, the mouseLeave function does not executes thus resets in
            // this function does not strike. To address this issue we reset the transform here as well.
            card.style.transform = `translate3d(calc(${cardsRawTranslateX[handCards[i]].per} + ${
                cardsRawTranslateX[handCards[i]].num
            }px), -50%, 0)`;
        }

        for (let i = dealingCard.idxInHand; i < handCards.length; i++) {
            const card = stock[handCards[i]];
            const prevLeft = card.offsetLeft;

            card.style.left = `${prevLeft - card.offsetWidth / (handCards.length < CARDS_WITHOUT_SQUEEZING ? 4 : 5)}px`;

            // Sometimes when a card goes to a deal, the mouseLeave function does not executes thus the resets in
            // this function does not strike. To address this issue we reset the transform here as well.
            card.style.transform = `translate3d(calc(${cardsRawTranslateX[handCards[i]].per} + ${
                cardsRawTranslateX[handCards[i]].num
            }px), -50%, 0)`;
        }
    }, [dealingCard]);

    /************************************\
    *              SECTION 3             *
    **************************************
    *    Handling hover on card event    *
    \************************************/

    const handleCardMouseOver = (e: React.MouseEvent<HTMLDivElement>, cardIndex: number) => {
        if (!(cardIndex && isCardInPlayerHand(cardIndex) && e.currentTarget && playerCanMove && !roundEndState)) return;

        e.currentTarget.style.transform = `translate3d(calc(${cardsRawTranslateX[cardIndex].per} + ${cardsRawTranslateX[cardIndex].num}px), ${handFlow.player >= CARDS_WITHOUT_SQUEEZING ? "-70%" : "-60%"}, 0)`;
        e.currentTarget.style.cursor = "grab";

        // If current card is the edge one - skip the expanding
        if (holder.player.indexOf(cardIndex) === holder.player.length - 1) return;

        expandCards(stockCardsRefs, cardIndex, holder.player, cardsRawTranslateX);
    };

    const handleCardMouseOut = (e: React.MouseEvent<HTMLDivElement>, cardIndex: number) => {
        if (!(cardIndex && isCardInPlayerHand(cardIndex) && e.currentTarget)) return;

        e.currentTarget.style.transform = `translate3d(calc(${cardsRawTranslateX[cardIndex].per} + ${cardsRawTranslateX[cardIndex].num}px), -50%, 0)`;
        // ... here we don't need to reset cursor since it is reset automatically when player can't move

        // If current card is the edge one - skip the constriction
        if (holder.player.indexOf(cardIndex) === holder.player.length - 1) return;

        resetExpandCards(stockCardsRefs, cardIndex, holder.player, cardsRawTranslateX);
    };

    /************************************\
    *              SECTION 4             *
    **************************************
    * Handling click/press on card event *
    \************************************/

     // Set `false` to prevent from triggering mouseUp handler, when card cannot be played
    const canHandleMouseUp = useRef(true);
    const handleCardMouseDown = (cardIndex: number) => {
        // Check if the clicked card is player's one, player can move and round is not over yet
        if (!(isCardInPlayerHand(cardIndex) && playerCanMove && !roundEndState)) return;

        // Reset to true from previous update to be able to handle the mouseUp if check above fails
        canHandleMouseUp.current = true;

        // When the stock is empty, according to the rules, we must oppose the card with the same suit as opponent's one
        if (!stockFlow.current && batchDealer === "opponent" && typeof opponentDealtCardIdx.current === "number") {
            if (deck[cardIndex].suit === deck[opponentDealtCardIdx.current].suit) return;
            // Prevent from handling mouseUp
            canHandleMouseUp.current = false;

            // If suits are not the same, show corresponding message
            setShowIncompatibleSuitMsg(true);
            setTimeout(() => setShowIncompatibleSuitMsg(false), ALERT_VISIBLE_TIME);
            return;
        }
    };

    const handleCardMouseUp = (cardIndex: number) => {
        // Check if the clicked card is player's one, player can move, round is not over yet and
        if (!(isCardInPlayerHand(cardIndex) && playerCanMove && !roundEndState && canHandleMouseUp.current)) return;
        (document.activeElement as HTMLElement)?.blur(); // when executing from keyPress event, remove focus from card

        const card = stockCardsRefs.current[cardIndex];
        const playerDeal = playerDealRef.current;
        const playArea = playAreaRef.current;
        const gameInterfaceScreen = gameInterfaceScreenRef.current;

        if (!(card && playerDeal && playArea && gameInterfaceScreen)) return;

        const playerDealTop = playerDeal.getBoundingClientRect().top,
            gameInterfaceTop = gameInterfaceScreen.getBoundingClientRect().top;

        setPlayerCanMove(false);

        // Set the number of cards in hand flow to one less to keep the original hand length
        setHandFlow((prevState) => ({
            ...prevState,
            player: prevState.player - 1,
        }));

        setDealingCard({
            idx: cardIndex!,
            idxInHand: holder.player.indexOf(cardIndex),
            origin: "player",
        });

        // Place card in the center of the player deal area
        card.style.top = `${playerDealTop - gameInterfaceTop + playerDeal.offsetHeight / 2}px`;
        card.style.left = `${playerDeal.offsetLeft + playerDeal.offsetWidth / 2}px`;
        card.style.transform = `translate3d(-50%, -50%, 0)`;

        setTimeout(() => playFlipSound(), CARD_FLIP_SOUND_DELAY); // Play flip sound with defined delay
    };

    // The first time a focused card is keyPressed, we extend the adjacent cards (for better observability),
    // and the second time that card is keyPressed, we put it into deal area. But if after the first time press
    // focus move onto the next (or prev) card, we should again expand cards and not put that card into the deal.
    // To create that behavior, each time when a focused card is keyPressed, we store its index in `cardWasPressedOnce`
    // and set `wasPressed` to true. And then if that same card is pressed again, we see that it was pressed once, so
    // we place the card into the deal area. And if the focus moves on, we reset `cardWasPressedOnce` with a new focused card.
    const cardWasPressedOnce = useRef({ idx: -1, wasPressed: false });
    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, cardIndex: number) => {
        if (!(e.key === "Enter" || e.key === " ")) return;

        // Expand cards on keyPress
        resetExpandCards(stockCardsRefs, cardWasPressedOnce.current.idx, holder.player, cardsRawTranslateX);

        // Check wether current card is the card, that was pressed previously and if so, place it
        // into the deal area. Else (this is another card) - store a new card and expand adjacent cards.
        if (!(cardWasPressedOnce.current.idx === cardIndex && cardWasPressedOnce.current.wasPressed)) {
            cardWasPressedOnce.current = { idx: cardIndex, wasPressed: true };
            expandCards(stockCardsRefs, cardIndex, holder.player, cardsRawTranslateX);
            return;
        }

        cardWasPressedOnce.current = { idx: cardIndex, wasPressed: false };
        handleCardMouseUp(cardIndex);
    }

    /************************************\
    *              SECTION 5             *
    **************************************
    *      Opponent's decision making    *
    \************************************/

    function addCardsFromStock() {
        if (!stockFlow.current) return;

        const timer = setTimeout(() => {
            // There is no change that stock would have odd number of cards, but still to be sure no errors
            // occur, check that stock has cards to move for each hand
            if (stockFlow.current) placeCardIntoHand(stockCardsRefs, playerHandRef, holder.stock[holder.stock.length - 1]);
            if (stockFlow.current) placeCardIntoHand(stockCardsRefs, opponentHandRef, holder.stock[holder.stock.length - 1]);
        }, ADD_CARDS_FROM_STOCK_DELAY);

        timeouts.push(timer);
    }

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
            // Remove one card from hand flow to keep original hand length
            setHandFlow((prevState) => ({
                ...prevState,
                opponent: prevState.opponent - 1,
            }));

            setDealingCard({
                idx: cardIdx,
                idxInHand: holder.opponent.indexOf(cardIdx),
                origin: "opponent",
            });

            setDealingCard(null);

            // Place card in the center of the opponent deal area
            card.style.transform = `translate3d(-50%, -50%, 0)`;
            card.style.top = `${opponentDealTop - gameInterfaceTop + opponentDeal.offsetHeight / 2}px`;
            card.style.left = `${opponentDeal.offsetLeft + opponentDeal.offsetWidth / 2}px`;

            setTimeout(() => playFlipSound(), CARD_FLIP_SOUND_DELAY); // Play flip sound with defined delay
        }, cardOpposingDelay);

        timeouts.push(timer);
    };

    /* Opponent's first move: either he starts game or won previous batch and starts current one */
    useEffect(() => {
        if (batchDealer === "opponent" && cardsAreDealt) {
            // Player cannot move while opponent is moving
            setPlayerCanMove(false);

            // Opponent plays card
            placeOpponentCardDeal(choosePlayingCard(holder.opponent, deck));

            const timer = setTimeout(() => {
                // Now, after the move is done (with delay of 0.5s), player can move
                setPlayerCanMove(true);
            }, cardOpposingDelay + 1000); // add 1s to prevent player from moving immediately after opponent's moved

            timeouts.push(timer);

            return () => clearTimeout(timer);
        }
    }, [batchDealer, cardsAreDealt]);

    /* Opponent's last move: when player has already mode a move, opponent answers */
    useEffect(() => {
        if (!dealingCard) return; // To prevent first call

        if (batchDealer === "player" && dealingCard.origin === "player") {
            // Player cannot move while opponent is moving
            setPlayerCanMove(false);

            // Opponent places card into deal area
            const opposingCard = chooseOpposingCard(dealingCard.idx, holder.opponent, deck, stockFlow.current)
            placeOpponentCardDeal(opposingCard);
        }
    }, [dealingCard]);

    /************************************\
    *              SECTION 6             *
    **************************************
    *         Choosing winning side      *
    \************************************/

    // When both sides put their cards, decide which one win and move cards to the corresponding hand
    useEffect(() => {
        if (!dealingCard) return;
        if (
            !(
                typeof playerDealtCardIdx.current === "number" &&
                typeof opponentDealtCardIdx.current === "number" &&
                !showPlayerNoCard
            )
        )
            return;

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
                // FIX?: some sort of delay to be sure that when cards are squeezing (i.e. when hand overflow), the previous
                // card placed in a hand is already squeezed, since we reference the last card that is squeezed
                const timer1 = setTimeout(() => placeCardIntoHand(stockCardsRefs, winningHand, opponentDealtCardIdx.current!, false), 0);

                addCardsFromStock();

                const timer2 = setTimeout(() => {
                    setBatchDealer(null);
                    setBatchDealer(side);
                    setPlayerCanMove(side === "player"); // if player won prev batch, he moves first next one
                    playerDealtCardIdx.current = null;
                    opponentDealtCardIdx.current = null;
                }, DEFINE_WINNING_SIDE_CLEARING);

                timeouts.push(timer1);
                timeouts.push(timer2);
            }, CARDS_IN_DEAL_DURATION);

            timeouts.push(timer);
        }

        if (batchDealer === "player") {
            if (playerCard.suit === opponentCard.suit) {
                if (
                    (normalizedRank(playerCard.rank) > normalizedRank(opponentCard.rank)) &&
                    !(playerCard.rank === "ace" && opponentCard.rank === 7)
                ) {
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
                if (
                    (normalizedRank(opponentCard.rank) > normalizedRank(playerCard.rank)) &&
                    !(opponentCard.rank === "ace" && playerCard.rank === 7)
                ) {
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
    }, [dealingCard]);

    /************************************\
    *              SECTION 7             *
    **************************************
    *               Round end            *
    \************************************/

    // Check if there are cards in player's hand to answer the opponent. If there are no cards,
    // announce the end of the round and start counting points
    useEffect(() => {
        // Crucial condition: card, that triggers this effect must be from opponent on his batch
        if (!(!stockFlow.current && dealingCard && dealingCard.origin === "opponent" && batchDealer === "opponent")) return;

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

            // Since opponent have already put his card into the deal and the round has ended,
            // we put the card's index back to his hand to include it into honor counting
            holder.opponent.push(dealingCard.idx);
        }
    }, [dealingCard, batchDealer]);

    // Additional styling to indicate that there are no cards in player's hand to answer the opponent
    useEffect(() => {
        if (showPlayerNoCard) {
            setRoundEndState(true);
            holder.player.forEach((card) => {
                stockCardsRefs.current[card].style.filter = "brightness(0.8) grayscale(0.8)";
            });
        }
    }, [showPlayerNoCard]);

    // Additional styling to indicate that there are no cards in opponent's to answer the player
    useEffect(() => {
        if (showOpponentNoCard) {
            setRoundEndState(true);
            holder.opponent.forEach((card) => {
                stockCardsRefs.current[card].style.filter = "brightness(0.8) grayscale(0.8)";
            });
        }
    }, [showOpponentNoCard]);

    /************************************\
    *              SECTION 8             *
    **************************************
    *            Display scoring         *
    \************************************/

    // After the round is over, show score board with delay
    const [showScoreBoard, setShowScoreBoard] = useState(false);
    useEffect(() => {
        if (roundEndState) {
            // When round is over and any card is in the deal, return in to the origin hand
            if (dealingCard) {
                if (dealingCard.origin === "player") holder.player.push(dealingCard.idx);
                else holder.opponent.push(dealingCard.idx);
            }

            const timer = setTimeout(() => {
                // Hide no card warning
                setShowPlayerNoCard(false);
                setShowOpponentNoCard(false);

                // Show score board
                setShowScoreBoard(true);
            }, SHOW_SCORING_WIN_DELAY);
            timeouts.push(timer);
            return () => clearTimeout(timer);
        }
    }, [roundEndState]);

    // After the score board is showed (just starting point), we calculate the number of honors
    // in each hand, and save it into `roundHonors`, which will be passed to the scoring window
    const [roundHonors, setRoundHonors] = useState<IHonors | null>(null);
    useEffect(() => {
        if (!showScoreBoard) return;

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
    }, [showScoreBoard]);

    /************************************\
    *              SECTION 9             *
    **************************************
    *             Game reset             *
    \************************************/

    // Reset all internal states when setting up a new game
    useEffect(() => {
        if (!gameStartState) return;

        if (!(gameInterfaceScreenRef.current && stockRef.current)) return;

        setGameStartState((prevState) => !prevState);

        // Regenerate a new deck
        deck = Deck.createDeck();

        // Clear all timeouts fired before
        timeouts.forEach((t) => clearTimeout(t));
        timeouts.length = 0;

        for (const t in cardsRawTranslateX) delete cardsRawTranslateX[t];

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

        // Reset shirts
        setShirtStates(deck.map(() => true));

        // Reset holder
        holder.stock = [...Array(CARDS_IN_DECK + 1).keys()];
        holder.player.length = 0;
        holder.opponent.length = 0;

        stockFlow.current = holder.stock.length;

        // Reset stylings that could be applied due to absent of cards to answer
        holder.stock.forEach((card) => {
            stockCardsRefs.current[card].style.filter = "";
        });

        // Reset to null to be sure that any card (that was in a deal) is movable again
        setDealingCard(null);

        setCardsAreDealt(false);

        const defineBatchDealer = _.randIntRange(0, 1) ? "player" : "opponent";
        setBatchDealer(defineBatchDealer);

        setPlayerCanMove(defineBatchDealer === "player");

        setHandFlow({
            player: 0,
            opponent: 0,
        });

        lastCardBy.current = undefined;

        setPlayerCanMove(defineBatchDealer === "player");

        setShowPlayerNoCard(false);
        setShowOpponentNoCard(false);
        setShowIncompatibleSuitMsg(false);

        setRoundEndState(false);

        playerDealtCardIdx.current = undefined;
        opponentDealtCardIdx.current = undefined;

        wasPlayerSqueezed.current = false;
        wasOpponentSqueezed.current = false;

        canHandleMouseUp.current = true;

        cardWasPressedOnce.current = { idx: -1, wasPressed: false };

        setShowScoreBoard(false);

        setRoundHonors(null);
    }, [gameResetState]); // No need to include gameStartState as it would re-render the game start state

    /************************************\
    *             SECTION 10             *
    **************************************
    *       Storing session on quit      *
    \************************************/

    // When got storeSession signal (after a user confirmed quit button) - store `deck`, `holder` and `batchDealer` in
    // redux store (the dispatch will be intercepted in SettingsMenu and the redux store will be written to the config)
    useEffect(() => {
        if (storeSessionSignal) {
            setProgress({
                DECK: deck,
                HOLDER: holder,
                BATCH_DEALER: batchDealer,
            });
        }
    }, [storeSessionSignal]);

    return (
        <React.Fragment>
            {showScoreBoard && roundHonors && (
                <Modal isOpen={true} toggle={() => {}} unclosable={true} disableScrollBar>
                    <ScoreBoard honors={roundHonors!} handleNextRound={setGameResetState} />
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
                                tabIndex={isCardInPlayerHand(i) ? 35 - i : -1}
                                onMouseEnter={(e) => handleCardMouseOver(e, i)}
                                onMouseLeave={(e) => handleCardMouseOut(e, i)}
                                onMouseDown={() => handleCardMouseDown(i)}
                                onMouseUp={() => handleCardMouseUp(i)}
                                onKeyDown={(e) => handleKeyDown(e, i)}
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
                            <Alert isMounted={showIncompatibleSuitMsg} msg={`👉 ${t("pop-up.incomp-suits")}`} />
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
                                    {sessionStats.CURRENT_SCORE.opponent}
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
                                ></div>
                                <div
                                    className="Deal-Player h-full ml-[6%]
                        border-[3px] md:border-4 xl:border-[6px] border-green-300 border-dashed"
                                    style={{
                                        width: `calc(${cardLinkerAPI.cardWidth}px + 3%)`,
                                        borderRadius: cardLinkerAPI.cardBorderRadius,
                                    }}
                                    ref={playerDealRef}
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
                                    {sessionStats.ROUND_STATS.current}
                                </h1>
                                <h1
                                    className="absolute left-0 text-center text-green-800 lg:text-5xl brightness-90"
                                    style={{
                                        width: `${CARD_SIZE + 3}%`,
                                    }}
                                >
                                    {sessionStats.CURRENT_SCORE.player}
                                </h1>
                            </div>
                        </React.Fragment>
                    )}
                    {useMemo(
                        () => (
                            <NewGameButton gameStartState={gameStartState} gameResetHandler={setGameResetState} />
                        ),
                        [gameStartState]
                    )}
                </div>
            </div>
        </React.Fragment>
    );
};

export default GameInterface;
