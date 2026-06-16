const plugin = require('tailwindcss/plugin');

const { fontFamily } = require('./fonts.config.cjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#ffb700',
        secondary: '#6366F1',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        background: {
          light: '#FFFFFF',
          dark: '#121212',
        },
      },
      fontFamily: {
        sans: [fontFamily.regular],
      },
      fontSize: {
        caption: ['12px', { lineHeight: '16px' }],
        footnote: ['13px', { lineHeight: '18px' }],
        subheadline: ['15px', { lineHeight: '20px' }],
        body: ['17px', { lineHeight: '22px' }],
        title3: ['20px', { lineHeight: '25px' }],
        title2: ['22px', { lineHeight: '28px' }],
        title1: ['28px', { lineHeight: '34px' }],
        largeTitle: ['34px', { lineHeight: '41px' }],
      },
    },
  },
  plugins: [
    // React Native requires an explicit font file per weight (fontWeight alone is not enough).
    plugin(({ addUtilities }) => {
      addUtilities({
        '.font-sans': { fontFamily: fontFamily.regular },
        '.font-light': { fontFamily: fontFamily.light },
        '.font-normal': { fontFamily: fontFamily.regular },
        '.font-medium': { fontFamily: fontFamily.medium },
        '.font-semibold': { fontFamily: fontFamily.semibold },
        '.font-bold': { fontFamily: fontFamily.bold },
      });
    }),
  ],
};
