import React from "react";

import { ICustomButtonProps } from "@src/types";

const CustomButton: React.FC<ICustomButtonProps> = ({
    children,
    className,
    disabled,
    ...otherProps
}) => {
    return (
        <button className={`btn ${className ? className : ""}`} {...otherProps}>
            {children}
        </button>
    );
};

export default CustomButton;
