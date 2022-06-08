import React from "react";

import useAudio from "@utils/hooks/useAudio";

interface IClickWrapper {
    /** Children */
    children: React.ReactElement<any>;

    /** Path to the sound */
    sound: string;

    /** Set `true` to prevent sound from play */
    preventAudio?: boolean;

    /** Set `true` to be able to play even if the app's sound is disabled */
    alwaysOn?: boolean;
}

/**
 * Audio click. When a clickable element (here - `children`) is wrapped with the component,
 * the children is copied to the component and its original `onClick` is supplemented by 'click toggler'.
 * Therefore when a user clicks on the element, the original onClick function executes and the click sound is played.
 */
const AudioClick: React.FC<IClickWrapper> = ({ children, sound, preventAudio, alwaysOn = false }) => {
    const [toggle] = useAudio(sound, alwaysOn);

    const clickWithSound = () => {
        // Copy original onClick ...
        const prevClickHandler = children.props.onClick;

        // ... execute it ...
        if (prevClickHandler) prevClickHandler();

        // ... and play click sound if it is not prevented
        !preventAudio && toggle();
    };

    // Return the same element, but with updated onClick
    return React.cloneElement(children, {
        onClick: clickWithSound,
    });
};

export default AudioClick;
