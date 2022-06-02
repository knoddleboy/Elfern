import React, { useState, useEffect, useRef } from "react";
import ReactDOM from "react-dom";
import FocusLock from "react-focus-lock";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import { ReactSetState } from "@src/types";

import "./DialogWrapper.scss";

export interface IDialogWrapper {
    children: React.ReactNode;
    isOpen: boolean;
    toggle: ReactSetState;
    centerContent?: boolean;
    unclosable?: true;
    sinkTimer?: boolean;
}

const dialogRoot = document.getElementById("modal-root") as Element;

const DialogWrapper: React.FC<IDialogWrapper> = ({ children, isOpen, toggle, centerContent, unclosable, sinkTimer }) => {
    const dispatch = useDispatch();
    const { setTimerState } = bindActionCreators(actionCreators, dispatch);
    const timerState = useSelector((state: State) => state.TIMER_STATE);

    const [fadeType, setFadeType] = useState<"in" | "out">();
    const dialogState = useRef(isOpen);

    const setFadeOut = () => {
        setFadeType("out");
        setTimeout(() => {
            toggle((prevState) => !prevState);
        }, 300);
    };

    const handleCloseClick = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>) => {
        if (e) e.preventDefault();
        setFadeOut();
    };

    const escapeListener = (e: React.KeyboardEvent<HTMLDivElement | HTMLButtonElement> | KeyboardEvent) => {
        if (e.key === "Escape") {
            setFadeOut();
        }
    };

    useEffect(() => {
        // If the timer is started, stop it when the dialog is mounted
        if (timerState.start && !sinkTimer) {
            setTimerState({
                ...timerState,
                pause: true,
            });
        }

        if (!unclosable) window.addEventListener("keydown", escapeListener, false);
        const timer = setTimeout(() => setFadeType("in"), 0);

        // Find every button with className of dialog-close and add them click event to close a modal
        const closeButtons = Array.from(document.getElementsByClassName("dialog-close"));
        closeButtons.forEach((button) =>
            button.addEventListener("click", () => {
                setFadeOut();
            })
        );

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

    // When the dialog is unmounted, start timer from where it was stopped
    useEffect(() => {
        if (fadeType === "out" && timerState.start && !sinkTimer) {
            setTimerState({
                ...timerState,
                resume: true,
            });
        }
    }, [fadeType]);

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
