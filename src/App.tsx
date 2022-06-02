import React, { useEffect, useState, useRef } from "react";

import { ipcRenderer } from "electron";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import Titlebar from "@components/Titlebar";
import Modal from "@components/Modal";
import Sidebar from "@components/Sidebar";
import MainMenu from "@src/components/MainMenu";
import GameInterface from "@components/GameInterface";
import SavedProgressNotification from "@components/SavedProgressNotification";

import "./App.scss";

const { globalSettings, storeDefaults } = require("./configs");

const App: React.FC = () => {
    const dispatch = useDispatch();
    const { setRoundStats, toggleInitialSetup, setTimerState, setCurrentScore } = bindActionCreators(
        actionCreators,
        dispatch
    );

    const store = useSelector((state: State) => state);

    // Defines the state of the main (start) menu
    const [mainMenuIsRendered, setMainMenuRenderState] = useState(true);

    // Defined wether to show warning window (see below)
    const [savedProcessModalState, setSavedProcessModalState] = useState(false);

    // ...
    const savedProcessGuard = useRef(false);

    const [renderApp, setRenderApp] = useState(false);

    // If INITIAL_SETUP does not match with the stored one (which means that a user
    // once started a game and did not finished it), show warning about saved progress
    useEffect(() => {
        // Send configured store to the main process
        // ipcRenderer.send("dispatch-main-store", store);

        const savedProgress = store;
        if (storeDefaults.INITIAL_SETUP !== savedProgress.INITIAL_SETUP) setSavedProcessModalState(true);
        else savedProcessGuard.current = true;
    }, []);

    useEffect(() => {
        if (savedProcessGuard.current) setRenderApp(true);
    }, [savedProcessGuard.current]);

    return (
        <React.Fragment>
            <Titlebar />
            {savedProcessModalState && (
                <Modal isOpen={true} size={"1/2"} toggleModal={() => {}} unclosable={true} disableScrollBar sinkTimer>
                    <SavedProgressNotification
                        handleCancel={() => {
                            // If a player chooses 'Cancel', we set saved data to its default value
                            globalSettings.set("ROUND_STATS", storeDefaults.ROUND_STATS);
                            setRoundStats(storeDefaults.ROUND_STATS);

                            globalSettings.set("INITIAL_SETUP", storeDefaults.INITIAL_SETUP);
                            toggleInitialSetup();

                            globalSettings.set("TIMER_STATE", storeDefaults.TIMER_STATE);
                            setTimerState(storeDefaults.TIMER_STATE);

                            globalSettings.set("CURRENT_SCORE", storeDefaults.CURRENT_SCORE);
                            setCurrentScore(storeDefaults.CURRENT_SCORE);

                            setTimeout(() => setSavedProcessModalState(false), 300);
                            savedProcessGuard.current = true;
                        }}
                        handleRestore={() => {
                            setTimeout(() => setSavedProcessModalState(false), 300);
                            savedProcessGuard.current = true;
                        }}
                    />
                </Modal>
            )}
            <div className="App w-full h-[calc(100vh-1.5rem)] bg-green-500 overflow-hidden">
                {/* {mainMenuIsRendered ? <MainMenu render={setMainMenuRenderState} /> : renderApp && <GameInterface />}
                <Sidebar mainMenuState={mainMenuIsRendered} /> */}
                {renderApp && (
                    <>
                        <GameInterface />
                        <Sidebar mainMenuState={false} />
                    </>
                )}
            </div>
            <button className="bg-dark-800 px-4 py-1 text-white-text" onClick={() => console.log(store)} tabIndex={-1}>
                Get redux store
            </button>
        </React.Fragment>
    );
};

export default App;
