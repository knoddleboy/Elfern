import React, { useState, useEffect, useMemo, useCallback } from "react";

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
import { maskArray } from "@utils/utils";

import { APPLICATION_MEDIA, TRANSLATION_COUNTRY_CODES } from "@src/constants";
import { ReactSetState } from "@src/types";

import "./SettingsMenu.scss";

import { globalSettings, activeSession } from "@src/configs";
import { IGlobalSettingsDefaults, IActiveSessionDefaults } from "@src/configs/types";

interface ISettingsMenu {
    /** Set `true` to show the menu */
    isOpen: boolean;

    /** Menu toggler */
    toggle: ReactSetState;
}

interface IDropDownOptions {
    /** Dropdown option title */
    title: string | null;

    /** Dropdown option content */
    content?: JSX.Element;

    /** Defines which option is active now (to style it) */
    optionKey: number;

    className?: string;

    /** Callback to execute when clicked on the option */
    execute?: () => void;
}

const SettingsMenu: React.FC<ISettingsMenu> = ({ isOpen, toggle }) => {
    const dispatch = useDispatch();
    const { toggleAudio, setTranslation, setStoreSessionSignal } = bindActionCreators(actionCreators, dispatch);

    const storeSessionSignal = useSelector((state: State) => state.STORE_SESSION_SIGNAL);

    const audioState = useSelector((state: State) => state.ENABLE_AUDIO);
    const currentLang = useSelector((state: State) => state.LANGUAGE);

    const isInitialSetup = useSelector((state: State) => state.INITIAL_SETUP);
    const sessionStats = useSelector((state: State) => state.STATS);
    const sessionProgress = useSelector((state: State) => state.PROGRESS);

    // Wait until activeSession is updated, then write store to the config and quit
    useEffect(() => {
        if (sessionProgress && storeSessionSignal) {
            globalSettings.set({
                ENABLE_AUDIO: audioState,
                LANGUAGE: currentLang,
            } as unknown as keyof IGlobalSettingsDefaults);

            activeSession.set({
                INITIAL_SETUP: isInitialSetup,
                STATS: sessionStats,
                PROGRESS: sessionProgress,
            } as unknown as keyof IActiveSessionDefaults);

            DispatchToMainProcess.closeApp(); // Close the app
        }
    }, [sessionProgress]);

    // Drop-down menu state (i.e. opened or closed)
    const [dropDownState, seDropDownState] = useState(false);

    // Modal to display quit confirmation window
    const [modalState, setModalState] = useState(false);

    // Using window size to adjust modal size to it
    const { width } = useWindowSize();

    const { t } = useTranslation();

    // maskArray returns an array that show which lang is currently set (true value in the array),
    // therefore the option with that language is considered as activated
    const [optionState, setOptionState] = useState(maskArray(TRANSLATION_COUNTRY_CODES, currentLang));

    // Available options in the dropdown
    const dropDownList = [
        {
            title: t("settings.drop-down.en"),
            countryCode: "us" as typeof TRANSLATION_COUNTRY_CODES[0],
        },
        {
            title: t("settings.drop-down.ua"),
            countryCode: "ua" as typeof TRANSLATION_COUNTRY_CODES[1],
        },
        {
            title: t("settings.drop-down.de"),
            countryCode: "de" as typeof TRANSLATION_COUNTRY_CODES[2],
        },
    ];

    const DropDownOptions: React.FC<IDropDownOptions> = ({ title, optionKey, content, className, execute }) => {
        // Click handler. Wrapped with useMemo to prevent from re-render when clicked on the already chosen option
        const handleOptionClick = useMemo(
            () => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                // Check if the target has 'active' class name
                if ((e.target as HTMLElement).classList.contains("active")) return;

                // Set only clicked option to be active (so previous set option become unset)
                setOptionState((prevState) => {
                    const state = [false, false, false];
                    state[optionKey] = !prevState[optionKey];
                    return state;
                });

                // Execute handler function
                if (execute) execute();
            },
            [execute, optionKey]
        );

        return (
            <li className={`w-full ${className || ""}`}>
                <button
                    className={`w-[inherit] rounded-[inherit] ${
                        optionState[optionKey] ? "active" : ""
                    } text-sm-adapt flex items-center justify-between !outline-offset-0`}
                    onClick={handleOptionClick}
                    tabIndex={dropDownState ? 0 : -1}
                >
                    {title}
                    {content}
                </button>
            </li>
        );
    };

    const handleDialogClick = useCallback((e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        // If we clicked on any element except for the .option-bg and .dropdown, close the dropdown
        if ((e.target as HTMLDivElement).closest(".option-bg") || (e.target as HTMLDivElement).closest(".dropdown"))
            return;
        seDropDownState(false);
    }, []);

    return (
        <React.Fragment>
            {modalState && (
                <Modal
                    isOpen={modalState}
                    size={`${width < 1024 ? "1/3" : "1/4"}`}
                    toggle={setModalState}
                    disableScrollBar
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
                                onClick={() => setStoreSessionSignal(true)}
                            >
                                {t("settings.quit-dialog.confirm-button")}
                            </CustomButton>
                            <ModalCloseButton className="sm:w-2/5 md:w-5/12 flex justify-center" />
                        </div>
                    </div>
                </Modal>
            )}
            <DialogWrapper isOpen={isOpen} toggle={toggle}>
                <div
                    className={`SettingsMenu absolute sm:w-[38%] md:w-1/3 lg:w-1/4 h-full text-dark-800 bg-[#fff3e4] px-3 py-2`}
                    onClick={handleDialogClick}
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
                            <Switch size={1.25} onChange={() => toggleAudio()} defaultChecked={audioState} />
                        </div>
                        <AudioClick sound={APPLICATION_MEDIA.click}>
                            <button
                                className="option-bg w-full flex items-center px-4 py-2 rounded-full cursor-pointer"
                                onClick={() => seDropDownState((prevState) => !prevState)}
                            >
                                <div className="flex flex-1 items-center">
                                    <Language />
                                    <span className="text-base-adapt ml-2">{t("settings.language")}</span>
                                </div>
                                <ArrowDropDown className={`${dropDownState ? "rotate-180" : ""}`} />
                            </button>
                        </AudioClick>
                        <ul className={`dropdown ${dropDownState ? "opened" : ""} my-2 rounded-2xl`}>
                            <>
                                {dropDownList.map((item, i) => {
                                    return (
                                        <DropDownOptions
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
                                            execute={() => setTranslation(item.countryCode)}
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
