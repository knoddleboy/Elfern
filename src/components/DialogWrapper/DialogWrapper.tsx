import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import FocusLock from "react-focus-lock";

import { DIALOG_FADEOUT_ANIMATION_DURATION } from "@src/constants";
import { ReactSetState } from "@src/types";

import "./DialogWrapper.scss";

export interface IDialogWrapper {
    /** Children */
    children: React.ReactNode;

    /** Set `true` to show the dialog and its content */
    isOpen: boolean;

    /** Modal toggler */
    toggle: ReactSetState;

    /** Set `true` to center dialog content (usually used with modal window) */
    centerContent?: boolean;

    /** Set `true` to make the dialog unclosable */
    unclosable?: true;
}

// Here in #modal-root element we mount various dialog windows
const dialogRoot = document.getElementById("modal-root") as Element;

const DialogWrapper: React.FC<IDialogWrapper> = ({ children, isOpen, toggle, centerContent, unclosable }) => {
    const [fadeType, setFadeType] = useState<"in" | "out">();
    const dialogState = useRef(isOpen);

    // When called, sets out animation, then after 300ms (the animation duration) unmounts the dialog
    const setFadeOut = () => {
        setFadeType("out");
        setTimeout(() => toggle((prevState) => !prevState), DIALOG_FADEOUT_ANIMATION_DURATION);
    };

    const handleCloseClick = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault(); // In context of the application is useful
        setFadeOut();
    };

    const escapeListener = (e: KeyboardEvent) => {
        // Close dialog on Escape key press
        if (e.key === "Escape") {
            setFadeOut();
        }
    };

    useEffect(() => {
        // If unclosable is set, we don't listen to any keydown event to close the dialog
        if (!unclosable) window.addEventListener("keydown", escapeListener, false);
        const timer = setTimeout(() => setFadeType("in"), 0);

        // Find every button with class name of `dialog-close` and add to them click event to close a modal
        const closeButtons = Array.from(document.getElementsByClassName("dialog-close"));
        closeButtons.forEach((button) =>
            button.addEventListener("click", () => {
                setFadeOut();
            })
        );

        // Clearing on unmount
        return () => {
            window.removeEventListener("keydown", escapeListener, false);
            clearTimeout(timer);
        };
    }, []);

    // When the dialog did update (when either way it was started to close), we fade it out, then unmount
    useEffect(() => {
        if (!isOpen && dialogState.current) {
            setFadeType("out");
        }
    }, [isOpen]);

    return ReactDOM.createPortal(
        <FocusLock>
            <div
                className={`DialogWrapper fade-${fadeType} ${
                    centerContent ? "flex items-center justify-center" : ""
                } fixed z-[1200] inset-0 top-6`}
            >
                <div
                    className="acrylic-bg fixed -z-1 inset-0 top-6"
                    onClick={(e) => {
                        // If unclosable is set, we don't listen to any click event to close the dialog
                        if (!unclosable) handleCloseClick(e);
                    }}
                />
                {children}
            </div>
        </FocusLock>,
        dialogRoot
    );
};

export default DialogWrapper;
