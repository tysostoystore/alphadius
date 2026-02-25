/** @type {import('tailwindcss').Config} */
export default {
    content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                terminal: {
                    bg: "#0B0B0E",
                    surface: "#13131A",
                    border: "#2D2D3B",
                    muted: "#71717A",
                },
                neon: {
                    cyan: "#A855F7",      // purple accent
                    magenta: "#f87171",   // red-400 — losses / negative delta
                    green: "#34d399",     // emerald-400 — gains / positive delta
                    yellow: "#fbbf24",    // amber-400
                    orange: "#fb923c",    // orange-400
                },
            },
            fontFamily: {
                mono: ['"JetBrains Mono"', "Fira Code", "monospace"],
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            animation: {
                "glow-pulse": "glow-pulse 2s ease-in-out infinite alternate",
                "slide-in": "slide-in 0.3s ease-out",
                "fade-in": "fade-in 0.4s ease-out",
            },
            keyframes: {
                "glow-pulse": {
                    "0%": { opacity: "0.5", filter: "brightness(1)" },
                    "100%": { opacity: "1", filter: "brightness(1.3)" },
                },
                "slide-in": {
                    "0%": { transform: "translateX(100%)", opacity: "0" },
                    "100%": { transform: "translateX(0)", opacity: "1" },
                },
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(8px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
            backgroundImage: {
                "grid-pattern":
                    "linear-gradient(rgba(30,30,46,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(30,30,46,0.5) 1px, transparent 1px)",
            },
            backgroundSize: {
                grid: "40px 40px",
            },
        },
    },
    plugins: [],
};
