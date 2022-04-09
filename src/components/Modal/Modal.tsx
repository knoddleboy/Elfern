import React from "react";
import ReactDOM from "react-dom";

import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

import CustomButton from "@components/CustomButton";
import { ReactSetState } from "@src/types";

import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import "./Modal.scss";

const md = require("markdown-it")({
    html: true,
    typographer: true,
});

interface IModalProps {
    isOpen: boolean;
    toggleModal: ReactSetState;
    displayData: string;
}

interface IModalState {
    fadeType: string | null;
}

const modalRoot = document.getElementById("modal-root") as Element;

class Modal extends React.Component<IModalProps, IModalState> {
    constructor(props: IModalProps) {
        super(props);
        this.state = {
            fadeType: null,
        };
    }

    componentDidMount(): void {
        window.addEventListener("keydown", this.escapeListener, false);
        setTimeout(() => this.setState({ fadeType: "in" }), 0);
    }

    componentDidUpdate(prevProps: IModalProps): void {
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
            this.props.toggleModal((prevState) => !prevState);
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
            <div
                className={`fade-${this.state.fadeType} fixed z-[1200] inset-0 top-6 flex items-center justify-center`}
            >
                <div
                    className="acrylic-bg fixed -z-1 inset-0 top-6"
                    onClick={this.handleCloseClick}
                />

                <div
                    className="modal-content absolute w-8/12 bg-white-normal p-4 rounded-xl"
                    style={{ height: "calc(100% * 10 / 12)" }}
                >
                    <SimpleBar style={{ maxHeight: "100%" }} autoHide={true} timeout={1000}>
                        <article
                            className="inserted-content prose prose-slate max-w-full"
                            dangerouslySetInnerHTML={{ __html: md.render(this.props.displayData) }}
                        />
                        <div className="w-full flex justify-center">
                            <CustomButton className="modal-close" onClick={this.handleCloseClick}>
                                <CloseRoundedIcon sx={{ fontSize: 32 }} />
                            </CustomButton>
                        </div>
                    </SimpleBar>
                </div>
            </div>,
            modalRoot
        );
    }
}

export default Modal;
