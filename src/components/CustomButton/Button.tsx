import React from "react";

import { ICustomButtonProps } from "@src/types";

const CustomButton: React.FC<ICustomButtonProps> = ({ children, styles, ...otherProps }) => {
    return (
        <button className={`btn ${styles}`} {...otherProps}>
            {children}
        </button>
    );
};

export default CustomButton;
