import { readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../site-shell', () => ({
  default: ({ children }: React.PropsWithChildren) => (
    <div data-testid="site-shell">{children}</div>
  )
}));

import MainLayout from './layout';

describe('(main) layout', () => {
  it('wraps its children exactly once in SiteShell', () => {
    render(
      <MainLayout>
        <div data-testid="main-child">child</div>
      </MainLayout>
    );

    expect(screen.getAllByTestId('site-shell')).toHaveLength(1);
    expect(screen.getAllByTestId('main-child')).toHaveLength(1);
  });

  it('stays a server-only wrapper without providers or legacy gates', () => {
    const source = readFileSync(
      path.resolve(process.cwd(), 'app/(main)/layout.tsx'),
      'utf8'
    );

    expect(source.trimStart().startsWith("'use client';")).toBe(false);
    expect(source.match(/<SiteShell>/gu)).toHaveLength(1);
    expect(source).not.toMatch(
      /AppProviders|LegacyApp|src\/routes\/App|next\/dynamic|ssr:\s*false|router|Suspense|hydration|mounted|useEffect|useState/u
    );
  });
});
