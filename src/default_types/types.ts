import React from "react";

export type ElectronIpcChannel = string;
export type CSSProps = string;

export interface CustomButtonProps extends React.ComponentPropsWithoutRef<"button"> {
    children: React.ReactNode;
    styles?: CSSProps;
    props?: {};
    onClick?: (() => void) | undefined;
}
