// Check if `value` is an object
const isObject = (value) => {
    const type = typeof value;
    return value !== null && (type === "object" || type === "function");
};

/**
 * Get the value of the property at the given path. If the value on the path was not found, returns the default value.
 *
 * @param object - Object to get the `path` value.
 * @param path - Path of the property in the object, using `.` to separate each nested key.
 * @param defaultValue - The default value if nothing was found on the `path`
 * @param mustReturnFinalValue - Defines wether you can return a nested object. Set to `true` to ensure that the final value of the object tree is returned.
 */
function getByDotNotation(object, path, defaultValue, mustReturnFinalValue) {
    let stack = object;
    const keys = path.split(".");

    for (const s of keys) {
        // If a property does not exists, warn and return either defaultValue or the last obtained stack object
        if (!stack.hasOwnProperty(s)) {
            console.warn(`\`${path}\`:: namespace '${s}' does not exist`);

            return defaultValue ? defaultValue : mustReturnFinalValue ? null : stack;
        }
        stack = stack[s];
    }

    // Throw a warning when the value on the given path is not a string and mustReturnFinalValue is set to
    // true (which means that stack can be only of type 'string')
    if (mustReturnFinalValue && typeof stack !== "string") {
        console.warn(
            `You are returning a nested object, though \`mustReturnFinalValue\` was provided. Choose a valid namespace that returns a final value in the object tree`
        );
        return null;
    }

    return stack;
}

/**
 * Set the property at the given path to the given value. If the property already exists, updates its value.
 *
 * @param object - Object to set the `path` value.
 * @param path - Path of the property in the object, using `.` to separate each nested key.
 * @param value - Value to set at `path`.
 * @returns The object
 */
function setByDotNotation(object, path, value) {
    if (!isObject(object) || typeof path !== "string") {
        return object;
    }

    const root = object;
    const keys = path.split(".");

    for (let index = 0; index < keys.length; index++) {
        const currentKey = keys[index];

        if (index === keys.length - 1) {
            object[currentKey] = value;
        } else if (!isObject(object[currentKey])) {
            object[currentKey] = typeof keys[index + 1] === "number" ? [] : {};
        }

        object = object[currentKey];
    }

    return root;
}

module.exports = {
    getByDotNotation,
    setByDotNotation,
};
