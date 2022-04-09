import React, { useRef, useEffect } from "react";

const useEventListener = <
    EW extends keyof WindowEventMap,
    EH extends keyof HTMLElementEventMap,
    T extends HTMLElement | void = HTMLDivElement
>(
    eventName: EW | EH,
    handler: (event: WindowEventMap[EW] | HTMLElementEventMap[EH] | Event) => void,
    element?: React.RefObject<T>
): void => {
    // Create a ref that stores handler
    const savedHandler = useRef(handler);

    // Update .current value if handler changes to always get latest handle
    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        // Define the listening target and check if it supports addEventListener
        const targetElement: T | (Window & typeof globalThis) = element?.current || window;
        if (!(targetElement && targetElement.addEventListener)) return;

        // Create event listener that calls handler function stored in ref
        const eventListener: typeof handler = (event) => savedHandler.current(event);

        // Add event listener
        targetElement.addEventListener(eventName, eventListener);

        // Remove event listener on cleanup
        return () => {
            targetElement.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element]); // Re-run if eventName or element changes
};

export default useEventListener;
