import React, { useState, useEffect } from "react";
import { ipcRenderer } from "electron";

import DispatchToMainProcess from "@utils/DispatchToMainProcess";

import TitlebarIcon from "./TitlebarIcon";
import TitlebarTitle from "./TitlebarTitle";

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
                <button
                    className={`${ButtonStyles} hover:bg-dark-600`}
                    onClick={DispatchToMainProcess.minimizeApp}
                    tabIndex={1}
                >
                    <MinimizeWindow sx={{ color: ToggleIconColor, fontSize: 16, marginTop: "8px" }} />
                </button>
                <button
                    className={`${ButtonStyles} hover:bg-dark-600`}
                    onClick={DispatchToMainProcess.maximizeRestoreApp}
                    tabIndex={2}
                >
                    {windowState ? (
                        <MaximizeWindow sx={{ color: ToggleIconColor, fontSize: 15 }} />
                    ) : (
                        <RestoreWindow
                            sx={{
                                color: ToggleIconColor,
                                fontSize: 12,
                                transform: "rotate(180deg)",
                            }}
                        />
                    )}
                </button>
                <button
                    className={`${ButtonStyles} hover:bg-[#cf0e1e]`}
                    onClick={DispatchToMainProcess.closeApp}
                    tabIndex={3}
                >
                    <CloseWindow sx={{ color: ToggleIconColor, fontSize: 17 }} />
                </button>
            </div>
        </div>
    );
};

export default Titlebar;
