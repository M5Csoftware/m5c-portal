/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "auth-bg-gradient": "linear-gradient(180deg, #EA1B40 28.52%, #840F24 100%)",
      },
      keyframes: {
        breathing: {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.05)" },
        },
        bounceThreeTimes: {
          "0%, 20%, 50%, 80%, 100%": { transform: "translateY(0)" },
          "40%": { transform: "translateY(-30px)" },
          "60%": { transform: "translateY(-15px)" },
        },
        scaled: {
          "0%": { transform: "scale(0.8)", opacity: "0.6" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        logoEntry: {
          "0%": { opacity: 0, transform: "scale(0)" },
          "100%": { opacity: 1, transform: "scale(1)" },
        },
        scaleX: {
          "0%": { opacity: 0, transform: "scaleX(0)" },
          "100%": { opacity: 1, transform: "scaleX(1)" },
        },
        customPulse: {
          "0%, 100%": { transform: "scale(1)", opacity: 0.05 },
          "50%": { transform: "scale(1.1)", opacity: 0.08 },
        },
      },
      animation: {
        breathing: "breathing 1.5s ease-in-out infinite",
        scaled: "scaled 1s ease 1",
        "bounce-three-times": "bounceThreeTimes ease 0s 1", // 1s duration, ease timing, 0s delay, 3 times
        fadeInUp: "fadeInUp 1s ease-out forwards",
        logoEntry: "logoEntry 1s ease-out forwards",
        scaleX: "scaleX 1s ease-out forwards",
        customPulse: "customPulse 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
