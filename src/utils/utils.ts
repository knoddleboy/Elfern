/**
 * Prints a warning(s) to stdout with newline. Multiple arguments can be passed, with
 * the first used as the primary message and all additional used as substitution values.
 */
export function warn(...args: any[]): void {
    if (console) {
        if (typeof args[0] === "string") args[0] = `%cInternal ⚠:: %c${args[0]}`;
        console.warn(...args, "font-weight: bold", "font-wight: normal");
    }
}

const alreadyWarned: Record<string, Date> = {}; // Storage for warnOnce function

/**
 * Prints a one-off warning to stdout with newline. Multiple arguments can be passed, with
 * the first used as the primary message and all additional used as substitution values.
 */
export function warnOnce(...args: any[]): void {
    if (typeof args[0] === "string" && alreadyWarned[args[0]]) return;
    if (typeof args[0] === "string") alreadyWarned[args[0]] = new Date();
    warn(...args);
}

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
        warn("Keys and values must be the same number");
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
 * A value in mask array will be `true` if `array` contains `item`.
 */
export const maskArray = <T>(array: readonly T[], item: T) => {
    const rtn = new Array<boolean>(array.length).fill(false);

    if (!array.includes(item)) {
        warn(`\`${item}\` does not exists in \`[${array}]\``);
        return [];
    }
    rtn[array.indexOf(item)] = true;

    return rtn;
};

/**
 * Gets a value from `sourceObj` using dot notation in `key`. If the value is not found - `defaultValue` returned.
 *
 * @param sourceObj - Iterable object
 * @param key - A string of `sourceObj` keys, separated with '.'
 * @param defaultValue - A default value if nothing was found
 * @param mustReturnFinalValue - Either return the last obtained object or the final value in a object tree
 */
export function getByDotNotation<T extends Record<string, any>, Key extends string, Value = unknown>(
    sourceObj: T,
    key: Key,
    defaultValue?: Value,
    mustReturnFinalValue?: boolean
): T | T[Key] | Value | null {
    let stack = sourceObj;

    if (!key.includes(".")) {
        warn("You need to use a dot notation, i.e. 'one.two.three'");
        return null;
    }
    const keys = key.split(".");

    for (const s of keys) {
        // If a property does not exists, warn and return either defaultValue or the last obtained stack object
        if (!stack.hasOwnProperty(s)) {
            warnOnce(`Namespace '${s}' does not exist`);

            return defaultValue ? defaultValue : mustReturnFinalValue ? null : stack;
        }
        stack = stack[s];
    }

    keys.forEach((s) => {});

    if (mustReturnFinalValue && typeof stack !== "string") {
        warn(
            `You are returning a nested object, though \`mustReturnFinalValue\` was provided. Choose a valid namespace that returns a final value in the object tree`
        );
        return null;
    }

    return stack;
}

/**
 * Gets computed translate values
 * @param element - Element, whose translate is computed.
 * @returns Object of x, y and z values
 */
export function getTranslateValues(element: HTMLElement) {
    const style = window.getComputedStyle(element);
    const matrix = style["transform"];

    // No transform property. Simply return 0 values.
    if (matrix === "none" || typeof matrix === "undefined") {
        return {
            x: 0,
            y: 0,
            z: 0,
        };
    }

    // Can either be 2d or 3d transform
    const matrixType = matrix.includes("3d") ? "3d" : "2d";
    const matrixValues = matrix.match(/matrix.*\((.+)\)/)![1].split(", ");

    // Since 3d matrices have 6 values, we select the last two as they represent x and y
    if (matrixType === "2d") {
        return {
            x: parseFloat(matrixValues[4]),
            y: parseFloat(matrixValues[5]),
            z: 0,
        };
    }

    // Since 3d matrices have 16 values, we select the 13th, 14th, and 15th values as they represent x, y, and z
    if (matrixType === "3d") {
        return {
            x: parseFloat(matrixValues[12]),
            y: parseFloat(matrixValues[13]),
            z: parseFloat(matrixValues[14]),
        };
    }
}
