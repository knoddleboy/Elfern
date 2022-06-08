import { normalizedRank } from "@utils/utils";
import _ from "@utils/_";

import { TDeck } from "@utils/generateDeck";
import { NO_CARD_AVAILABLE } from "@src/constants";
import { SUITS } from "@src/utils/CardLinker/CardLinker.types";

/** Returns a card from a `hand` with the lowest rank */
export function cardWithMinimalRank(
    hand: number[],
    deck: TDeck,
    excludeRank?: Array<TDeck[number]["rank"]>,
    excludeSuit?: Array<TDeck[number]["suit"]>
) {
    let [minRankCard, minRankCardIdx] = [15, -1]; // 15 since there is no card higher in rank than 14
    hand.forEach((cardIdx) => {
        if (
            normalizedRank(deck[cardIdx].rank) < minRankCard &&
            (excludeRank ? !excludeRank.includes(deck[cardIdx].rank) : true) &&
            (excludeSuit ? !excludeSuit.includes(deck[cardIdx].suit) : true)
        ) {
            minRankCard = normalizedRank(deck[cardIdx].rank);
            minRankCardIdx = cardIdx;
        }
    });

    return minRankCardIdx;
}

/** Returns a card from a `hand` with the highest rank */
export function cardWithMaximalRank(
    hand: number[],
    deck: TDeck,
    excludeRank?: Array<TDeck[number]["rank"]>,
    excludeSuit?: Array<TDeck[number]["suit"]>
) {
    let [maxRankCard, maxRankCardIdx] = [0, -1]; // 0 since there is no card lower in rank than 0
    hand.forEach((cardIdx) => {
        if (
            normalizedRank(deck[cardIdx].rank) > maxRankCard &&
            (excludeRank ? !excludeRank.includes(deck[cardIdx].rank) : true) &&
            (excludeSuit ? !excludeSuit.includes(deck[cardIdx].suit) : true)
        ) {
            maxRankCard = normalizedRank(deck[cardIdx].rank);
            maxRankCardIdx = cardIdx;
        }
    });

    return maxRankCardIdx;
}

/** Returns `true` if a card of `suit` exists in a `hand` */
function checkSuitExists(hand: number[], suit: TDeck[number]["suit"], deck: TDeck) {
    return hand.filter((cardIdx) => deck[cardIdx].suit === suit).length;
}

/** Returns all suits except for the one provided in `suitToExcept` */
function exceptSuit(suitToExcept: TDeck[number]["suit"]) {
    return SUITS.filter((suit) => suit !== suitToExcept);
}

/** Returns a card from opponent's hand to place first */
export function choosePlayingCard(opponentHand: number[], deck: TDeck) {
    // Check if there are aces in opponent's hand
    const aces = opponentHand.filter((cardIdx) => deck[cardIdx].rank === "ace");
    if (aces.length) {
        // if there are aces ...
        const acesSuits = aces.map((aceIdx) => deck[aceIdx].suit); // ... get aces suits

        // And if there are sevens of the same suit as aces ...
        const reservedSevens = opponentHand.filter(
            (cardIdx) => deck[cardIdx].rank === 7 && acesSuits.includes(deck[cardIdx].suit)
        );
        // ... we can play one of the aces since we are sure that a played ace won't be beaten by player.
        // NOTE: I set the probability of that move to 60% so the AI is not so perfect and could make
        // a mistake: put not an ace but another card, thereby giving a head start to the player
        if (reservedSevens.length && Math.random() < 0.6) return _.choice(aces);
    }

    // Otherwise play a card with the highest rank
    return cardWithMaximalRank(opponentHand, deck, ["ace"]);
}

/** Returns a card from opponent's hand to answer the player's card. Is there is no such card, returns NO_CARD_AVAILABLE */
export function chooseOpposingCard(playerCardIdx: number, opponentHand: number[], deck: TDeck, stockFlow: number) {
    const playerCard = deck[playerCardIdx];

    // If it is the second game phase and opponent don't have cards to answer player, end the game
    if (!stockFlow && !checkSuitExists(opponentHand, playerCard.suit, deck)) return NO_CARD_AVAILABLE;

    // The number of sevens in the hand
    const sevensInHand = opponentHand.filter((cardIdx) => deck[cardIdx].rank === 7);

    // If player player ace, we should check if opponent has 7 with the same suit to beat that ace
    if (playerCard.rank === "ace" && sevensInHand.length) {
        const beatingSevenIdx = sevensInHand.filter((sevenIdx) => deck[sevenIdx].suit === playerCard.suit);
        if (beatingSevenIdx[0]) return beatingSevenIdx[0];
    }

    // Set of cards that can beat player's one
    const possibleBeatingCardsIdc = opponentHand.filter(
        (cardIdx) =>
            deck[cardIdx].suit === playerCard.suit && normalizedRank(deck[cardIdx].rank) > normalizedRank(playerCard.rank)
    );

    // Set of unnecessary cards: 8 and 9
    const unnecessaryCards = opponentHand.filter(
        (cardIdx) =>
            normalizedRank(deck[cardIdx].rank) >= 8 &&
            normalizedRank(deck[cardIdx].rank) < 10 &&
            (!stockFlow ? deck[cardIdx].suit === playerCard.suit : true)
    );

    const exceptSuitsOnSecondPhase = !stockFlow ? exceptSuit(playerCard.suit) : undefined;

    // Check if player's dealt card is indeed needed: 7 or 10-A
    if (normalizedRank(playerCard.rank) >= 10 || normalizedRank(playerCard.rank) === 7) {
        // If we can beat the card, return one with the lowest rank
        if (possibleBeatingCardsIdc.length) return cardWithMinimalRank(possibleBeatingCardsIdc, deck);

        // If we can't beat the card but we have unnecessary ones, return the lowest in rank unnecessary card
        if (unnecessaryCards.length)
            return cardWithMinimalRank(unnecessaryCards, deck, undefined, exceptSuitsOnSecondPhase);

        // Else return the lowest in rank card, excluding 7 and if stock is empty - all suits except for player's one
        return cardWithMinimalRank(opponentHand, deck, [7], exceptSuitsOnSecondPhase);
    }

    // If the player's card is 8-9, we don't need it
    if (normalizedRank(playerCard.rank) > 7 && normalizedRank(playerCard.rank) < 10) {
        // So if there are unnecessary cards, return one with the lowest rank but, if it is first
        // the phase with another suit to not beat the player's
        if (unnecessaryCards.length)
            return cardWithMinimalRank(
                unnecessaryCards,
                deck,
                undefined,
                stockFlow ? [playerCard.suit] : exceptSuit(playerCard.suit)
            );

        // else in order not to lose honors, opponent have to beat the player's card
        if (possibleBeatingCardsIdc.length) return cardWithMinimalRank(possibleBeatingCardsIdc, deck);

        // and if the opponent can't even beat the card, he is forced to lose one of his honor (the lowest one in rank)
        return cardWithMinimalRank(opponentHand, deck, undefined, exceptSuitsOnSecondPhase);
    }

    // Otherwise end the game
    return NO_CARD_AVAILABLE;
}
