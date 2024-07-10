import type {Config} from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                "brand-background-blue": "#0B214A", // Delft Blue
                "brand-letters": "#E8EBE4", // Alabaster - Used for large accents, such as letter colors
                "brand-background-accent": "#38A3A5", // Vista Blue - Used for medium accents, such as primary buttons
                "brand-letters-on-accent": "#03070C", // Black - Used for text on top of the primary button
                "brand-background-accent-small": "#57CC99", // Lavender Pink - Used for small accents, such as secondary buttons
                "brand-background-red-accent": "#B80000", // Red - Used for error messages
                "brand-background-red-even-redder": "#FF0A0A", // Red - Used for error messages
            },
            fontSize: {
                "2xs": ".7rem",
            }
        },
    },
    plugins: [],
};
export default config;
