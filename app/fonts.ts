import localFont from 'next/font/local';

export const montserrat = localFont({
  adjustFontFallback: false,
  display: 'swap',
  src: [
    {
      path: './fonts/montserrat-normal-latin.woff2',
      style: 'normal',
      weight: '400'
    },
    {
      path: './fonts/montserrat-normal-latin.woff2',
      style: 'normal',
      weight: '700'
    }
  ],
  variable: '--font-montserrat'
});

export const openSans = localFont({
  adjustFontFallback: false,
  display: 'swap',
  src: [
    {
      path: './fonts/open-sans-normal-latin.woff2',
      style: 'normal',
      weight: '300'
    },
    {
      path: './fonts/open-sans-normal-latin.woff2',
      style: 'normal',
      weight: '600'
    }
  ],
  variable: '--font-open-sans'
});

export const lora = localFont({
  adjustFontFallback: false,
  display: 'swap',
  src: [
    {
      path: './fonts/lora-italic-latin-400.woff2',
      style: 'italic',
      weight: '400'
    }
  ],
  variable: '--font-lora'
});
