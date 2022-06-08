import React from "react";
import useMountTransition from "@utils/hooks/useMountTransition";

import "./Alert.scss";

interface IAlert {
    /** Set to `true` to mount alert */
    isMounted: boolean;

    /** Set to `true` to show be default */
    isDefaultShown?: boolean;

    /** Message to display */
    msg: string;
}

const Alert: React.FC<IAlert> = ({ isMounted, isDefaultShown = false, msg }) => {
    const transitionedIn = useMountTransition(isMounted || isDefaultShown, 1000);

    return transitionedIn || isMounted ? (
        <div
            className={`Alert ${isMounted && "alert-visible"} ${
                transitionedIn && "alert-in"
            } absolute w-[inherit] mt-6 p-3 top-0 right-0 text-center z-[1100]`}
        >
            <span
                className="
            px-5 py-2 rounded-xl
            bg-white-normal text-lg text-dark-700 font-medium
            brightness-110"
            >
                {msg}
            </span>
        </div>
    ) : null;
};

export default Alert;
