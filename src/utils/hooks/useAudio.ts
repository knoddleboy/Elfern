import { useSelector } from "react-redux";
import { State } from "@state/index";

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
