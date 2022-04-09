import { useState, useEffect } from "react";

const useBoundingRect = (elementRef: HTMLElement) => {
    const [boundingBox, setBoundingBox] = useState({});

    useEffect(() => {
        if (!elementRef) return;

        // Handler to call on window resize
        const handler = () => setBoundingBox(elementRef.getBoundingClientRect());

        window.addEventListener("resize", handler);

        // Call handler right away so state gets updated with initial window size
        handler();

        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handler);
    }, [elementRef]);

    return boundingBox;
};

export default useBoundingRect;
