import { readFileSync } from "original-fs";
import { join } from "path";

const readFile = (file: string) => {
    try {
        return readFileSync(join(process.cwd(), file), "utf8");
    } catch (error) {
        return (error as Error).message;
    }
};

export default readFile;
