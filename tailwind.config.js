/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      daisyui: {
        themes: ["winter"],
      },
      fontFamily: {
        Inconsolata: ["Inconsolata", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
};
