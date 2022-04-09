import React, { useState, useEffect } from "react";

export interface IUseElementSize {
    width: number | null;
    height: number | null;
}

const useElementSize = (elementRef: React.RefObject<HTMLElement> | undefined) => {
    const [elementSize, setElementSize] = useState<IUseElementSize>({
        width: null,
        height: null,
    });

    useEffect(() => {
        if (!elementRef) return;

        // Handler to call on window resize
        const handleResize = () => {
            if (elementRef.current) {
                setElementSize({
                    width: elementRef.current.clientWidth,
                    height: elementRef.current.clientHeight,
                });
            }
        };

        window.addEventListener("resize", handleResize);

        // Call handler right away so state gets updated with initial window size
        handleResize();

        // Remove event listener on cleanup
        return () => window.removeEventListener("resize", handleResize);
    }, [elementRef]);

    return elementSize;
};

export default useElementSize;
