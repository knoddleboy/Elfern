import React, { useState } from "react";

import CustomButton from "@components/CustomButton";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import SettingsMenu from "@components/SettingsMenu";

import "./SettingsButton.scss";

const SettingsButton: React.FC<{ tabIndex?: number }> = ({ tabIndex }) => {
    const [settingsMenuState, setSettingsMenuState] = useState(false);

    return (
        <React.Fragment>
            {settingsMenuState && <SettingsMenu isOpen={settingsMenuState} toggle={setSettingsMenuState} />}
            <CustomButton
                className="mt-auto rounded-[25%]"
                onClick={() => setSettingsMenuState((prevState) => !prevState)}
                tabIndex={tabIndex}
            >
                <SettingsRoundedIcon
                    className="SettingsButton text-green-800 hover:brightness-[60%] hover:rotate-12"
                    sx={{ fontSize: 32, filter: "brightness(75%)" }}
                />
            </CustomButton>
        </React.Fragment>
    );
};

export default SettingsButton;
