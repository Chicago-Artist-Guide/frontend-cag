import { readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('./providers', () => ({
  default: ({ children }: React.PropsWithChildren) => (
    <div data-testid="providers">{children}</div>
  )
}));
vi.mock('../src/components/shared/ScrollToTop', () => ({
  default: () => <div data-testid="scroll-to-top" />
}));
vi.mock('../src/theme/globalStyles', () => ({
  default: () => <div data-testid="global-style" />
}));
vi.mock('../src/components/layout/Header', () => ({
  default: () => <div data-testid="header" />
}));
vi.mock('../src/components/layout/Footer', () => ({
  default: () => <div data-testid="footer" />
}));

import SiteShell from './site-shell';

describe('SiteShell', () => {
  it('renders one provider and shell in exact leaf order with children once', () => {
    render(
      <SiteShell>
        <div data-testid="page-child">page</div>
      </SiteShell>
    );

    expect(screen.getAllByTestId('providers')).toHaveLength(1);
    expect(screen.getAllByTestId('page-child')).toHaveLength(1);
    const main = document.querySelector('main#cag-frontend-app');
    expect(main).not.toBeNull();
    expect(
      Array.from(main?.children ?? []).map((element) =>
        element.getAttribute('data-testid')
      )
    ).toEqual([
      'scroll-to-top',
      'global-style',
      'header',
      'page-child',
      'footer'
    ]);
  });

  it('is a direct client shell without legacy, dynamic, suspense, or mount gates', () => {
    const source = readFileSync(
      path.resolve(process.cwd(), 'app/site-shell.tsx'),
      'utf8'
    );

    expect(source.trimStart().startsWith("'use client';")).toBe(true);
    expect(source.match(/<AppProviders>/gu)).toHaveLength(1);
    expect(source).not.toMatch(
      /LegacyApp|src\/routes\/App|next\/dynamic|ssr:\s*false|Suspense|hydration|mounted|mount gate|useEffect|useState/u
    );
  });
});
