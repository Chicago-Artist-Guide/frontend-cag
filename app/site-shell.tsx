'use client';

import React, { type ReactNode } from 'react';
import Footer from '../src/components/layout/Footer';
import Header from '../src/components/layout/Header';
import ScrollToTop from '../src/components/shared/ScrollToTop';
import GlobalStyle from '../src/theme/globalStyles';
import AppProviders from './providers';

interface SiteShellProps {
  children: ReactNode;
}

const SiteShell = ({ children }: SiteShellProps) => (
  <AppProviders>
    <main id="cag-frontend-app">
      <ScrollToTop />
      <GlobalStyle />
      <Header />
      {children}
      <Footer />
    </main>
  </AppProviders>
);

export default SiteShell;
