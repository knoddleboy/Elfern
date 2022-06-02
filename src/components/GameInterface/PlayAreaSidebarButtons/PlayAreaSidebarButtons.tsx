import React, { useState } from "react";

import { useSelector } from "react-redux";
import { State } from "@src/state";

import useWindowSize from "@utils/hooks/useWindowSize";
import useTranslation from "@utils/hooks/useTranslation";

import CustomButton from "@src/components/CustomButton";
import RoundsNumberSetterModal from "../RoundsNumberSetterModal";
import Stopwatch from "./Stopwatch";

import Clock from "@mui/icons-material/AccessTimeFilledRounded";
import NewGame from "@mui/icons-material/StarsRounded";

import { ReactSetState } from "@src/types";

export interface IPlayAreaSidebarButtons {
    gameStartState: boolean;
    gameResetHandler: ReactSetState;
}

const PlayAreaSidebarButtons: React.FC<IPlayAreaSidebarButtons> = ({ gameStartState, gameResetHandler }) => {
    const isInitialSetup = useSelector((state: State) => state.INITIAL_SETUP);

    const { width } = useWindowSize();
    const { t } = useTranslation();

    const [modalState, setModalState] = useState(false);

    return (
        <React.Fragment>
            {modalState && (
                <RoundsNumberSetterModal
                    isOpen={modalState}
                    size={`${width < 1024 ? "1/3" : "1/5"}`}
                    toggleModal={setModalState}
                    gameResetHandler={gameResetHandler}
                />
            )}
            <div className="PlayAreaSidebarButtons w-[inherit] h-[56px] flex justify-between absolute bottom-0">
                <div
                    className="text-green-800 flex-1 flex-grow flex-center brightness-[0.9]"
                    style={
                        !gameStartState || isInitialSetup
                            ? {
                                  filter: "brightness(1.3)",
                              }
                            : undefined
                    }
                >
                    <Clock sx={{ fontSize: 28 }} />
                    <Stopwatch className="text-base-adapt ml-2" />
                </div>
                <CustomButton
                    className="text-green-800 flex-1 flex-grow flex-center brightness-[0.9]"
                    onClick={() => setModalState((prevState) => !prevState)}
                    tabIndex={!gameStartState || isInitialSetup ? -1 : 3}
                    disabledStyles={
                        !gameStartState || isInitialSetup
                            ? {
                                  filter: "brightness(1.3)",
                              }
                            : undefined
                    }
                >
                    <NewGame sx={{ fontSize: 30 }} />
                    <span className="text-base-adapt ml-2 uppercase">{t("game-interface.new-game-button")}</span>
                </CustomButton>
            </div>
        </React.Fragment>
    );
};

export default PlayAreaSidebarButtons;
