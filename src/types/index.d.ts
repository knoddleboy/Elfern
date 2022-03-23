import React from "react";

export type ElectronIpcChannel = string;
export type CSSProps = string;
export type ReactSetState = React.Dispatch<React.SetStateAction<boolean>>;

export interface CustomButtonProps extends React.ComponentPropsWithoutRef<"button"> {
    children: React.ReactNode;
    styles?: CSSProps;
    props?: {};
    onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
}
