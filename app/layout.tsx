import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import React, { type ReactNode } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import '../src/styles/App.scss';
import { lora, montserrat, openSans } from './fonts';
import StyledComponentsRegistry from './styled-components-registry';

const description =
  "Diversifying theatre one connection at a time. Diversifying Chicago Theatre by providing more equitable casting and hiring opportunities. At Chicago Artist Guide, we're reimagining how theatres find, audition, and cast artists for their productions. We envision a more equitable, accessible way for local theatres to connect directly with the diverse actors, artists, and backstage crew they represent, all in an easy-to-use online network.";
const openGraphDescription =
  "Diversifying Chicago Theatre by providing more equitable casting and hiring opportunities. At Chicago Artist Guide, we're reimagining how theatres find, audition, and cast artists for their productions. We envision a more equitable, accessible way for local theatres to connect directly with the diverse actors, artists, and backstage crew they represent, all in an easy-to-use online network.";

export const metadata: Metadata = {
  description,
  icons: {
    apple: [{ sizes: '180x180', url: '/apple-touch-icon.png' }],
    icon: [
      {
        sizes: '32x32',
        type: 'image/png',
        url: '/favicon-32x32.png'
      },
      {
        sizes: '16x16',
        type: 'image/png',
        url: '/favicon-16x16.png'
      }
    ],
    other: [
      {
        color: '#00aba9',
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg'
      }
    ]
  },
  manifest: '/site.webmanifest',
  openGraph: {
    description: openGraphDescription,
    images: ['https://www.chicagoartistguide.org/FBCover.jpg'],
    title: 'Chicago Artist Guide: Diversifying theatre one connection at a time'
  },
  other: { 'msapplication-TileColor': '#ffc40d' },
  title: 'Chicago Artist Guide'
};

export const viewport: Viewport = {
  initialScale: 1,
  themeColor: '#fff',
  width: 'device-width'
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html
    className={`${montserrat.variable} ${openSans.variable} ${lora.variable}`}
    lang="en"
  >
    <body>
      <noscript>You need to enable JavaScript to run this app.</noscript>
      <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      <Script
        async
        src="https://widgets.givebutter.com/latest.umd.cjs?acct=o8yi4881nb5X1BSi"
        strategy="afterInteractive"
      />
    </body>
  </html>
);

export default RootLayout;
