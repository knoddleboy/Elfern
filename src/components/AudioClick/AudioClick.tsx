import React from "react";

import useAudio from "@utils/hooks/useAudio";

interface IClickWrapper {
    sound: string;
    preventAudio?: boolean;
    alwaysOn?: boolean;
    children: React.ReactElement<any>;
}

const AudioClick: React.FC<IClickWrapper> = ({ sound, preventAudio, children, alwaysOn = false }) => {
    const [toggle] = useAudio(sound, alwaysOn);

    const clickWithSound = () => {
        const prevClickHandler = children.props.onClick;
        if (prevClickHandler) prevClickHandler();
        !preventAudio && toggle();
    };

    return React.cloneElement(children, {
        onClick: clickWithSound,
    });
};

export default AudioClick;
