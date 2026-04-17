/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f8ff',
          100: '#e6f0ff',
          200: '#bfd8ff',
          300: '#8db8ff',
          400: '#5a95f4',
          500: '#2e73df',
          600: '#2059bc',
          700: '#174596',
          800: '#143a78',
          900: '#152f60'
        }
      }
    }
  },
  plugins: []
};
