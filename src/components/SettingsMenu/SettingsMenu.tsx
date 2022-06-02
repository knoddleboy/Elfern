import React, { useState } from "react";

import useWindowSize from "@utils/hooks/useWindowSize";
import useTranslation from "@utils/hooks/useTranslation";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import DialogWrapper from "@components/DialogWrapper";
import Switch from "@components/Switch";
import Modal from "@components/Modal";
import ModalCloseButton from "@components/Modal/ModalCloseButton";
import CustomButton from "@components/CustomButton";
import AudioClick from "@src/components/AudioClick";

import VolumeUp from "@mui/icons-material/VolumeUpRounded";
import Language from "@mui/icons-material/PublicRounded";
import Back from "@mui/icons-material/KeyboardBackspaceRounded";
import ArrowDropDown from "@mui/icons-material/KeyboardArrowDownRounded";

import { CircleFlag } from "react-circle-flags";

import DispatchToMainProcess from "@utils/DispatchToMainProcess";
import { ReactSetState } from "@src/types";
import { APPLICATION_MEDIA } from "@constants/global";

import { availableTranslations } from "@constants/global";
import { maskArray } from "@utils/utils";

import "./SettingsMenu.scss";

const { globalSettings } = require("../../configs");

interface ISettingsMenu {
    isOpen: boolean;
    toggler: ReactSetState;
}

interface IDropDownOption {
    title: string | null;
    optionKey: number;
    className?: string;
    content?: JSX.Element;
    toggler?: () => void;
}

