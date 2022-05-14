import React from "react";

import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

import DialogWrapper from "@components/DialogWrapper";
import ModalCloseButton from "./ModalCloseButton";

import { ReactSetState } from "@src/types";

import "./Modal.scss";

const md = require("markdown-it")({
    html: true,
    typographer: true,
});

interface IModalProps {
    size?: `${number}/${number}`;
    isOpen: boolean;
    toggleModal: ReactSetState;
    displayData: string | JSX.Element;
}

const Modal: React.FC<IModalProps> = ({ size, isOpen, toggleModal, displayData }) => {
    return (
        <DialogWrapper isOpen={isOpen} toggle={toggleModal} centerContent={true}>
            <div
                className="modal-content absolute bg-white-normal p-4 rounded-xl"
                style={{
                    width: `calc(100% * ${size || "8 / 12"})`,
                    height: size ? "fit-content" : "calc(100% * 10 / 12)",
                    // aspectRatio: size ? "29 / 25" : "auto",
                }}
            >
                <SimpleBar style={{ height: "100%" }} autoHide={true} timeout={1000}>
                    {typeof displayData === "string" ? (
                        <React.Fragment>
                            <article
                                className="inserted-content prose prose-slate max-w-full"
                                dangerouslySetInnerHTML={{
                                    __html: md.render(displayData),
                                }}
                            />
                            <ModalCloseButton className="w-full flex justify-center" />
                        </React.Fragment>
                    ) : (
                        displayData
                    )}
                </SimpleBar>
            </div>
        </DialogWrapper>
    );
};

export default Modal;
