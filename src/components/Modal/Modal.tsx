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

export interface IModalProps {
    children?: React.ReactNode;
    size?: `${number}/${number}`;
    isOpen: boolean;
    toggleModal: ReactSetState;
    disableScrollBar?: boolean;
    unclosable?: true;
    sinkTimer?: boolean;
}

const ModalContent: React.FC<Pick<IModalProps, "children">> = ({ children }) => (
    <>
        {typeof children === "string" ? (
            <React.Fragment>
                <article
                    className="inserted-content prose prose-slate max-w-full"
                    dangerouslySetInnerHTML={{
                        __html: md.render(children),
                    }}
                />
                <ModalCloseButton className="w-full flex justify-center" />
            </React.Fragment>
        ) : (
            children
        )}
    </>
);
//* TODO: extend from DialogWrapper
const Modal: React.FC<IModalProps> = ({
    children,
    size,
    isOpen,
    toggleModal,
    unclosable,
    sinkTimer,
    disableScrollBar = false,
}) => {
    return (
        <DialogWrapper
            isOpen={isOpen}
            toggle={toggleModal}
            centerContent={true}
            unclosable={unclosable}
            sinkTimer={sinkTimer}
        >
            <div
                id="dialog"
                className="modal-content absolute bg-white-normal p-4 rounded-xl"
                style={{
                    width: `calc(100% * ${size || "8 / 12"})`,
                    height: size ? "fit-content" : "calc(100% * 10 / 12)",
                }}
            >
                {disableScrollBar ? (
                    <ModalContent>{children}</ModalContent>
                ) : (
                    <SimpleBar style={{ height: "100%" }} autoHide={true} timeout={1000}>
                        <ModalContent>{children}</ModalContent>
                    </SimpleBar>
                )}
            </div>
        </DialogWrapper>
    );
};

export default Modal;
