/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Shared with src/pages/Dashboard.jsx's COLORS object — keep these
        // two in sync if the palette ever changes.
        ink: "#17203A",
        paper: "#FAF7F2",
        flow: "#E3A23B",
        tide: "#2F6F62",
        coral: "#C6553D",
        mist: "#D8D2C2",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
        display: ["Space Grotesk", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      keyframes: {
        "card-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "card-in": "card-in 0.35s ease-out",
      },
    },
  },
  plugins: [],
};
