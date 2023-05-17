/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {},
    /* colors: {
      transparent: 'transparent',
      current: 'currentColor',
      primary: '#0D2334',
      primary_light: '#2F6880',
      secondary: '#543B38',
      secondary_light: '#966A5F',
      accent: '#F1C970',
    } */
  },
  plugins: [require("daisyui")],
}

