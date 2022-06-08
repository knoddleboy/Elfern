import { CARDS_WITHOUT_SQUEEZING, CARDS_IN_EXPAND_NUMBER } from "@src/constants";
import React from "react";

/** When hovering on a card, adjacent cards are expanding to make it easier to see the hovered card */
export function expandCards(
    stockCardsRefs: React.MutableRefObject<HTMLDivElement[]>,
    cardIndex: number,
    playerHand: number[],
    cardsRawTranslateX: Record<
        string,
        {
            per: string;
            num: string;
        }
    >
) {
    const expandingValue = playerHand.length < CARDS_WITHOUT_SQUEEZING ? 1.62 : 2;

    const _cardIdxInHand = playerHand.indexOf(cardIndex);
    let lLeap = 0;

    // Expands left hand side
    for (
        let i = _cardIdxInHand - 1, e = expandingValue;
        i >= _cardIdxInHand - CARDS_IN_EXPAND_NUMBER - lLeap && lLeap < 2;
        i--, e++
    ) {
        const currentCardIdx = playerHand[i];
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
        i <= _cardIdxInHand + CARDS_IN_EXPAND_NUMBER + rLeap && rLeap < 2;
        i++, e++
    ) {
        const currentCardIdx = playerHand[i];
        const card = stockCardsRefs.current[currentCardIdx];
        if (!card) {
            rLeap++;
            continue;
        }

        card.style.transform = `translate3d(calc(${cardsRawTranslateX[currentCardIdx].per} + ${
            cardsRawTranslateX[currentCardIdx].num
        }px + ${card.offsetWidth / 2 ** (e - rLeap)}px), -50%, 0)`;
    }
}

/** Resets expanding on hover */
export function resetExpandCards(
    stockCardsRefs: React.MutableRefObject<HTMLDivElement[]>,
    cardIndex: number,
    playerHand: number[],
    cardsRawTranslateX: Record<
        string,
        {
            per: string;
            num: string;
        }
    >
) {
    const expandingValue = playerHand.length < CARDS_WITHOUT_SQUEEZING ? 1.62 : 2;

    const _cardIdxInHand = playerHand.indexOf(cardIndex);
    let lLeap = 0;

    // Reset expanding of the left hand side
    for (
        let i = _cardIdxInHand - 1, e = expandingValue;
        i >= _cardIdxInHand - CARDS_IN_EXPAND_NUMBER - lLeap && lLeap < 2;
        i--, e++
    ) {
        const currentCardIdx = playerHand[i];
        const card = stockCardsRefs.current[currentCardIdx];
        if (!card) {
            lLeap++;
            continue;
        }

        card.style.transform = `translate3d(calc(${cardsRawTranslateX[playerHand[i]].per} + ${
            cardsRawTranslateX[playerHand[i]].num
        }px), -50%, 0)`;
    }

    let rLeap = 0;

    // Reset expanding of the right hand side
    for (
        let i = _cardIdxInHand + 1, e = expandingValue;
        i <= _cardIdxInHand + CARDS_IN_EXPAND_NUMBER + rLeap && rLeap < 2;
        i++, e++
    ) {
        const currentCardIdx = playerHand[i];
        const card = stockCardsRefs.current[currentCardIdx];
        if (!card) {
            rLeap++;
            continue;
        }

        card.style.transform = `translate3d(calc(${cardsRawTranslateX[playerHand[i]].per} + ${
            cardsRawTranslateX[playerHand[i]].num
        }px), -50%, 0)`;
    }
}
