import React, { useState, useEffect, useRef } from "react";
import CountUp from "react-countup";

import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import { actionCreators, State } from "@state/index";

import useTranslation from "@utils/hooks/useTranslation";

import CustomButton from "@components/CustomButton";
import Table from "./Table";
import Modal from "@components/Modal";
import FinalModal from "../FinalModal";

import { CardRank } from "@utils/CardLinker/CardLinker.types";
import { ReactSetState } from "@src/types";

import { APPLICATION_MEDIA } from "@constants/global";

import "@components/MainMenu/MainMenu.scss";
import "./index.scss";

export interface IHonors {
    player: { [key in CardRank]: number };
    opponent: { [key in CardRank]: number };
}

interface IScoring {
    honors: IHonors;
    handleNextRound: ReactSetState;
}

const Scoring: React.FC<IScoring> = ({ honors, handleNextRound }) => {
    const dispatch = useDispatch();
    const { setRoundStats, setCurrentScore, setTimerState } = bindActionCreators(actionCreators, dispatch);
    const roundStats = useSelector((state: State) => state.ROUND_STATS);
    const currentScore = useSelector((state: State) => state.CURRENT_SCORE);
    const timerState = useSelector((state: State) => state.TIMER_STATE);

    const { t } = useTranslation();

    // Since we need current score values to show addition to the calculated values and
    // these values will change overtime, we need to store the values
    const prevScore = useRef({
        player: currentScore.player,
        opponent: currentScore.opponent,
    });

    // Same thing here. Just storing score copies to be sure that none of them is changed overtime
    const [newScore, setNewScore] = useState<typeof currentScore>({
        player: currentScore.player,
        opponent: currentScore.opponent,
    });

    // Calculate the total score based on the honors, received from the parent component (excluding 7-9 honors: see below)
    const totalSidePoints = (side: "player" | "opponent") => {
        let totalPoints = 0;

        Object.entries(honors[side]).forEach((h) => {
            // Exclude 7, 8 and 9 from counting since according to the rules they cost 0 points
            if (!(h[0] === "7" || h[0] === "8" || h[0] === "9")) totalPoints += h[1];
        });

        return totalPoints;
    };

    // Indicates the end of the count up animation in the table
    const [tableCountingAnimationEnd, setTableCountingAnimationEnd] = useState(false);

    // Show previous scores to add them up to currently calculated ones
    const [addPrevScoresAnimation, setAddPrevScoresAnimation] = useState(false);

    // Indicates when to show the 'next round' button
    const [activeNextRound, setActiveNextRound] = useState(false);

    // When the component is mounted, the table counting up animation is started straightaway,
    // and after it is over we give it 6500ms, we start score count up animation
    useEffect(() => {
        const timer = setTimeout(() => setTableCountingAnimationEnd(true), 6500);
        return () => clearTimeout(timer);
    }, []);

    // When the score count up animation is over, after 2s show previous scores to add up
    useEffect(() => {
        if (!tableCountingAnimationEnd) return;
        const timer = setTimeout(() => setAddPrevScoresAnimation(true), 2000);
        return () => clearTimeout(timer);
    }, [tableCountingAnimationEnd]);

    // Lastly, after prev scores were shown (3500ms), we activate 'next round' button
    useEffect(() => {
        if (!addPrevScoresAnimation) return;
        const timer = setTimeout(() => setActiveNextRound(true), 3500);
        return () => clearTimeout(timer);
    }, [addPrevScoresAnimation]);

    // When score count up animation is over, we show previous scores (them add them to current ones)
    const [scoreAddingUpPopupAnimation, setScoreAddingUpPopupAnimation] = useState(false);

    // Just to indicate the end of the animation, described above. When true, zoom in biggest score
    const [scoreAddingUpPopupAnimationEnd, setScoreAddingUpPopupAnimationEnd] = useState(false);

    // When scoreAddingUpAnimation is true, that means that we've already played score count up animation,
    // thus we will not change score variable again, so we can send it back to its corresponding redux variable
    useEffect(() => {
        if (scoreAddingUpPopupAnimation) {
            const timer = setTimeout(() => setScoreAddingUpPopupAnimationEnd(true), 2000);

            setCurrentScore({
                player: newScore.player,
                opponent: newScore.opponent,
            });

            return () => clearTimeout(timer);
        }
    }, [scoreAddingUpPopupAnimation]);

    // Find the maximum number of digits between player score and opponent score numbers to set
    // the minimum width for the place where these numbers are located to prevent them from moving
    function maxScoreNumberLength() {
        return Math.max(currentScore.player.toString().length, currentScore.opponent.toString().length);
    }

    // Every time when the component is mounted, we define if that was the last round
    const lastRoundPlayed = roundStats.current === roundStats.max;

    // Define who've won the entire game (based on this, we will run the winning animation & sound)
    const [finalWinner, setFinalWinner] = useState<"player" | "opponent">();

    useEffect(() => {
        if (!scoreAddingUpPopupAnimationEnd) return;
        setFinalWinner(newScore.player > newScore.opponent ? "player" : "opponent");
    }, [scoreAddingUpPopupAnimationEnd]);

    // Defines whether to show final window
    const [showFinalModal, setShowFinalModal] = useState(false);

    // When the game winner (intermediate or final) is chosen
    useEffect(() => {
        if (!(finalWinner && lastRoundPlayed)) return;

        const timers: NodeJS.Timeout[] = []; // Just for clearing

        // After 2500ms show final modal ...
        timers[0] = setTimeout(() => setShowFinalModal(true), 2500);

        // ... and if player won, play winscreen sound with 1600ms of delay
        // (since winscreen sound must be synchronized with the modal appearance)
        if (finalWinner === "player") {
            timers[1] = setTimeout(() => new Audio(APPLICATION_MEDIA.winscreen).play(), 1600);
        }

        return () => timers.forEach((t) => clearTimeout(t));
    }, [finalWinner]);

    // When the final modal is showed and opponent won, play lose sound (here we don't need any delay)
    useEffect(() => {
        if (showFinalModal && finalWinner === "opponent") new Audio(APPLICATION_MEDIA.losescreen).play();
    }, [showFinalModal]);

    return (
        <React.Fragment>
            {showFinalModal && (
                <Modal isOpen={true} size={"1/3"} toggleModal={() => {}} unclosable={true} disableScrollBar>
                    <FinalModal state={finalWinner === "player" ? "win" : "lose"} handleFinalReset={handleNextRound} />
                </Modal>
            )}
            <div className="h-full px-2 py-0 flex flex-center flex-col">
                <h1 className="text-center text-[3.2vw] text-dark-700 mb-8">
                    {t("scoring.title")} <span className="mx-1 underline">{roundStats.current}</span> / {roundStats.max}
                </h1>
                <div className="flex-1 w-full">
                    <Table
                        caption={t("scoring.side.player")}
                        sideHonors={honors.player}
                        className={tableCountingAnimationEnd ? "counting-end" : ""}
                    />
                    <hr className="my-7" />
                    <Table
                        caption={t("scoring.side.opponent")}
                        sideHonors={honors.opponent}
                        animationDelay={3}
                        className={tableCountingAnimationEnd ? "counting-end" : ""}
                    />
                </div>
                <div className="w-full flex-1 flex-center text-center text-lg font-medium text-dark-400">
                    {addPrevScoresAnimation && (
                        <span className="prev-scores text-base text-dark-200 mr-8">{prevScore.current.player} +</span>
                    )}
                    <span className={`min-w-[2ch] w-[${maxScoreNumberLength()}ch]`}>
                        {tableCountingAnimationEnd && !scoreAddingUpPopupAnimation ? (
                            <CountUp
                                end={totalSidePoints("player")}
                                duration={1.25}
                                delay={0.75}
                                onEnd={() => {
                                    setNewScore((prev) => ({
                                        ...prev,
                                        player: prev.player + totalSidePoints("player"),
                                    }));
                                    setTimeout(() => setScoreAddingUpPopupAnimation(true), 2000);
                                }}
                            />
                        ) : (
                            !scoreAddingUpPopupAnimation && 0
                        )}
                        {scoreAddingUpPopupAnimation && (
                            <span
                                className={`${
                                    lastRoundPlayed &&
                                    finalWinner === "player" &&
                                    scoreAddingUpPopupAnimationEnd &&
                                    "winning-score"
                                }`}
                            >
                                {newScore.player}
                            </span>
                        )}
                    </span>
                    <span className="mx-5 font-extrabold text-dark-700">/</span>
                    <span className={`min-w-[2ch] w-[${maxScoreNumberLength()}ch]`}>
                        {tableCountingAnimationEnd && !scoreAddingUpPopupAnimation ? (
                            <CountUp
                                end={totalSidePoints("opponent")}
                                duration={1.25}
                                delay={0.75}
                                onEnd={() => {
                                    setNewScore((prev) => ({
                                        ...prev,
                                        opponent: prev.opponent + totalSidePoints("opponent"),
                                    }));
                                    setTimeout(() => setScoreAddingUpPopupAnimation(true), 2000);
                                }}
                            />
                        ) : (
                            !scoreAddingUpPopupAnimation && 0
                        )}
                        {scoreAddingUpPopupAnimation && (
                            <span
                                className={`${
                                    lastRoundPlayed &&
                                    finalWinner === "opponent" &&
                                    scoreAddingUpPopupAnimationEnd &&
                                    "winning-score"
                                }`}
                            >
                                {newScore.opponent}
                            </span>
                        )}
                    </span>
                    {addPrevScoresAnimation && (
                        <span className="prev-scores text-base text-dark-200 ml-8">+ {prevScore.current.opponent}</span>
                    )}
                </div>
                {!lastRoundPlayed && (
                    <CustomButton
                        className="bg-blue-500 hover:bg-blue-400 border-4 border-blue-700 hover:border-blue-600
                active:bg-blue-300 active:border-blue-400 text-white-text font-medium
                px-[5%] py-[1.2%] rounded-lg transition-all duration-75"
                        disabled={!activeNextRound}
                        disabledStyles={
                            !activeNextRound
                                ? {
                                      filter: "brightness(80%)",
                                  }
                                : undefined
                        }
                        onClick={() => {
                            handleNextRound((prevState) => !prevState);
                            setRoundStats({
                                ...roundStats,
                                current: roundStats.current + 1,
                            });
                            setTimerState({
                                ...timerState,
                                start: false,
                                resume: true,
                            });
                        }}
                    >
                        {t("scoring.btn")}
                    </CustomButton>
                )}
                {!activeNextRound && <div tabIndex={0} data-dummy-focus></div>}
            </div>
        </React.Fragment>
    );
};

export default Scoring;
