import React, { useState } from "react";
import { Provider } from "react-redux";

import { store } from "./state";
import { ipcRenderer } from "electron";

import Titlebar from "@components/Titlebar";
import Sidebar from "@components/Sidebar";
import MainMenu from "@src/components/MainMenu";
import GameInterface from "@components/GameInterface";

import "./App.scss";

// Send configured store to the main process
ipcRenderer.send("dispatch-main-store", store.getState());

const App: React.FC = () => {
    // Defines the state of the main (start) menu
    const [mainMenuIsRendered, setMainMenuRenderState] = useState(true);

    return (
        <React.Fragment>
            <Titlebar />
            <Provider store={store}>
                <div className="App w-full h-[calc(100vh-1.5rem)] bg-green-500 overflow-hidden">
                    {mainMenuIsRendered ? <MainMenu render={setMainMenuRenderState} /> : <GameInterface />}
                    <Sidebar mainMenuState={mainMenuIsRendered} />
                </div>
            </Provider>
        </React.Fragment>
    );
};

export default App;
