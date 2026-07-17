import type { Metadata } from 'next';
import React, { type ReactNode } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import '../src/styles/App.scss';
import { lora, montserrat, openSans } from './fonts';

export const metadata: Metadata = {
  description:
    'Connecting theater artists with casting opportunities in Chicago.',
  title: 'Chicago Artist Guide'
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html
    className={`${montserrat.variable} ${openSans.variable} ${lora.variable}`}
    lang="en"
  >
    <body>{children}</body>
  </html>
);

export default RootLayout;
