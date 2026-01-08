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
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
        },
        bounceThreeTimes: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-30px)' },
          '60%': { transform: 'translateY(-15px)' },
        },
        scaled: {
          '0%': { transform: 'scale(0.8)', opacity: "0.6" },
          '100%': { transform: 'scale(1)', opacity: "1" },
        },
      },
      animation: {
        'breathing': 'breathing 1.5s ease-in-out infinite',
        'scaled': 'scaled 1s ease 1',
        'bounce-three-times': 'bounceThreeTimes  ease 0s 1', // 1s duration, ease timing, 0s delay, 3 times
      },
    },
    
  },
  plugins: [],
};
