import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";

import { TitlebarButtons } from "@utils/TitlebarButtons";

import TitlebarIcon from "./TitlebarIcon";
import TitlebarTitle from "./TitlebarTitle";
import CustomButton from "../CustomButton";

import { default as MinimizeWindow } from "@mui/icons-material/HorizontalRuleRounded";
import { default as MaximizeWindow } from "@mui/icons-material/CropSquare";
import { default as CloseWindow } from "@mui/icons-material/CloseRounded";
import { default as RestoreWindow } from "@mui/icons-material/FilterNoneRounded";

import "./Titlebar.scss";

const Titlebar: React.FC = () => {
    const ToggleIconColor = "#e1e2e1";
    const ButtonStyles = "flex items-center justify-center w-9 cursor-auto";

    const [windowState, setWindowState] = useState(false);

    useEffect(() => {
        ipcRenderer.on("window-maximized", () => setWindowState((prevState) => !prevState));
        ipcRenderer.on("window-restored", () => setWindowState((prevState) => !prevState));
    }, []);

    return (
        <div className="Titlebar w-full h-6 bg-dark-800 relative">
            <div className="absolute h-full top-0 left-0 flex justify-between">
                <TitlebarIcon />
                <TitlebarTitle />
            </div>
            <div className="absolute h-full top-0 right-0 flex justify-between">
                <CustomButton
                    className={`${ButtonStyles} hover:bg-dark-600`}
                    onClick={TitlebarButtons.minimizeApp}
                >
                    <MinimizeWindow
                        sx={{ color: ToggleIconColor, fontSize: 16, marginTop: "8px" }}
                    />
                </CustomButton>
                <CustomButton
                    className={`${ButtonStyles} hover:bg-dark-600`}
                    onClick={TitlebarButtons.maximizeRestoreApp}
                >
                    {windowState ? (
                        <RestoreWindow
                            sx={{
                                color: ToggleIconColor,
                                fontSize: 12,
                                transform: "rotate(180deg)",
                            }}
                        />
                    ) : (
                        <MaximizeWindow sx={{ color: ToggleIconColor, fontSize: 15 }} />
                    )}
                </CustomButton>
                <CustomButton
                    className={`${ButtonStyles} hover:bg-[#cf0e1e]`}
                    onClick={TitlebarButtons.closeApp}
                >
                    <CloseWindow sx={{ color: ToggleIconColor, fontSize: 17 }} />
                </CustomButton>
            </div>
        </div>
    );
};

export default Titlebar;
