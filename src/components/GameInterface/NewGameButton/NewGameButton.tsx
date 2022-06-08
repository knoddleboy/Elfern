import React, { useState } from "react";

import { useSelector } from "react-redux";
import { State } from "@src/state";

import useWindowSize from "@utils/hooks/useWindowSize";
import useTranslation from "@utils/hooks/useTranslation";

import CustomButton from "@src/components/CustomButton";
import RoundsNumberSetterModal from "../RoundsNumberSetterModal";

import StarRounded from "@mui/icons-material/StarsRounded";

import { ReactSetState } from "@src/types";

export interface INewGameButton {
    gameStartState: boolean;
    gameResetHandler: ReactSetState;
}

// New game button. When clicked, a user suggested to choose the number of rounds to play, then the game resets
const NewGameButton: React.FC<INewGameButton> = ({ gameStartState, gameResetHandler }) => {
    const isInitialSetup = useSelector((state: State) => state.INITIAL_SETUP);

    const { width } = useWindowSize();
    const { t } = useTranslation();

    // When `true`, show the modal to enter rounds number
    const [modalState, setModalState] = useState(false);

    return (
        <React.Fragment>
            {modalState && (
                <RoundsNumberSetterModal
                    isOpen={modalState}
                    size={`${width < 1024 ? "1/3" : "1/5"}`}
                    toggle={setModalState}
                    gameResetHandler={gameResetHandler}
                />
            )}
            <div className="NewGameButton w-[inherit] h-[56px] flex justify-center absolute bottom-0">
                <CustomButton
                    className="w-1/2 mx-auto text-green-800 flex-center brightness-[0.9]"
                    onClick={() => setModalState((prevState) => !prevState)}
                    // Here 35 is chosen because the maximum tabindex that can occur in the game interface
                    // is 34: 1, 2 for sidebar buttons and the rest for cards (32 cards in total). So the next is 35.
                    tabIndex={!gameStartState || isInitialSetup ? -1 : 3}
                    disabledStyles={
                        // If the game has not started yet, make button disabled
                        !gameStartState || isInitialSetup
                            ? {
                                  filter: "brightness(1.3)",
                              }
                            : undefined
                    }
                >
                    <StarRounded sx={{ fontSize: 30 }} />
                    <span className="text-base-adapt ml-2 uppercase">{t("game-interface.new-game-button")}</span>
                </CustomButton>
            </div>
        </React.Fragment>
    );
};

export default NewGameButton;
