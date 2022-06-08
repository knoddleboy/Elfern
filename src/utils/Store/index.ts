import ConfigHandler from "../ConfigHandler";
import { ConfigOptions } from "../ConfigHandler/types";
import { createPlainObject } from "@utils/utils";

class Store<T extends Record<string, any> = Record<string, unknown>> extends ConfigHandler<T> {
    readonly #defaultOptions: Partial<ConfigOptions<T>>;

    constructor(private options: Partial<ConfigOptions<T>> = {}) {
        // Default options
        const defaultOptions: Partial<ConfigOptions<T>> = {
            defaults: createPlainObject<T>(),
            configName: "config",
            accessPropertiesByDotNotation: true,
            configFileMode: 0o666,
            ...options,
        };

        super(defaultOptions);

        this.#defaultOptions = defaultOptions;
    }

    get getDefaultOptions() {
        return this.#defaultOptions;
    }
}

export default Store;
