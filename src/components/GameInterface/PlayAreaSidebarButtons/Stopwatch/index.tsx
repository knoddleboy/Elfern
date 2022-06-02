import React, { useEffect } from "react";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import useTimer from "@utils/hooks/useTimer";
import { formatTime } from "@utils/utils";

interface IStopwatch {
    className?: string;
}

const Stopwatch: React.FC<IStopwatch> = ({ className }) => {
    const dispatch = useDispatch();
    const { setTimerState } = bindActionCreators(actionCreators, dispatch);
    const timerState = useSelector((state: State) => state.TIMER_STATE);

    const { timer, handleResume, handlePause, handleReset } = useTimer();

    useEffect(() => {
        setTimerState({
            ...timerState,
            time: timer,
        });
    }, [timer]);

    useEffect(() => {
        if (timerState.start) {
            handleResume();
            setTimerState({
                ...timerState,
                pause: false,
                resume: false,
                reset: false,
            });
        }
    }, [timerState.start]);

    useEffect(() => {
        if (timerState.start && timerState.pause) {
            handlePause();
            setTimerState({
                ...timerState,
                resume: false,
                reset: false,
            });
        }
    }, [timerState.pause]);

    useEffect(() => {
        if (timerState.start && timerState.resume) {
            handleResume();
            setTimerState({
                ...timerState,
                pause: false,
                reset: false,
            });
        }
    }, [timerState.resume]);

    useEffect(() => {
        if (timerState.start && timerState.reset) {
            handleReset();
            setTimerState({
                ...timerState,
                start: false,
                resume: false,
                pause: false,
            });
        }
    }, [timerState.reset]);

    return <div className={`text-center tabular-nums lining-nums ${className}`}>{formatTime(timer)}</div>;
};

export default Stopwatch;
