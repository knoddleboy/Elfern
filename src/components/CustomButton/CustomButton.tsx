import React from "react";

import AudioClick from "@components/AudioClick";
import { APPLICATION_MEDIA } from "@constants/global";

interface ICustomButtonProps extends React.ComponentPropsWithoutRef<"button"> {
    children: React.ReactNode;
    className?: string | undefined;
    disabledStyles?: React.CSSProperties;
    preventAudio?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement> | (() => void);
    otherProps?: React.PropsWithoutRef<HTMLButtonElement>;
}

const CustomButton: React.FC<ICustomButtonProps> = ({
    children,
    className,
    disabledStyles,
    preventAudio,
    onClick,
    ...otherProps
}) => {
    return (
        <AudioClick sound={APPLICATION_MEDIA.click} preventAudio={preventAudio}>
            <button
                className={`btn ${className ? className : ""}`}
                // Increase specificity by adding following styles to a style tag rather than to a className
                style={{
                    pointerEvents: disabledStyles ? "none" : "auto",
                    ...disabledStyles,
                }}
                {...otherProps}
                onClick={onClick}
            >
                {children}
            </button>
        </AudioClick>
    );
};

export default CustomButton;
