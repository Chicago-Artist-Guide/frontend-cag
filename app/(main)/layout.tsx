import React, { type ReactNode } from 'react';
import SiteShell from '../site-shell';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => (
  <SiteShell>{children}</SiteShell>
);

export default MainLayout;
