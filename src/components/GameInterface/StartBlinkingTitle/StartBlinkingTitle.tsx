import React, { useState, useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import useTranslation from "@utils/hooks/useTranslation";
import useWindowSize from "@utils/hooks/useWindowSize";

import RoundsNumberSetterModal from "../RoundsNumberSetterModal";

import { ReactSetState } from "@src/types";

import "./StartBlinkingTitle.scss";

interface IStartBlinkingTitleProps {
    elementRef: React.RefObject<HTMLDivElement>;
    shouldStartGame: ReactSetState;
}

const StartBlinkingTitle: React.FC<IStartBlinkingTitleProps> = ({ elementRef, shouldStartGame }) => {
    const dispatch = useDispatch();
    const { toggleInitialSetup } = bindActionCreators(actionCreators, dispatch);
    const isInitialSetup = useSelector((state: State) => state.INITIAL_SETUP);

    const { t } = useTranslation();
    const { width } = useWindowSize();

    const [showRoundSetter, setShowRoundSetter] = useState(false);

    useEffect(() => {
        // Create node that points to provided ref element
        const node = elementRef.current;

        // Check if node and window are exist
        if (!(window && node)) return;

        // Event handler
        const titleStateHandler = (e: MouseEvent | KeyboardEvent) => {
            const target = e.target as HTMLElement;

            // Omit events occurred in .NewGameButton container
            if (e instanceof MouseEvent && target.closest(".NewGameButton")) return;

            if (e instanceof KeyboardEvent) {
                // TODO: remove e.key === "r"
                // Omit Escape, Alt and Tab keys. Also omit any event if there is at least one element
                // in #modal-root (thus any dialog)
                if (
                    e.key === "Escape" ||
                    e.key === "Alt" ||
                    e.key === "Tab" ||
                    e.key === "Control" ||
                    e.key === "r" ||
                    document.getElementById("modal-root")?.firstChild
                )
                    return;

                // Omit Enter and Space keys when focused on a sidebar buttons to be able to interact with them
                if ((e.key === "Enter" || e.key === " ") && target.closest(".Sidebar")) return;
            }

            // If this is the first time after starting an application the user starts game, we ask him/her to
            // enter the number of rounds and we set isInitialSetup to false to indicate that first setup have
            // already been fired and we do not need to ask the user to enter the number of rounds again later
            // (since whenever he/she decides to start a new game, round setting window is showed)
            if (isInitialSetup) return setShowRoundSetter(true);

            shouldStartGame((prevState) => !prevState);
        };

        // Add event listeners
        window.addEventListener("keydown", titleStateHandler); // keydown on window
        node.addEventListener("click", titleStateHandler); // click on node

        // Remove event listeners on cleanup
        return () => {
            window.removeEventListener("keydown", titleStateHandler);
            node.removeEventListener("click", titleStateHandler);
        };
    }, []);

    // Update isInitialSetup to false (see above)
    useEffect(() => {
        if (showRoundSetter) toggleInitialSetup();
    }, [showRoundSetter]);

    return (
        <React.Fragment>
            {showRoundSetter && (
                <RoundsNumberSetterModal
                    isOpen={true}
                    size={`${width < 1024 ? "1/3" : "1/5"}`}
                    toggle={setShowRoundSetter}
                    gameResetHandler={shouldStartGame}
                    showModalClose={false}
                    unclosable={true}
                />
            )}
            <span className="start-blinking-title absolute text-green-300 uppercase text-[2.6vw]">
                {t("game-interface.start-blinking-title")}
            </span>
        </React.Fragment>
    );
};

export default StartBlinkingTitle;