const SettingsMenu: React.FC<ISettingsMenu> = ({ isOpen, toggler }) => {
    const dispatch = useDispatch();
    const { toggleAudio, setTranslation } = bindActionCreators(actionCreators, dispatch);

    const store = useSelector((state: State) => state);

    // Receive current audio state
    const audioState = useSelector((state: State) => state.ENABLE_AUDIO);

    // Receive current language state
    const currentLang = useSelector((state: State) => state.LANGUAGE);

    // Drop-down menu state (i.e. opened or closed)
    const [langDropDownState, setLanguageDropDownState] = useState(false);

    // Modal to display quit confirmation
    const [modalState, setModalState] = useState(false);

    // Using window size to adjust modal size to it
    const { width } = useWindowSize();

    const [optionState, setOptionState] = useState(maskArray(availableTranslations, currentLang));

    const { t } = useTranslation();

    const dropDownList = [
        {
            title: t("settings.drop-down.en"),
            countryCode: "us" as typeof availableTranslations[0],
        },
        {
            title: t("settings.drop-down.ua"),
            countryCode: "ua" as typeof availableTranslations[1],
        },
        {
            title: t("settings.drop-down.de"),
            countryCode: "de" as typeof availableTranslations[2],
        },
    ];

    const DropDownOption: React.FC<IDropDownOption> = ({ title, className, optionKey, content, toggler }) => {
        return (
            <li className={`${className || ""}`}>
                <button
                    className={`rounded-[inherit] ${
                        optionState[optionKey] ? "active" : ""
                    } text-sm-adapt flex items-center justify-between`}
                    onClick={(e) => {
                        if ((e.target as HTMLElement).classList.contains("active")) return;
                        setOptionState((prevState) => {
                            const state = [false, false, false];
                            state[optionKey] = !prevState[optionKey];
                            return state;
                        });
                        if (toggler) toggler();
                    }}
                    tabIndex={langDropDownState ? 0 : -1}
                >
                    {title}
                    {content}
                </button>
            </li>
        );
    };

    return (
        <React.Fragment>
            {modalState && (
                <Modal
                    isOpen={modalState}
                    size={`${width < 1024 ? "1/3" : "1/4"}`}
                    toggleModal={setModalState}
                    disableScrollBar
                    sinkTimer
                >
                    <div className="text-center">
                        <h1
                            style={{
                                lineHeight: `${width < 1024 ? "1.125em" : ""}`,
                            }}
                        >
                            {t("settings.quit-dialog.title")}
                        </h1>
                        <span className="text-[10vw] font-english-towne text-[#e2e2e2]">E</span>
                        <div className="w-full flex justify-around items-center">
                            <CustomButton
                                className="dialog-close
                                    sm:w-2/5 md:w-5/12 py-1
                                    transition-colors
                                    text-white-text sm:text-sm md:text-lg uppercase
                                    bg-[#42A5F5] hover:bg-[#1E88E5] active:bg-[#1671c0]
                                    rounded-2xl"
                                onClick={() => {
                                    globalSettings.set(store);
                                    DispatchToMainProcess.closeApp();
                                }}
                            >
                                {t("settings.quit-dialog.confirm-button")}
                            </CustomButton>
                            <ModalCloseButton className="sm:w-2/5 md:w-5/12 flex justify-center" />
                        </div>
                    </div>
                </Modal>
            )}
            <DialogWrapper isOpen={isOpen} toggle={toggler}>
                <div
                    className={`SettingsMenu absolute sm:w-[38%] md:w-1/3 lg:w-1/4 h-full text-dark-800 bg-[#fff3e4] px-3 py-2`}
                    onClick={(e) => {
                        if (
                            (e.target as HTMLDivElement).closest(".option-bg") ||
                            (e.target as HTMLDivElement).closest(".dropdown")
                        )
                            return;
                        setLanguageDropDownState(false);
                    }}
                >
                    <CustomButton className="dialog-close option-bg w-min p-1 rounded-full">
                        <Back sx={{ fontSize: 28 }} />
                    </CustomButton>
                    <h1 className="text-center mb-7">{t("settings.title")}</h1>
                    <div>
                        <div
                            className={`${audioState ? "text-[#313131]" : "text-[#6f6f6f]"} flex items-center px-4 mb-4`}
                        >
                            <VolumeUp />
                            <span className="text-base-adapt ml-2 flex-1">{t("settings.sound")}</span>
                            <Switch
                                size={1.25}
                                onChange={() => {
                                    toggleAudio();
                                }}
                                defaultChecked={audioState}
                            />
                        </div>
                        <AudioClick sound={APPLICATION_MEDIA.click}>
                            <button
                                className="option-bg w-full flex items-center px-4 py-2 rounded-full cursor-pointer"
                                onClick={() => setLanguageDropDownState((prevState) => !prevState)}
                            >
                                <div className="flex flex-1 items-center">
                                    <Language />
                                    <span className="text-base-adapt ml-2">{t("settings.language")}</span>
                                </div>
                                <ArrowDropDown className={`${langDropDownState ? "rotate-180" : ""}`} />
                            </button>
                        </AudioClick>
                        <ul className={`dropdown ${langDropDownState ? "opened" : ""} my-2 rounded-2xl`}>
                            <>
                                {dropDownList.map((item, i) => {
                                    return (
                                        <DropDownOption
                                            key={i}
                                            optionKey={i}
                                            title={item.title}
                                            content={
                                                <CircleFlag
                                                    countryCode={item.countryCode}
                                                    className="w-[10%] opacity-70"
                                                />
                                            }
                                            className={`${
                                                i === 0
                                                    ? "rounded-tl-[inherit] rounded-tr-[inherit]"
                                                    : i === dropDownList.length - 1
                                                    ? "rounded-bl-[inherit] rounded-br-[inherit]"
                                                    : ""
                                            }`}
                                            toggler={() => setTranslation(item.countryCode)}
                                        />
                                    );
                                })}
                            </>
                        </ul>
                    </div>
                    <CustomButton
                        className="quit w-[calc(100%-1.5rem)] absolute bottom-0 py-2 mb-3 rounded-full text-center uppercase font-medium"
                        onClick={() => setModalState((prevState) => !prevState)}
                    >
                        {t("settings.quit-button")}
                    </CustomButton>
                </div>
            </DialogWrapper>
        </React.Fragment>
    );
};

export default SettingsMenu;
