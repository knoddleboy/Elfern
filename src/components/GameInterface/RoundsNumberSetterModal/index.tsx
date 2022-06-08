import React, { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import useWindowSize from "@utils/hooks/useWindowSize";
import useTranslation from "@utils/hooks/useTranslation";

import CustomButton from "@src/components/CustomButton";
import Modal, { IModal } from "@components/Modal";
import ModalCloseButton from "@components/Modal/ModalCloseButton";
import { INewGameButton } from "../NewGameButton";

import ArrowBack from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForward from "@mui/icons-material/ArrowForwardIosRounded";

type TRoundsNumberSetterModal = Pick<
    IModal & INewGameButton,
    "isOpen" | "size" | "toggle" | "unclosable" | "gameResetHandler"
>;

// This component mounts only once pre active session since when a user decides to start a new game,
// he would already be suggested to chose the number of rounds.Therefore we don't need to ask him/her again.
const RoundsNumberSetterModal: React.FC<TRoundsNumberSetterModal & { showModalClose?: boolean }> = ({
    isOpen,
    size,
    toggle,
    gameResetHandler,
    unclosable,
    showModalClose = true,
}) => {
    const dispatch = useDispatch();
    const { setStats } = bindActionCreators(actionCreators, dispatch);
    const stats = useSelector((state: State) => state.STATS);
    const roundStats = useSelector((state: State) => state.STATS.ROUND_STATS);

    // Store rounds to mutate inside the component
    const [rounds, setRounds] = useState(roundStats.current);

    const { width } = useWindowSize();
    const { t } = useTranslation();

    const addRemoveRounds = (direction: -1 | 1) => () => {
        // Prevent rounds go less than 1 on key press
        if (direction === -1 && rounds <= 1) return;
        setRounds((prev) => prev + direction);
    };

    // Set max number of rounds
    useEffect(() => {
        setStats({
            ...stats,
            ROUND_STATS: {
                current: roundStats.current,
                max: rounds,
            },
        });
    }, [rounds]);

    return (
        <Modal isOpen={isOpen} size={size} toggle={toggle} unclosable={unclosable} disableScrollBar>
            <div className="h-full text-center text-dark-600 flex flex-col justify-between">
                <h1>{t("new-game.title")}</h1>
                <div
                    className="w-2/3 flex items-center sm:text-4xl md:text-6xl"
                    style={{
                        margin: `${width < 1024 ? "15%" : "20%"} auto`,
                    }}
                >
                    <CustomButton
                        className="h-min flex-center rounded-[25%]"
                        onClick={addRemoveRounds(-1)}
                        disabledStyles={
                            // When round is less than 1, disable button
                            rounds <= 1
                                ? {
                                      filter: "brightness(2)",
                                  }
                                : undefined
                        }
                        preventAudio={rounds <= 1}
                    >
                        <ArrowBack sx={{ fontSize: 42 }} />
                    </CustomButton>
                    <span
                        className={`flex-1 ${rounds < 10 ? "sm:w-8 md:w-12" : "sm:w-12 md:w-20"} sm:text-4xl md:text-6xl`}
                    >
                        {rounds}
                    </span>
                    <CustomButton className="h-min flex-center rounded-[25%]" onClick={addRemoveRounds(1)}>
                        <ArrowForward sx={{ fontSize: 42 }} />
                    </CustomButton>
                </div>
                <div className="w-full flex justify-around items-center">
                    <CustomButton
                        className="dialog-close
                            sm:w-2/5 md:w-5/12 py-1
                            transition-colors
                            text-white-text sm:text-sm md:text-lg uppercase
                            bg-[#42A5F5] hover:bg-[#1E88E5]
                            rounded-2xl
                        "
                        onClick={() => gameResetHandler((prevState) => !prevState)}
                        preventAudio={!showModalClose}
                    >
                        {t("new-game.confirm-button")}
                    </CustomButton>
                    {showModalClose && <ModalCloseButton className="sm:w-2/5 md:w-5/12 flex justify-center" />}
                </div>
            </div>
        </Modal>
    );
};

export default RoundsNumberSetterModal;
