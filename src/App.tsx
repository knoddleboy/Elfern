import React from "react";
import readFile from "@utils/readFile";

import Titlebar from "./components/Titlebar";
import RulesSection from "./components/RulesSection";
import Modal from "./components/Modal";

import "./App.scss";

const App: React.FC = () => (
    <React.Fragment>
        <Titlebar />
        <div
            className="App w-full bg-green-primary overflow-hidden"
            style={{ height: "calc(100vh - 1.5rem)" }}
        >
            <RulesSection />
            <Modal displayData={readFile("src/assets/data/rules.md")} />
        </div>
    </React.Fragment>
);

export default App;
