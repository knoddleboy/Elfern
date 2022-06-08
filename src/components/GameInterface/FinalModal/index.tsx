import React from "react";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import CustomButton from "@components/CustomButton";
import Retry from "@mui/icons-material/RefreshRounded";

import useTranslation from "@utils/hooks/useTranslation";
import _ from "@utils/_";

import { EMOJIS } from "@src/constants";
import { ReactSetState } from "@src/types";

const FinalModal: React.FC<{ state: keyof typeof EMOJIS; handleFinalReset: ReactSetState }> = ({
    state,
    handleFinalReset,
}) => {
    const dispatch = useDispatch();
    const { setStats } = bindActionCreators(actionCreators, dispatch);
    const currentScore = useSelector((state: State) => state.STATS.CURRENT_SCORE);

    const { t } = useTranslation();

    const clickHandler = () => {
        // Reset game state on retry
        setStats({
            ROUND_STATS: {
                current: 1,
                max: 1,
            },
            CURRENT_SCORE: {
                player: 0,
                opponent: 0,
            },
        });
        handleFinalReset((prev) => !prev);
    };

    return (
        <div className="sm:pb-1 lg:py-2">
            <h1 className="px-4 uppercase text-center text-3xl-adapt text-dark-700 !leading-relaxed">
                {_.choice(EMOJIS[state])} {t(`game-end.${state}`)}
            </h1>
            <div className="flex justify-between items-center sm:px-10 sm:py-10 lg:px-16 lg:py-14">
                <span className="uppercase sm:text-base lg:text-lg text-dark-400 font-semibold">
                    {t("game-end.points")}
                </span>
                <span className="font-bold sm:text-xl lg:text-2xl text-dark-600">{currentScore.player}</span>
            </div>
            <div className="w-full flex justify-around">
                <CustomButton
                    className="sm:w-1/5 lg:w-14 aspect-square rounded-full bg-blue-500 font-medium text-white-text border-4 border-[#005382]"
                    onClick={() => window.location.reload()}
                >
                    OK
                </CustomButton>
                <CustomButton className="sm:w-1/5 lg:w-14 aspect-square rounded-full" onClick={clickHandler}>
                    <Retry className="h-full aspect-square text-dark-600" sx={{ fontSize: 42 }} />
                </CustomButton>
            </div>
        </div>
    );
};

export default FinalModal;
