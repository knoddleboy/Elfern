import { TDeck } from "@utils/generateDeck";
import { TTranslationCountryCodes } from "@src/types";

export interface IGlobalSettingsDefaults {
    /** Set `true` to enable application audio */
    ENABLE_AUDIO: boolean;

    /** Application language */
    LANGUAGE: TTranslationCountryCodes;
}

export interface IActiveSessionDefaults {
    /** When set `false`, considered that a user has once started to play, but decided to quit thus storing the session.
     *
     * On each game open, this param is compared with its initial value of `true` and if they are the same it means that
     * there were no stored session. If they differ, it means that there might be a stored session. */
    INITIAL_SETUP: boolean;

    /** Saved session's stats: score and rounds */
    STATS: {
        /** Current player's and opponent's scores */
        CURRENT_SCORE: {
            player: number;
            opponent: number;
        };
        /** Round stats: current round and the max one */
        ROUND_STATS: {
            current: number;
            max: number;
        };
    };

    /** Saved session's progress: deck, holder cards and batch dealer  */
    PROGRESS: {
        /** Deck from the previous game */
        DECK: TDeck;

        /** Holder. that holds card indices of each side and stock */
        HOLDER: {
            stock: number[];
            player: number[];
            opponent: number[];
        };

        /** The last batch dealer, i.e. the last side that have made (or should have...) the first move */
        BATCH_DEALER: null | "player" | "opponent";
    };
}
