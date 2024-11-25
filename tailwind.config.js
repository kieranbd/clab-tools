/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          900: '#111827',
          800: '#1F2937',
          700: '#374151',
          400: '#9CA3AF',
          100: '#F3F4F6',
        },
        brand: {
          500: '#ff5923',
          600: '#e64d1c',
        }
      },
      fontFamily: {
        'new-spirit': ['"New Spirit"', 'serif'],
      }
    },
  },
  plugins: [],
}