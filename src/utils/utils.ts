import { CardRank } from "./CardLinker/CardLinker.types";

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

/**
 * Detects whether the `element` (can be also cursor) entered the `region` viewport.
 * @param expand - Defines the expand of the region (in px), where collision starts to be detected.
 */
export const detectCollision = (
    element: HTMLElement | { x: number; y: number },
    region: HTMLElement,
    expand: number = 0
) => {
    const elementRect =
        element instanceof HTMLElement
            ? element.getBoundingClientRect()
            : Object.assign(element, { width: 0, height: 0 });
    const regionRect = region.getBoundingClientRect();

    return !(
        elementRect.y + elementRect.height < regionRect.y + expand ||
        elementRect.y > regionRect.y + regionRect.height - expand ||
        elementRect.x + elementRect.width < regionRect.x + expand ||
        elementRect.x > regionRect.x + regionRect.width - expand
    );
};

export const formatTime = (timer: number) => {
    const extractSeconds = `0${timer % 60}`.slice(-2);
    const minutes = Math.floor(timer / 60);
    const extractMinutes = `0${minutes % 60}`.slice(-2);
    const extractHours = `${Math.floor(timer / 3600)}`.slice(-2);

    return `${extractHours}:${extractMinutes}:${extractSeconds}`;
};

export const excludeObjectProps = <T extends object>(object: T, ...props: (keyof T)[]) => {
    return Object.fromEntries(Object.entries(object).filter(([key]) => !props.includes(key as keyof T)));
};
