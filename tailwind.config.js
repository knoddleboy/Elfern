module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        colors: {
            transparent: "rgba(0, 0, 0, 0.5)",
            white: {
                normal: "#ffffff",
                grey: "#e1e2e1",
                text: "#e2f1ff",
            },
            dark: {
                800: "#313131",
                600: "#4a4c50",
            },
            green: {
                dark: "#006717",
                primary: "#329e47",
                400: "#5bb16c",
                light: "#2b7b3b",
                200: "rgba(43, 123, 59, 0.3)",
            },
            blue: {
                400: "#1a88c4",
                500: "#0077B9",
                600: "#0072b3",
                700: "#005382",
            },
        },
        extend: {},
    },
    plugins: [require("@tailwindcss/typography")],
};
