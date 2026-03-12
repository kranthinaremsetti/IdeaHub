/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0f172a",
        sky: "#0369a1",
        mist: "#f1f5f9"
      }
    }
  },
  plugins: []
};
