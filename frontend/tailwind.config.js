/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#14231F",
          light: "#1C2F29",
          lighter: "#233D34",
        },
        paper: {
          DEFAULT: "#F3EEE1",
          dim: "#E8E1CF",
        },
        brass: {
          DEFAULT: "#C9A227",
          light: "#DDBC4E",
          dark: "#A2801B",
        },
        clay: {
          DEFAULT: "#B34B3C",
          light: "#C96856",
        },
        sage: {
          DEFAULT: "#4F7A5B",
          light: "#6B9678",
        },
        cream: "#EDEAE0",
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        body: ["Inter", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
    },
  },
  plugins: [],
};