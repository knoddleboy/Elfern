import { readFileSync } from "original-fs";
import { join } from "path";

import { CardRank } from "./CardLinker/CardLinker.types";

/**
 * Read file with fs's readFileSync
 * @param file A path to file
 */
export const readFile = (file: string) => {
    try {
        return readFileSync(join(process.cwd(), file), "utf8");
    } catch (error) {
        return (error as Error).message;
    }
};

// Create a plain object of type T
export const createPlainObject = <T = unknown>(): T => {
    return Object.create(null);
};

/**
 * Binds keys and values provided in the `keys` and `values` into one object with respective key value pairs:
 * ```js
 * {
 *  "key": "value",
 *  ...
 * }
 * ```
 * **Note:** the number of keys and values in array must be the same. \
 * The sequence of keys in the keys' array must be the same as the values in the values' one.
 *
 * @param keys - Array of the object keys
 * @param values - Array of the object values
 * @returns The object with keys and values
 */
export const bindKeyValuePairs = <T extends number | string, K extends object>(
    keys: readonly T[],
    values: readonly K[]
): Readonly<Record<string, T | K>> => {
    if (keys.length !== values.length) {
        console.warn("Keys and values must be the same number");
        return {};
    }

    const rtn: { [key: string]: T | K } = {};

    keys.forEach((lc, idx) => {
        // Cast key to 'string' if its type is 'number' as numeric keys are not allowed
        if (typeof lc === "number") {
            const stringifiedKey = lc.toString();
            rtn[stringifiedKey] = values[idx];
        } else {
            rtn[lc] = values[idx];
        }
    });

    return Object.freeze(rtn);
};

/**
 * Initial array's mask array of booleans.
 * A value in the mask array is `true` if `array` contains `item`.
 * @example
 * maskArray([1, 2, 3, 4], 2) -> [false, true, false, false]
 */
export const maskArray = <T>(array: readonly T[], item: T) => {
    const rtn = new Array<boolean>(array.length).fill(false);

    if (!array.includes(item)) {
        console.warn(`\`${item}\` does not exists in \`[${array}]\``);
        return [];
    }
    rtn[array.indexOf(item)] = true;

    return rtn;
};

/**
 * Takes rank of the card and normalizes to the corresponding number:
 * @example
 * {number} -> {number}
 * 'jack' -> 11
 * 'queen' -> 12
 * 'king' -> 13
 * 'ace' -> 14
 */
export function normalizedRank(rank: CardRank): number {
    if (typeof rank === "number") return rank;
    if (rank === "jack") return 11;
    if (rank === "queen") return 12;
    if (rank === "king") return 13;
    return 14; // ace
}

export namespace DotNotation {
    /**
     * Gets a value from `sourceObj` using dot notation in `key`. If the value is not found - `defaultValue` returned.
     *
     * @param sourceObj - Iterable object
     * @param key - A string of `sourceObj` keys, separated with '.'
     * @param defaultValue - A default value if nothing was found
     * @param mustReturnFinalValue - Either return the last obtained object or the final value in a object tree
     */
    export const getByDotNotation = <Obj extends Record<string, any>, Key extends string, Value = unknown>(
        sourceObj: Obj,
        key: Key,
        defaultValue?: Value,
        mustReturnFinalValue?: boolean
    ): Obj | Obj[Key] | Value | null => {
        let stack = sourceObj;

        if (!key.includes(".")) return sourceObj[key];

        const keys = key.split(".");

        for (const s of keys) {
            // If a property does not exists, warn and return either defaultValue or the last obtained stack object
            if (!stack.hasOwnProperty(s)) {
                console.warn(`Namespace '${s}' does not exist`);

                return defaultValue ? defaultValue : mustReturnFinalValue ? null : stack;
            }
            stack = stack[s];
        }

        if (mustReturnFinalValue && typeof stack !== "string") {
            console.warn(
                `You are returning a nested object, though \`mustReturnFinalValue\` was provided. Choose a valid namespace that returns a final value in the object tree`
            );
            return null;
        }

        return stack;
    };

    /**
     * Set the property at the given path to the given value. If the property already exists, updates its value.
     *
     * @param object - Object to set the `path` value.
     * @param path - Path of the property in the object, using `.` to separate each nested key.
     * @param value - Value to set at `path`.
     * @returns The object
     */
    export const setByDotNotation = <Obj extends Record<string, any>>(object: Obj, path: string, value: unknown): Obj => {
        const root = object;
        const keys = path.split(".");

        for (let index = 0; index < keys.length; index++) {
            const currentKey = keys[index] as keyof Obj;

            if (index === keys.length - 1) {
                object[currentKey] = value as any;
            }

            object = object[currentKey];
        }

        return root;
    };
}
