import useElementSize from "@utils/hooks/useElementSize";
import _ from "@utils/_";

import { ICardDisplayProps, ICardComponentParameters } from "./CardLinker.types";
import { CARD_ASPECT_RATIO } from "@src/constants";

/**
 * Helper class that provides methods for receiving card's parameters,
 * that are calculated based on real playing cards' params
 */
class CardLinkerAPI implements ICardComponentParameters, ICardDisplayProps {
    constructor(public cardSize: number, public relativeElement: { ref: React.RefObject<HTMLElement> }) {}

    // Get via provided ref element, relative to which card's parameters will be calculated
    private readonly relativeElementSize = useElementSize(this.relativeElement?.ref);

    /** Card component width. */
    get cardWidth() {
        return _.toFixed((this.cardSize * this.relativeElementSize.width!) / 100, 3);
    }

    /** Card component height. */
    get cardHeight() {
        return _.toFixed(this.cardWidth / CARD_ASPECT_RATIO, 3);
    }

    /** Represents sizes of both `rank` and `suit` elements as their sizes should be the same. */
    get cardRankSuitSize() {
        return _.toFixed(this.cardWidth / 3.6, 3);
    }

    /** Represents _top, left and right_ margins of rank and suit block. */
    get cardRankSuitAdjustmentMargins() {
        return _.toFixed(this.cardWidth / 29, 3);
    }

    /** Size of card's figure. */
    get cardFigureSize() {
        return _.toFixed(this.cardWidth / 1.2, 3);
    }

    /** Card's figure bottom margin. */
    get cardFigureBottomIndent() {
        return _.toFixed(this.cardHeight / 25, 3);
    }

    /** Card component edge padding. */
    get cardEdgePadding() {
        return _.toFixed(this.cardWidth / 22.7, 3);
    }

    /** Card component border radius. */
    get cardBorderRadius() {
        return _.toFixed(this.cardWidth / 12, 3);
    }
}

export default CardLinkerAPI;
