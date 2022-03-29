import React from "react";

import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

const Settings: React.FC = () => (
    <div className="w-full fixed bottom-0">
        <div className="float-right flex items-center p-3">
            <div className="cursor-pointer">
                <SettingsRoundedIcon
                    className="text-green-dark hover:brightness-[.5] hover:rotate-12"
                    sx={{ fontSize: 32, filter: "brightness(70%)", transition: "all 100ms linear" }}
                />
            </div>
        </div>
    </div>
);

export default Settings;
