import React, { useState } from "react";

import useWindowSize from "@utils/hooks/useWindowSize";
import useTranslation from "@utils/hooks/useTranslation";

import CustomButton from "@src/components/CustomButton";
import Modal from "@components/Modal";
import ModalCloseButton from "@components/Modal/ModalCloseButton";

import CancelAction from "@mui/icons-material/RestartAltRounded";
import NewGame from "@mui/icons-material/StarsRounded";
import ChevronRight from "@mui/icons-material/ChevronRightRounded";
import ChevronLeft from "@mui/icons-material/ChevronLeftRounded";

import { ReactSetState } from "@src/types";

interface IPlayAreaSidebarButtons {
    gameStartState: boolean;
    gameResetHandler: ReactSetState;
}

const PlayAreaSidebarButtons: React.FC<IPlayAreaSidebarButtons> = ({ gameStartState, gameResetHandler }) => {
    const [modalState, setModalState] = useState(false);
    const [rounds, setRounds] = useState(1);

    const { width } = useWindowSize();
    const { t } = useTranslation();

    const addRemoveRounds = (direction: -1 | 1) => () => {
        // Prevent rounds go less than 1 on key press
        if (direction === -1 && rounds <= 1) return;
        setRounds((prev) => prev + direction);
    };

    return (
        <React.Fragment>
            {modalState && (
                <Modal
                    isOpen={modalState}
                    size={`${width < 1024 ? "1/3" : "1/5"}`}
                    toggleModal={setModalState}
                    displayData={
                        <div className="h-full text-center text-dark-600 flex flex-col justify-between">
                            <h1>{t("new-game.title")}</h1>
                            <div
                                className="flex items-center justify-center sm:text-4xl md:text-6xl"
                                style={{
                                    margin: `${width < 1024 ? "15%" : "20%"} 0`,
                                }}
                            >
                                <CustomButton
                                    className="rounded-full"
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
                                    <ChevronLeft sx={{ fontSize: "inherit" }} />
                                </CustomButton>
                                <span
                                    className={`${
                                        rounds < 10 ? "sm:w-8 md:w-12" : "sm:w-12 md:w-20"
                                    } sm:text-4xl md:text-6xl sm:px-1 md:px-2`}
                                >
                                    {rounds}
                                </span>
                                <CustomButton className="rounded-full" onClick={addRemoveRounds(1)}>
                                    <ChevronRight sx={{ fontSize: "inherit" }} />
                                </CustomButton>
                            </div>
                            <div className="w-full flex justify-around items-center">
                                <CustomButton
                                    className="dialog-close
                                        sm:w-2/5 md:w-5/12 py-1
                                        transition-all
                                        text-white-text sm:text-sm md:text-lg uppercase
                                        bg-[#42A5F5] hover:bg-[#1E88E5]
                                        rounded-2xl
                                    "
                                    onClick={() => gameResetHandler((prevState) => !prevState)}
                                >
                                    {t("new-game.confirm-button")}
                                </CustomButton>
                                <ModalCloseButton className="sm:w-2/5 md:w-5/12 flex justify-center" />
                            </div>
                        </div>
                    }
                />
            )}
            <div className="PlayAreaSidebarButtons w-[inherit] h-[56px] flex justify-between absolute bottom-0">
                <CustomButton
                    className="text-green-800 flex-grow flex-center brightness-[0.9]"
                    onClick={() => alert("cancel")}
                    disabledStyles={
                        !gameStartState
                            ? {
                                  filter: "brightness(1.3)",
                              }
                            : {}
                    }
                >
                    <CancelAction sx={{ fontSize: 30 }} />
                    <span className="text-base-adapt ml-2 uppercase">{t("game-interface.cancel-button")}</span>
                </CustomButton>
                <CustomButton
                    className="text-green-800 flex-grow flex-center brightness-[0.9]"
                    onClick={() => setModalState((prevState) => !prevState)}
                >
                    <NewGame sx={{ fontSize: 30 }} />
                    <span className="text-base-adapt ml-2 uppercase">{t("game-interface.new-game-button")}</span>
                </CustomButton>
            </div>
        </React.Fragment>
    );
};

export default PlayAreaSidebarButtons;
