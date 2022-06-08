import React, { useEffect, useState } from "react";

import { useSelector } from "react-redux";
import { State } from "@state/index";

import Modal from "@components/Modal";
import CustomButton from "@components/CustomButton";
import { ReactComponent as BookRoundedIcon } from "@assets/images/sprites/BookRoundedIcon.svg";

import { RULES } from "@src/constants";

import "./RulesButton.scss";

const RulesButton: React.FC<{ tabIndex?: number }> = ({ tabIndex }) => {
    const lang = useSelector((state: State) => state.LANGUAGE);

    // Modal toggler
    const [modalState, setModalState] = useState(false);

    // Fetch rules and save in `rules` state
    const [rules, setRules] = useState("");
    useEffect(() => {
        fetch(RULES[lang])
            .then((res) => res.text())
            .then((rules) => setRules(rules));
    });

    return (
        <React.Fragment>
            {modalState && (
                <Modal isOpen={modalState} toggle={setModalState}>
                    {rules}
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
