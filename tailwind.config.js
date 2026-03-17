/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#f3f4f6', // light gray background
          card: '#ffffff', // white cards
          border: '#e5e7eb', // soft gray border
          accent: '#00d4aa',
          accentDim: '#00a884',
          glow: 'rgba(0, 212, 170, 0.3)',
        },
      },
      fontFamily: {
        sans: ['JetBrains Mono', 'IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 170, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(0, 212, 170, 0.4)' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(1rem)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
