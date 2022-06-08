import React, { useState, useRef, useEffect } from "react";

import AudioClick from "@components/AudioClick";
import { APPLICATION_MEDIA } from "@src/constants";

import "./Switch.scss";

interface ISwitch {
    /** Switch size */
    size?: number;

    /** Action to execute on switch change */
    onChange?: () => void;

    /** Defines wether the switch is checked bu default */
    defaultChecked?: boolean;
}

/** Switch component */
const Switch: React.FC<ISwitch> = ({ size, onChange, defaultChecked }) => {
    const [switchState, setSwitchState] = useState(defaultChecked || false);
    const inputRef = useRef<HTMLInputElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Add focus styles to the switch's button when navigating with Tab
        function addThumbFocus(e: KeyboardEvent) {
            if (!(e.key === "Tab")) return;
            if (trackRef.current && document.activeElement === inputRef.current) {
                trackRef.current.classList.add("switch-focused");
            }
        }

        // Remove switch's thumb focus when click outside the switch or press any key except for Enter and Space
        function removeThumbFocus(e: Event | KeyboardEvent) {
            // Omit Enter and Space keys
            if (e instanceof KeyboardEvent && (e.key === "Enter" || e.key === " ")) return;

            // If the active document element is the switch's thumb, remove focus styles
            if (trackRef.current && document.activeElement === inputRef.current) {
                trackRef.current.classList.remove("switch-focused");
            }
        }

        document.addEventListener("keyup", addThumbFocus);
        document.addEventListener("keydown", removeThumbFocus);
        document.addEventListener("mousedown", removeThumbFocus);

        return () => {
            document.removeEventListener("keyup", addThumbFocus);
            document.removeEventListener("keydown", removeThumbFocus);
            document.removeEventListener("mousedown", removeThumbFocus);
        };
    });

    const handleChange = () => {
        setSwitchState((prevState) => !prevState);

        // Execute function on switch change
        if (onChange) onChange();
    };

    return (
        <AudioClick sound={switchState ? APPLICATION_MEDIA.switchOff : APPLICATION_MEDIA.switchOn} alwaysOn={true}>
            <div
                className={`switch-root ${switchState ? "switch-checked" : ""} relative z-0 cursor-pointer`}
                style={{
                    width: size ? 2 * size + "rem" : "2.5rem",
                    height: size ? size + "rem" : "1.25rem",
                }}
            >
                <div
                    className={`switch-base
                absolute top-0 left-0 z-1
                rounded-full select-none
                inline-flex items-center
                bg-white-normal cursor-pointer`}
                >
                    <input
                        type="checkbox"
                        className="absolute w-[300%] h-full top-0 -left-full opacity-0 cursor-[inherit] z-[1]"
                        ref={inputRef}
                        onChange={handleChange}
                        tabIndex={0}
                    />
                    <div
                        className={`switch-thumb rounded-full cursor-[inherit]`}
                        style={{
                            width: size ? `calc(${size}rem - 3px)` : "calc(1.25rem - 3px)",
                            height: size ? `calc(${size}rem - 3px)` : "calc(1.25rem - 3px)",
                        }}
                    ></div>
                </div>
                <div className={`switch-track w-full h-full rounded-full cursor-pointer -z-[1]`} ref={trackRef}></div>
            </div>
        </AudioClick>
    );
};

export default Switch;
