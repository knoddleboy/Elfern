import ConfigHandler from "@utils/ConfigHandler/index";
import { ConfigOptions } from "@utils/ConfigHandler/types";

declare class Store<T extends Record<string, any> = Record<string, unknown>> extends ConfigHandler<T> {
    constructor(options?: ConfigOptions<T>);

    static initRenderer(): void;
}

export = Store;
