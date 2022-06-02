import React, { useEffect, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import useWindowSize from "@utils/hooks/useWindowSize";
import useTranslation from "@utils/hooks/useTranslation";

import CustomButton from "@src/components/CustomButton";
import Modal, { IModalProps } from "@components/Modal";
import ModalCloseButton from "@components/Modal/ModalCloseButton";
import { IPlayAreaSidebarButtons } from "../PlayAreaSidebarButtons";

import ArrowBack from "@mui/icons-material/ArrowBackIosNewRounded";
import ArrowForward from "@mui/icons-material/ArrowForwardIosRounded";

type TRoundsNumberSetterModal = Pick<
    IModalProps & IPlayAreaSidebarButtons,
    "isOpen" | "size" | "toggleModal" | "gameResetHandler" | "unclosable"
>;

const RoundsNumberSetterModal: React.FC<TRoundsNumberSetterModal & { showModalClose?: boolean }> = ({
    isOpen,
    size,
    toggleModal,
    gameResetHandler,
    unclosable,
    showModalClose = true,
}) => {
    //* External state management
    const dispatch = useDispatch();
    const { setRoundStats } = bindActionCreators(actionCreators, dispatch);
    const roundStats = useSelector((state: State) => state.ROUND_STATS);

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
        setRoundStats({
            current: roundStats.current,
            max: rounds,
        });
    }, [rounds]);

    return (
        <Modal isOpen={isOpen} size={size} toggleModal={toggleModal} unclosable={unclosable} disableScrollBar>
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
