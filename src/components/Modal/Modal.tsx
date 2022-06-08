import React from "react";

import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

import DialogWrapper, { IDialogWrapper } from "@components/DialogWrapper";
import ModalCloseButton from "./ModalCloseButton";

import "./Modal.scss";

const md = require("markdown-it")({
    html: true,
    typographer: true,
});

export interface IModal extends IDialogWrapper {
    /** Modal window width. Calculated relatively the window size.
     * @example
     * size={"1/3"} -> modal width is 1/3 of window's width
     */
    size?: `${number}/${number}`;

    /** Set `true` to disable scrollbar */
    disableScrollBar?: boolean;
}

/**
 * Modal content. Moved to a separate component to render depending on wether scrollbar is enabled.
 * NOTE: if the actual children is a string, then it is considered as a markdown content and is parsed to html
 */
const ModalContent: React.FC<Pick<IModal, "children">> = ({ children }) => (
    <>
        {typeof children === "string" ? (
            <React.Fragment>
                <article
                    className="inserted-content prose prose-slate max-w-full"
                    dangerouslySetInnerHTML={{
                        __html: md.render(children),
                    }}
                />
                <ModalCloseButton className="w-full p-1 flex justify-center" />
            </React.Fragment>
        ) : (
            children
        )}
    </>
);

const Modal: React.FC<IModal> = ({ children, isOpen, size, toggle, unclosable, disableScrollBar = false }) => {
    return (
        <DialogWrapper isOpen={isOpen} toggle={toggle} centerContent={true} unclosable={unclosable}>
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
