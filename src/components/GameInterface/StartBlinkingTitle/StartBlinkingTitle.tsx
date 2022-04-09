import React, { useEffect } from "react";

import { ReactSetState } from "@src/types";

import "./StartBlinkingTitle.scss";

interface IStartBlinkingTitleProps {
    elementRef: React.RefObject<HTMLDivElement>;
    shouldStartGame: ReactSetState;
}

const StartBlinkingTitle: React.FC<IStartBlinkingTitleProps> = ({
    elementRef,
    shouldStartGame,
}) => {
    useEffect(() => {
        // Create node that points to provided ref element
        const node = elementRef.current;

        // Check if node and window are exist
        if (!(window && node)) return;

        // Event handler
        const titleStateHandler = (e: KeyboardEvent | MouseEvent) => {
            // Omit alt and tab clicks
            if (
                e instanceof KeyboardEvent &&
                (e.key === "Alt" || e.key === "Tab" || e.key === "Control" || e.key === "r")
            )
                return;
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
    }, [elementRef, shouldStartGame]);

    return (
        <React.Fragment>
            <span className="start-blinking-title absolute text-green-light uppercase text-[2.6vw]">
                Press any key to start dealing...
            </span>
        </React.Fragment>
    );
};

export default StartBlinkingTitle;
