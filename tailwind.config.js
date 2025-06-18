/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./app/**/*.{js,ts,jsx,tsx}",
    "./admin/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brixium-purple': { 
          light: '#A495D9', // Lighter Purple
          DEFAULT: '#7C5DFA', // Primary Purple
          dark: '#5D3EBE',   // Darker Purple
        },
        'brixium-gray': { 
          light: '#F3F4F6', // Light Gray (Backgrounds)
          DEFAULT: '#6B7280', // Medium Gray (Text, Borders)
          dark: '#374151',   // Dark Gray (Accents, Darker Text)
        },
        'brixium-bg': { 
            DEFAULT: '#111827', // Dark background for futuristic feel
            light: '#1F2937' // Slightly lighter dark background
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-in-up': 'slideInUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0'},
          '100%': { transform: 'translateY(0px)', opacity: '1'},
        }
      }
    },
  },
  plugins: [],
}
