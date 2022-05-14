import React, { useEffect } from "react";

import useTranslation from "@utils/hooks/useTranslation";

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
    const { t } = useTranslation();

    useEffect(() => {
        // Create node that points to provided ref element
        const node = elementRef.current;

        // Check if node and window are exist
        if (!(window && node)) return;

        // Event handler
        const titleStateHandler = (e: MouseEvent | KeyboardEvent) => {
            const target = e.target as HTMLElement;
            // Omit alt and tab clicks

            // TODO: remove e.key === "r"
            if (
                (e instanceof MouseEvent && target.closest(".PlayAreaSidebarButtons")) ||
                (e instanceof KeyboardEvent &&
                    (e.key === "Escape" ||
                        e.key === "Alt" ||
                        e.key === "Tab" ||
                        e.key === "Control" ||
                        e.key === "r"))
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
            <span className="start-blinking-title absolute text-green-300 uppercase text-[2.6vw]">
                {t("game-interface.start-blinking-title")}
            </span>
        </React.Fragment>
    );
};

export default StartBlinkingTitle;
