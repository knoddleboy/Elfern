module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        colors: {
            white: {
                normal: "var(--white-normal)",
                text: "var(--white-text)",
                grey: "var(--white-greyish)",
            },
            green: {
                800: "var(--green-800)",
                500: "var(--green-500)",
                400: "var(--green-400)",
                300: "var(--green-300)",
                200: {
                    alpha: "var(--green-200-alpha)",
                },
            },
            blue: {
                700: "var(--blue-700)",
                600: "var(--blue-600)",
                500: "var(--blue-500)",
                400: "var(--blue-400)",
                300: "var(--blue-300)",
            },
            dark: {
                800: "var(--dark-800)",
                600: "var(--dark-600)",
            },
            alpha: {
                5: "var(--alpha-5)",
            },
        },
        extend: {},
    },
    plugins: [require("@tailwindcss/typography")],
};
