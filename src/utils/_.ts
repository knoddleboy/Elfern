export default class _ {
    /**
     * Chops off provided number of decimals.
     *
     * @param number Number to chop off.
     * @param fractionDigits Number of digits after the decimal point. Must be in the range 0 - 20, inclusive.
     * @returns A number in fixed-point notation.
     */
    static toFixed(number: number, fractionDigits: number) {
        return Number.isInteger(number)
            ? parseInt(number.toFixed(fractionDigits))
            : parseFloat(number.toFixed(fractionDigits));
    }

    /**
     * Fisher-Yates based array shuffle.
     *
     * @param array Array to shuffle.
     * @returns Shuffled array.
     */
    static shuffle<T>(array: Array<T>) {
        let currentIndex = array.length,
            randomIndex: number;

        // Shuffle while there remain elements to shuffle
        while (currentIndex !== 0) {
            // Pick a remaining element (its index)
            randomIndex = (Math.random() * currentIndex--) | 0;

            // Swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }

        return array;
    }

    /**
     * Array.prototype.at() method polyfill. Allows positive and negative integers.
     * Negative integers count back from the last item in the array.
     *
     * @param array Actual array.
     * @param index The zero-based index of the desired code unit. A negative index will count back from the last item.
     * @returns The item located at the specified index.
     */
    static at<T>(array: Array<T>, index: number): T | undefined {
        if (index >= 0) {
            return array[index];
        }
        return array[array.length + index];
    }
}
