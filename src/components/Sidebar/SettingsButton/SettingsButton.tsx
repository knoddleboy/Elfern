import React from "react";

import CustomButton from "@components/CustomButton";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";

const SettingsButton: React.FC = () => (
    <CustomButton className="mt-auto" onClick={() => alert("Settings...")}>
        <SettingsRoundedIcon
            className="text-green-dark hover:brightness-[.5] hover:rotate-12"
            sx={{ fontSize: 32, filter: "brightness(70%)", transition: "all 100ms linear" }}
        />
    </CustomButton>
);

export default SettingsButton;
