import { useState, useEffect } from "react";

const useMountTransition = (isMounted: boolean, unmountDelay: number) => {
    const [hasTransitionedIn, setHasTransitionedIn] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout; // for clearing

        // If `isMounted` is true, and we are not yet transitioning, set `hasTransitionedIn` to true. At this point,
        // the hook will be returning true. Otherwise, if the opposite scenario is true, then we're in the
        // unmounting process. The `hasTransitionedIn` state should be set to false after a delay.
        if (isMounted && !hasTransitionedIn) {
            setHasTransitionedIn(true);
        } else if (!isMounted && hasTransitionedIn) {
            timeoutId = setTimeout(() => setHasTransitionedIn(false), unmountDelay);
        }

        return () => {
            clearTimeout(timeoutId);
        };
    }, [unmountDelay, isMounted, hasTransitionedIn]);

    return hasTransitionedIn;
};

export default useMountTransition;
