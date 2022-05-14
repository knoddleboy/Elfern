import React from "react";
import ReactDOM from "react-dom";

import FocusLock from "react-focus-lock";

import { ReactSetState } from "@src/types";

import "./DialogWrapper.scss";

interface IDialogWrapperProps {
    children: JSX.Element | JSX.Element[];
    isOpen: boolean;
    toggle: ReactSetState;
    centerContent?: boolean;
}

interface IDialogWrapperState {
    fadeType: "in" | "out" | null;
}

const dialogRoot = document.getElementById("modal-root") as Element;

class DialogWrapper extends React.Component<IDialogWrapperProps, IDialogWrapperState> {
    constructor(props: IDialogWrapperProps) {
        super(props);
        this.state = {
            fadeType: null,
        };
    }

    componentDidMount(): void {
        window.addEventListener("keydown", this.escapeListener, false);
        setTimeout(() => this.setState({ fadeType: "in" }), 0);

        const closeButtons = Array.from(document.getElementsByClassName("dialog-close"));
        closeButtons.forEach((button) =>
            button.addEventListener("click", () => {
                this.setFadeOut();
            })
        );
    }

    componentDidUpdate(prevProps: IDialogWrapperProps): void {
        if (!this.props.isOpen && prevProps.isOpen) {
            this.setState({ fadeType: "out" });
        }
    }

    componentWillUnmount(): void {
        window.removeEventListener("keydown", this.escapeListener, false);
    }

    setFadeOut = (): void => {
        this.setState({ fadeType: "out" });
        setTimeout(() => {
            this.props.toggle((prevState) => !prevState);
        }, 300);
    };

    handleCloseClick = (e: React.MouseEvent<HTMLDivElement | HTMLButtonElement>): void => {
        if (e) e.preventDefault();
        this.setFadeOut();
    };

    escapeListener = (
        e: React.KeyboardEvent<HTMLDivElement | HTMLButtonElement> | KeyboardEvent
    ): void => {
        if (e.key === "Escape") {
            this.setFadeOut();
        }
    };

    render() {
        return ReactDOM.createPortal(
            <FocusLock>
                <div
                    className={`DialogWrapper fade-${this.state.fadeType} ${
                        this.props.centerContent ? "flex items-center justify-center" : ""
                    } fixed z-[1200] inset-0 top-6`}
                >
                    <div
                        className="acrylic-bg fixed -z-1 inset-0 top-6"
                        onClick={this.handleCloseClick}
                    />
                    {this.props.children}
                </div>
            </FocusLock>,
            dialogRoot
        );
    }
}

export default DialogWrapper;
