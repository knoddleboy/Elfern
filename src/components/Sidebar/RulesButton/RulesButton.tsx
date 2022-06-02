import React, { useState } from "react";

import { useSelector } from "react-redux";
import { State } from "@state/index";

import Modal from "@components/Modal";
import CustomButton from "@components/CustomButton";
import { ReactComponent as BookRoundedIcon } from "@assets/images/sprites/BookRoundedIcon.svg";

import readFile from "@utils/readFile";

import "./RulesButton.scss";

const RulesButton: React.FC<{ tabIndex?: number }> = ({ tabIndex }) => {
    const lng = useSelector((state: State) => state.LANGUAGE);

    const [modalState, setModalState] = useState(false);

    return (
        <React.Fragment>
            {modalState && (
                <Modal isOpen={modalState} toggleModal={setModalState}>
                    {readFile(`src/assets/locales/${lng}/rules.md`)}
                </Modal>
            )}
            <CustomButton
                className="mb-auto rounded-[25%]"
                onClick={() => setModalState((prevState) => !prevState)}
                tabIndex={tabIndex}
            >
                <BookRoundedIcon className="RulesButton w-[1em] h-[1em] fill-green-800 brightness-75 hover:brightness-[60%] text-4xl" />
            </CustomButton>
        </React.Fragment>
    );
};

export default RulesButton;
