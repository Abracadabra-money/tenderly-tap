/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // that is animation class
      animation: {
        fade: 'fadeOut 5s ease-in-out',
      },

      // that is actual animation
      keyframes: (theme) => ({
        fadeOut: {
          '0%': { backgroundColor: theme('colors.red.300') },
          '100%': { backgroundColor: theme('colors.transparent') },
        },
      }),
    },
    fontFamily: {
      lobster: ['Lobster', 'cursive'],
      workSans: ['Work Sans'],
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
