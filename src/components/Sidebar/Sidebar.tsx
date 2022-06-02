import React from "react";

import RulesButton from "./RulesButton";
import SettingsButton from "./SettingsButton";

interface ISidebar {
    mainMenuState: boolean;
}

const Sidebar: React.FC<ISidebar> = ({ mainMenuState }) => (
    <React.Fragment>
        {mainMenuState ? (
            <div className="w-auto h-[calc(100%-24px)] fixed right-0 bottom-0 p-3 flex flex-col">
                <RulesButton tabIndex={1} />
                <SettingsButton tabIndex={2} />
            </div>
        ) : (
            <div className="w-full fixed left-0 top-0 p-3 mt-6 flex flex-row-reverse justify-between">
                <RulesButton tabIndex={2} />
                <SettingsButton tabIndex={1} />
            </div>
        )}
    </React.Fragment>
);

export default Sidebar;
