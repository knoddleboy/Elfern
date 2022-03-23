import React from "react";

import { CustomButtonProps } from "@src/types";

const Button: React.FC<CustomButtonProps> = ({ children, styles, ...otherProps }) => {
    return (
        <button className={`btn ${styles}`} {...otherProps}>
            {children}
        </button>
    );
};

export default Button;
