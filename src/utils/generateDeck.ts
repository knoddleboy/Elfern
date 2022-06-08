import _ from "@utils/_";

export default class Deck {
    private static ranks = ["ace", "king", "queen", "jack", 10, 9, 8, 7] as const;
    private static suits = ["clubs", "diamonds", "hearts", "spades"] as const;

    public static createDeck = () => {
        let deck = [];

        for (let rankIndex = 0; rankIndex < this.ranks.length; rankIndex++) {
            for (let suitIndex = 0; suitIndex < this.suits.length; suitIndex++) {
                deck.push({
                    rank: this.ranks[rankIndex],
                    suit: this.suits[suitIndex],
                });
            }
        }

        return _.shuffle(deck);
    };
}

export type TDeck = ReturnType<typeof Deck.createDeck>;
