import React from "react";

import RulesButton from "./RulesButton";
import SettingsButton from "./SettingsButton";

import { ReactSetState } from "@src/types";

const Sidebar: React.FC<{ toggleModal: ReactSetState }> = ({ toggleModal }) => (
    <div
        className="
        w-auto h-[calc(100%-24px)]
        fixed right-0 bottom-0 p-3
        flex flex-col"
    >
        <RulesButton toggleModal={toggleModal} />
        {/* <SettingsButton /> */}
    </div>
);

export default Sidebar;
