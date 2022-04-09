import React from "react";

import CustomButton from "@src/components/CustomButton";

import { default as CancelAction } from "@mui/icons-material/RestartAltRounded";
import { default as NewGame } from "@mui/icons-material/StarsRounded";

const PlayAreaSidebarButtons: React.FC = () => (
    <div className="w-[inherit] h-[56px] flex justify-between absolute bottom-0">
        <CustomButton
            className="text-green-dark flex-grow flex-center brightness-[1.2]"
            onClick={() => alert("Cancel")}
        >
            <CancelAction sx={{ fontSize: 30 }} />
            <span className="ml-2 uppercase">Cancel</span>
        </CustomButton>
        <CustomButton
            className="text-green-dark flex-grow flex-center brightness-[0.9]"
            onClick={() => alert("New game")}
        >
            <NewGame sx={{ fontSize: 30 }} />
            <span className="ml-2 uppercase">New game</span>
        </CustomButton>
    </div>
);

export default PlayAreaSidebarButtons;
