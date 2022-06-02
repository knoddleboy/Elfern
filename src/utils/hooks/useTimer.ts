import { useState, useRef } from "react";

const useTimer = (initialState = 0) => {
    const [timer, setTimer] = useState(initialState);
    const timerRef = useRef<number>();

    const handleResume = () => {
        // We save setInterval ID into timerRef, to be able to keep its current value and reference it later
        timerRef.current = window.setInterval(() => {
            setTimer((prevTime) => prevTime + 1);
        }, 1000);
    };

    const handlePause = () => {
        // When handling pause, we clear setInterval, thus stopping (not resetting) the timer
        clearInterval(timerRef.current);
    };

    // Reset everything to its initial values
    const handleReset = () => {
        clearInterval(timerRef.current);
        setTimer(0);
    };

    return { timer, handleResume, handlePause, handleReset };
};

export default useTimer;
