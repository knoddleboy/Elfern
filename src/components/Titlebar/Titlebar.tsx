import React from "react";

import { TitlebarButtons } from "@utils/TitlebarButtons";

import TitlebarIcon from "./TitlebarIcon";
import TitlebarTitle from "./TitlebarTitle";
import Button from "../CustomButton";

import HorizontalRuleRoundedIcon from "@mui/icons-material/HorizontalRuleRounded";
import CropSquareIcon from "@mui/icons-material/CropSquare";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

import "./Titlebar.scss";

const Titlebar: React.FC = () => {
    const ToggleIconColor = "#e1e2e1";
    const ButtonStyles = "flex items-center justify-center w-9 cursor-auto";

    return (
        <div className="Titlebar w-full h-6 bg-dark-800 relative">
            <div className="absolute h-full top-0 left-0 flex justify-between">
                <TitlebarIcon />
                <TitlebarTitle />
            </div>
            <div className="absolute h-full top-0 right-0 flex justify-between">
                <Button
                    styles={`${ButtonStyles} hover:bg-dark-600`}
                    onClick={TitlebarButtons.minimizeApp}
                >
                    <HorizontalRuleRoundedIcon
                        sx={{ color: ToggleIconColor, fontSize: 16, marginTop: "8px" }}
                    />
                </Button>
                <Button
                    styles={`${ButtonStyles} hover:bg-dark-600`}
                    onClick={TitlebarButtons.maximizeRestoreApp}
                >
                    <CropSquareIcon sx={{ color: ToggleIconColor, fontSize: 15 }} />
                </Button>
                <Button
                    styles={`${ButtonStyles} hover:bg-[#cf0e1e]`}
                    onClick={TitlebarButtons.closeApp}
                >
                    <CloseRoundedIcon sx={{ color: ToggleIconColor, fontSize: 17 }} />
                </Button>
            </div>
        </div>
    );
};

export default Titlebar;
