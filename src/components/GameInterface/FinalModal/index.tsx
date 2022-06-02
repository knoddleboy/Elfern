import React from "react";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import CustomButton from "@components/CustomButton";
import Retry from "@mui/icons-material/RefreshRounded";

import useTranslation from "@utils/hooks/useTranslation";
import _ from "@utils/_";
import { formatTime } from "@utils/utils";

import { EMOJIS } from "@constants/global";
import { ReactSetState } from "@src/types";

const FinalModal: React.FC<{ state: keyof typeof EMOJIS; handleFinalReset: ReactSetState }> = ({
    state,
    handleFinalReset,
}) => {
    //* External state management
    const dispatch = useDispatch();
    const { setRoundStats, setTimerState, setCurrentScore } = bindActionCreators(actionCreators, dispatch);

    const timerState = useSelector((state: State) => state.TIMER_STATE);
    const currentScore = useSelector((state: State) => state.CURRENT_SCORE);

    const { t } = useTranslation();

    // If player'he been playing for less that hour, remove hours zero: 0:00:00 -> 00:00
    function removeHoursZero(time: number) {
        const timeStringified = formatTime(time);
        if (timeStringified[0] === "0") return timeStringified.slice(-5);
        return timeStringified;
    }

    return (
        <div className="pt-4">
            <h1 className="uppercase text-center text-[4vw] text-dark-700">
                {_.choice(EMOJIS[state])} {t(`game-end.${state}`)}
            </h1>
            <div className="flex flex-col px-6 py-20">
                <div className="flex justify-between pb-1">
                    <span className="uppercase text-base text-dark-400 font-semibold">{t("game-end.points")}</span>
                    <span className="font-bold text-xl text-dark-600">{currentScore.player}</span>
                </div>
                <div className="flex justify-between pt-1">
                    <span className="uppercase text-base text-dark-400 font-semibold">{t("game-end.time")}</span>
                    <span className="font-bold text-xl text-dark-600">{removeHoursZero(timerState.time)}</span>
                </div>
            </div>
            <div className="w-full flex justify-around p-1">
                <CustomButton
                    className="w-1/5 aspect-square rounded-full bg-blue-500 font-medium text-white-text border-4 border-[#005382]"
                    onClick={() => window.location.reload()}
                >
                    OK
                </CustomButton>
                <CustomButton
                    className="rounded-full"
                    onClick={() => {
                        setRoundStats({
                            current: 1,
                            max: 1,
                        });
                        setTimerState({
                            ...timerState,
                            time: 0,
                            reset: true,
                        });
                        setCurrentScore({
                            player: 0,
                            opponent: 0,
                        });
                        handleFinalReset((prev) => !prev);
                    }}
                >
                    <Retry className="text-dark-600" sx={{ fontSize: "5.5vw" }} />
                </CustomButton>
            </div>
        </div>
    );
};

export default FinalModal;
