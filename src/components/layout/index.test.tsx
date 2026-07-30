import { readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

vi.mock('../../theme/globalStyles', () => ({
  default: () => <div data-testid="global-style" />
}));
vi.mock('../shared', () => ({
  ScrollToTop: () => <div data-testid="scroll-to-top" />
}));
vi.mock('./Header', () => ({
  default: () => <header>header</header>
}));
vi.mock('./Footer', () => ({
  default: () => <footer>footer</footer>
}));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  Outlet: () => <div data-testid="legacy-outlet" />
}));

import Layout from '.';

const readProjectFile = (file: string) =>
  readFileSync(path.resolve(process.cwd(), file), 'utf8');

describe('shared layout boundary', () => {
  it('renders caller-owned children inside the existing shell', () => {
    render(
      <Layout>
        <p>route child</p>
      </Layout>
    );

    expect(screen.getByText('header')).toBeTruthy();
    expect(screen.getByText('route child')).toBeTruthy();
    expect(screen.getByText('footer')).toBeTruthy();
  });

  it('contains no React Router import or Outlet symbol', () => {
    const source = readProjectFile('src/components/layout/index.tsx');

    expect(source).not.toMatch(/react-router-dom|\bOutlet\b/u);
  });

  it('keeps the legacy Outlet inside the dedicated legacy adapter', async () => {
    const legacySource = readProjectFile('src/routes/LegacyLayout.tsx');
    const { default: LegacyLayout } = await import('../../routes/LegacyLayout');

    expect(legacySource).toMatch(/from 'react-router-dom'/u);
    expect(legacySource).toMatch(
      /<Layout>[\s\S]*<Outlet \/>[\s\S]*<\/Layout>/u
    );

    render(<LegacyLayout />);
    expect(screen.getByTestId('legacy-outlet')).toBeTruthy();
  });
});
