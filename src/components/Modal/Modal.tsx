import React from "react";

import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

import { ReactSetState } from "@src/types";

import "./Modal.scss";

const md = require("markdown-it")({
    html: true,
    typographer: true,
});

interface ModalData {
    active?: boolean;
    toggleModal: ReactSetState;
    displayData?: string;
}

class Modal extends React.Component<ModalData, { scrollbarClicked: boolean }> {
    constructor(props: ModalData) {
        super(props);
        this.state = {
            scrollbarClicked: false,
        };
    }

    render() {
        if (!this.props.active) return null;

        return (
            <div
                className={`${
                    this.props.active ? "show" : "hide"
                } fixed z-1300 inset-0 top-6 flex items-center justify-center`}
            >
                <div
                    className="acrylic-bg fixed -z-1 inset-0 top-6"
                    onClick={() => this.props.toggleModal((prevState) => !prevState)}
                />

                <div
                    className="content-wrapper absolute w-8/12 bg-white-normal p-4 rounded-xl"
                    style={{ height: "calc(100% * 10 / 12)" }}
                >
                    <SimpleBar style={{ maxHeight: "100%" }} autoHide={true} timeout={1000}>
                        <article
                            className="inserted-content prose prose-slate"
                            dangerouslySetInnerHTML={{ __html: md.render(this.props.displayData) }}
                        />
                    </SimpleBar>
                </div>
            </div>
        );
    }
}

export default Modal;
