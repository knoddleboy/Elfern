import React from "react";
import CountUp from "react-countup";

import useTranslation from "@utils/hooks/useTranslation";
import { CardRank, RANKS } from "@utils/CardLinker/CardLinker.types";

import "./index.scss";

interface ITable {
    /** Table caption */
    caption: string;

    /** Player's and opponent's honors, gained while playing */
    sideHonors: { [key in CardRank]: number };

    /** Countup animation delay */
    animationDelay?: number;

    className?: string;
}

interface ITableRow {
    /** Set to animate step by step each countup */
    delay: number;

    /** Highest honor to countup to */
    endHonor: number;

    /** Animation start delay */
    animationDelay?: number;

    /** Animation duration */
    duration?: number;
}

const TableRow: React.FC<ITableRow> = ({ delay, endHonor, animationDelay = 0, duration = 0.5 }) => (
    <th>
        <CountUp delay={animationDelay + delay} end={endHonor} duration={duration} />
    </th>
);

const Table: React.FC<ITable> = ({ caption, sideHonors, animationDelay = 0, className }) => {
    const { t } = useTranslation();

    const totalHonors =
        (sideHonors[10] || 0) +
        (sideHonors.jack || 0) +
        (sideHonors.queen || 0) +
        (sideHonors.king || 0) +
        (sideHonors.ace || 0);

    return (
        <table className={`${className} w-full table-fixed text-dark-500`}>
            <caption className="text-left mb-2 sm:text-base lg:text-lg font-medium uppercase text-dark-300">
                {caption}
            </caption>
            <thead>
                <tr>
                    <th>7</th>
                    <th>8</th>
                    <th>9</th>
                    <th>10</th>
                    <th>{t("scoring.pictured-ranks.jack")}</th>
                    <th>{t("scoring.pictured-ranks.queen")}</th>
                    <th>{t("scoring.pictured-ranks.king")}</th>
                    <th>{t("scoring.pictured-ranks.ace")}</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    {RANKS.map((s, i) => (
                        <TableRow key={i} delay={0.3 * i} endHonor={sideHonors[s]} animationDelay={animationDelay} />
                    ))}
                </tr>
                <tr id="table-summary">
                    <th colSpan={7} className="text-left">
                        {t("scoring.summary")}
                    </th>
                    <th>{<CountUp delay={animationDelay + 0.3 * 10} end={totalHonors} duration={1} />}</th>
                </tr>
            </tbody>
        </table>
    );
};

export default Table;
