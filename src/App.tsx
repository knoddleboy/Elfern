import React, { useEffect, useState, useRef } from "react";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import Titlebar from "@components/Titlebar";
import Modal from "@components/Modal";
import Sidebar from "@components/Sidebar";
import MainMenu from "@src/components/MainMenu";
import GameInterface from "@components/GameInterface";
import SavedProgressNotification from "@components/SavedProgressNotification";

import { globalSettings, globalSettingsDefaults, activeSession, activeSessionDefaults } from "./configs";
import { DIALOG_FADEOUT_ANIMATION_DURATION } from "./constants";

import "./App.scss";

const App: React.FC = () => {
    const dispatch = useDispatch();
    const { toggleAudio, setTranslation, toggleInitialSetup, setStats, setProgress } = bindActionCreators(
        actionCreators,
        dispatch
    );

    const store = useSelector((state: State) => state);

    // Defines the state of the main (start) menu
    const [mainMenuIsRendered, setMainMenuRenderState] = useState(true);

    // Defined wether to show notifying window with (see below)
    const [savedProcessModalState, setSavedProcessModalState] = useState(false);

    const [renderGame, setRenderGame] = useState(false);

    // If INITIAL_SETUP does not match with the stored one (which means that a user
    // once started a game and did not finished it), show warning about saved progress.
    // Otherwise render gameInterface right away
    useEffect(() => {
        if (activeSessionDefaults.INITIAL_SETUP !== store.INITIAL_SETUP) setSavedProcessModalState(true);
        else setRenderGame(true);
    }, []);

    // If there is stored session, we indicate that by setting `true`
    const restoreSession = useRef(false);

    const handleCancel = () => {
        // If a player chooses 'Cancel', we set saved data to its default value
        globalSettings.set("ENABLE_AUDIO", globalSettingsDefaults.ENABLE_AUDIO);
        toggleAudio(globalSettingsDefaults.ENABLE_AUDIO);

        globalSettings.set("LANGUAGE", globalSettingsDefaults.LANGUAGE);
        setTranslation(globalSettingsDefaults.LANGUAGE);

        activeSession.set("INITIAL_SETUP", activeSessionDefaults.INITIAL_SETUP);
        toggleInitialSetup(activeSessionDefaults.INITIAL_SETUP);

        activeSession.set("PROGRESS", activeSessionDefaults.PROGRESS);
        setProgress(activeSessionDefaults.PROGRESS);

        activeSession.set("STATS", activeSessionDefaults.STATS);
        setStats(activeSessionDefaults.STATS);

        // Close modal after out animation
        setTimeout(() => setSavedProcessModalState(false), DIALOG_FADEOUT_ANIMATION_DURATION);
        restoreSession.current = false;
        setRenderGame(true); // render gameInterface
    };

    const handleRestore = () => {
        // Close modal after out animation
        setTimeout(() => setSavedProcessModalState(false), DIALOG_FADEOUT_ANIMATION_DURATION);
        restoreSession.current = true;
        setRenderGame(true); // render gameInterface, restoring stored session
    };

    return (
        <React.Fragment>
            <Titlebar />
            {!mainMenuIsRendered && savedProcessModalState && (
                <Modal isOpen={true} size={"1/2"} toggle={() => {}} unclosable={true} disableScrollBar>
                    <SavedProgressNotification handleCancel={handleCancel} handleRestore={handleRestore} />
                </Modal>
            )}
            <div className="App w-full h-[calc(100vh-1.5rem)] bg-green-500 overflow-hidden">
                {mainMenuIsRendered ? (
                    <MainMenu toggle={setMainMenuRenderState} />
                ) : (
                    renderGame && <GameInterface restoreSession={restoreSession.current} />
                )}
                <Sidebar mainMenuState={mainMenuIsRendered} />
            </div>
        </React.Fragment>
    );
};

export default App;
