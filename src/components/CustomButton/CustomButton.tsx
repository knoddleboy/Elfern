import React from "react";

import AudioClick from "@components/AudioClick";
import { APPLICATION_MEDIA } from "@src/constants";

export interface ICustomButtonProps extends React.ComponentPropsWithoutRef<"button"> {
    /** Children */
    children: React.ReactNode;

    /** Styles to be appended when a button is disabled */
    disabledStyles?: React.CSSProperties;

    /** Set `true` to prevent audio play on click */
    preventAudio?: boolean;

    /** Set `true` to append default styles for a button */
    stylish?: boolean;

    className?: string | undefined;
    onClick?: () => void;
}

const buttonStyles = `
bg-blue-500 hover:bg-blue-400 active:bg-blue-300
border-4 border-blue-700 hover:border-blue-600 active:border-blue-400
text-white-text font-medium
px-5 py-1 rounded-lg active:transition-none
transition-colors duration-75`;

const CustomButton: React.FC<ICustomButtonProps> = ({
    children,
    className,
    disabledStyles,
    preventAudio,
    stylish = false,
    tabIndex,
    onClick,
}) => {
    return (
        <AudioClick sound={APPLICATION_MEDIA.click} preventAudio={preventAudio}>
            <button
                className={`btn ${className || ""} ${stylish && buttonStyles}`}
                // Increase specificity by adding following styles to a style tag rather than to a className
                style={{
                    pointerEvents: disabledStyles ? "none" : "auto",
                    ...disabledStyles,
                }}
                onClick={onClick}
                tabIndex={tabIndex}
            >
                {children}
            </button>
        </AudioClick>
    );
};

export default CustomButton;
