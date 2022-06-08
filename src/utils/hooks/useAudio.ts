import { useSelector } from "react-redux";
import { State } from "@state/index";

/**
 * Return an audio toggler function that on trigger if `alwaysOn` is not set
 * plays sound from the path, provided in `path`.
 *
 * @param path Path to the audio file to play
 * @param alwaysOn When set `true`, sound cannot be prevented from playing
 */
const useAudio = (path: string, alwaysOn?: boolean) => {
    const audioState = useSelector((state: State) => state.ENABLE_AUDIO);

    const togglePlayer = () => {
        if (!audioState && !alwaysOn) return;

        const sourceAudio = new Audio(path);
        sourceAudio.play();
    };

    return [togglePlayer] as const;
};

export default useAudio;
