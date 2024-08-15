/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'open-sans': [
          'Open Sans',
          'sans-serif',
          ...defaultTheme.fontFamily.sans
        ],
        lora: ['Lora', 'serif', ...defaultTheme.fontFamily.serif],
        montserrat: [
          'Montserrat',
          'sans-serif',
          ...defaultTheme.fontFamily.sans
        ]
      },
      colors: {
        banana: '#F9E9B1',
        black: '#000000',
        black05a: 'rgba(0, 0, 0, 0.05)',
        bodyBg: '#F8F9FA',
        butter: '#E9C268',
        cornflower: '#4C7180',
        dark: '#3B4448',
        darkGreen: '#82B29A',
        darkGrey: '#2F4550',
        darkGreyBlue: '#355669',
        darkPrimary: '#425B4E',
        gray: '#4d5055',
        grayishBlue: '#8A8A8A',
        grayishLightGreen: '#b8d8c7',
        italicColor: '#537C8C',
        lighterGrey: '#C4C4C4',
        lightestGrey: '#EFEFEF',
        lightGrey: '#D1D1D1',
        lightPink: '#f7beb2',
        mainFont: '#0C2028',
        mint: '#3EB489',
        orange: '#E17B60',
        paginationGray: '#D4D6DF',
        peach: '#F5AF19',
        primary: '#82B29A',
        salmon: '#E17B60',
        scrollOrange: '#F0960E',
        secondaryFontColor: '#2F4550',
        slate: '#2F4550',
        veryDarkGrayBlue: '#4D5055',
        white: '#ffffff',
        white80a: 'rgba(255, 255, 255, 0.8)',
        yellow: '#EFC93D'
      }
    }
  },
  plugins: []
};
