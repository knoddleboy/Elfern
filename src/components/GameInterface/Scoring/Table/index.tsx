import React from "react";
import CountUp from "react-countup";

import useTranslation from "@utils/hooks/useTranslation";

import { APPLICATION_MEDIA } from "@constants/global";
import { CardRank, SUITS } from "@utils/CardLinker/CardLinker.types";

import "./index.scss";

interface ITable {
    caption: string;
    sideHonors: { [key in CardRank]: number };
    animationDelay?: number;
    className?: string;
}

interface ITableRow {
    delay: number;
    endHonor: number;
    duration?: number;
    animationDelay?: number;
}

const TableRow: React.FC<ITableRow> = ({ delay, endHonor, duration = 0.5, animationDelay }) => (
    <th>
        <CountUp delay={(animationDelay || 0) + delay} end={endHonor} duration={duration} />
    </th>
);

const Table: React.FC<ITable> = ({ caption, sideHonors, animationDelay, className }) => {
    const { t } = useTranslation();

    return (
        <table className={`${className} w-full table-fixed text-dark-500`}>
            <caption className="text-left mb-2 text-md font-medium uppercase text-dark-300">{caption}</caption>
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
                    {SUITS.map((s, i) => (
                        <TableRow key={i} delay={0.3 * i} endHonor={sideHonors[s]} animationDelay={animationDelay} />
                    ))}
                </tr>
            </tbody>
        </table>
    );
};

export default Table;
