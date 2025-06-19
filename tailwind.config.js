/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      height: {
        screen: ["100vh", "100dvh"], // Adds dynamic viewport height support
      },
    },
  },
  plugins: [],
  variants: {
    extend: {
      backgroundColor: ["active", "dark"],
      cursor: ["active"],
      borderColor: ["dark"],
      textColor: ["dark"],
      backgroundOpacity: ["dark"],
      borderOpacity: ["dark"],
    },
  },
};
