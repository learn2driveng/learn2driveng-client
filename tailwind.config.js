const plugin = require('tailwindcss/plugin');

const { fontFamily } = require('./fonts.config.cjs');

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Theme preference is user-selectable, so NativeWind must use a class-based
  // scheme. `media` is read-only and throws when the app applies light/dark.
  darkMode: 'class',
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
          light: '#f2f2f3',
          dark: '#041320',
        },
        'background-dark': '#041320',
        surface: {
          dark: '#1E2129',
        },
        navy: {
          accent: '#1C274B',
        },
      },
      fontFamily: {
        sans: [fontFamily.regular],
        display: [fontFamily.display],
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
      borderRadius: {
        button: '50px',
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
        '.font-display': { fontFamily: fontFamily.display },
        '.font-display-medium': { fontFamily: fontFamily.displayMedium },
        '.font-figtree': { fontFamily: fontFamily.figtree },
        '.font-figtree-medium': { fontFamily: fontFamily.figtreeMedium },
        '.font-figtree-semibold': { fontFamily: fontFamily.figtreeSemibold },
        '.font-figtree-bold': { fontFamily: fontFamily.figtreeBold },
      });
    }),
  ],
};
