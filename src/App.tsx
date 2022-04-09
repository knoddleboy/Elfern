import React, { useState } from "react";
import readFile from "@utils/readFile";

import Titlebar from "@components/Titlebar";
import Modal from "@components/Modal";
import Sidebar from "@components/Sidebar";
import MainMenu from "@src/components/MainMenu";
import GameInterface from "@components/GameInterface";

import "./App.scss";

const App: React.FC = () => {
    const [modalState, setModalState] = useState(false);
    const [mainMenuIsRendered, setMainMenuRenderState] = useState(true);

    return (
        <React.Fragment>
            <Titlebar />
            <div className="App w-full h-[calc(100vh-1.5rem)] bg-green-primary overflow-hidden">
                {modalState && (
                    <Modal
                        isOpen={modalState}
                        toggleModal={setModalState}
                        displayData={readFile("src/assets/data/rules.md")}
                    />
                )}
                {mainMenuIsRendered ? (
                    <MainMenu render={setMainMenuRenderState} />
                ) : (
                    <GameInterface />
                )}
                <Sidebar toggleModal={setModalState} />
            </div>
        </React.Fragment>
    );
};

export default App;
