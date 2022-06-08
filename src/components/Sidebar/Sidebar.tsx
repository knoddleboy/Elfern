import React from "react";

import RulesButton from "./RulesButton";
import SettingsButton from "./SettingsButton";

// If main menu is rendered, we display settings & rules buttons from top to bottom, otherwise - from left to right
const Sidebar: React.FC<{ mainMenuState: boolean }> = ({ mainMenuState }) => (
    <React.Fragment>
        {mainMenuState ? (
            <div className="Sidebar w-auto h-[calc(100%-24px)] fixed right-0 bottom-0 p-3 flex flex-col">
                <RulesButton tabIndex={1} />
                <SettingsButton tabIndex={2} />
            </div>
        ) : (
            <div className="Sidebar w-full fixed left-0 top-0 p-3 mt-6 flex flex-row-reverse justify-between">
                <RulesButton tabIndex={2} />
                <SettingsButton tabIndex={1} />
            </div>
        )}
    </React.Fragment>
);

export default Sidebar;
