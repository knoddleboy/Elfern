import { useSelector } from "react-redux";
import { State } from "@state/index";

const useAudio = (path: string) => {
    const audioState = useSelector((state: State) => state.audio);

    const togglePlayer = () => {
        if (!audioState) return;

        const sourceAudio = new Audio(path);
        sourceAudio.play();
    };

    return [togglePlayer] as const;
};

export default useAudio;
