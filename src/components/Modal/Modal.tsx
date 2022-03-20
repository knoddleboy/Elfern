import React from "react";

import SimpleBar from "simplebar-react";
import "simplebar/dist/simplebar.min.css";

// import classListManip from "@utils/classListManip";

import "./Modal.scss";

const md = require("markdown-it")();

interface ModalData {
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
        return (
            <div className="fixed z-1300 inset-0 top-6 flex items-center justify-center">
                <div className="acrylic-bg fixed -z-1 inset-0 top-6"></div>

                <div
                    className="content-wrapper absolute w-8/12 bg-white-normal p-4 rounded-xl"
                    style={{ height: "calc(100% * 10 / 12)" }}
                >
                    <SimpleBar style={{ maxHeight: "100%" }} autoHide={true} timeout={1000}>
                        <div
                            className="inserted-content"
                            dangerouslySetInnerHTML={{ __html: md.render(this.props.displayData) }}
                        />
                    </SimpleBar>
                    {/* <div
                        id="edge-scroll-trigger"
                        onMouseMove={() => {
                            classListManip.add(["simplebar-vertical"], "simplebar-hover");
                            classListManip.add(["simplebar-scrollbar"], "simplebar-visible");
                        }}
                        onMouseOut={() => {
                            classListManip.remove(["simplebar-vertical"], "simplebar-hover");
                            classListManip.remove(["simplebar-scrollbar"], "simplebar-visible");
                        }}
                    /> */}
                </div>
            </div>
        );
    }
}

export default Modal;
