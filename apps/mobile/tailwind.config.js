/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,ts,jsx,tsx}", "./**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  presets: [require("nativewind/preset")],
};
