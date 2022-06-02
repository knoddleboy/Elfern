import React from "react";

interface IStyledButton {
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

const StyledButton: React.FC<IStyledButton> = ({ children, className, style, onClick }) => (
    <button
        className={`${className}
        bg-blue-500 hover:bg-blue-400 active:bg-blue-300
        border-4 border-blue-700 hover:border-blue-600 active:border-blue-400
        text-white-text font-medium
        px-5 py-1 rounded-lg
        active:transition-none transition-colors duration-75`}
        onClick={onClick}
        style={style}
    >
        {children}
    </button>
);

export default StyledButton;
