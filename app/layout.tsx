import type { Metadata } from 'next';
import React, { type ReactNode } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import '../src/styles/App.scss';

export const metadata: Metadata = {
  description:
    'Connecting theater artists with casting opportunities in Chicago.',
  title: 'Chicago Artist Guide'
};

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default RootLayout;
