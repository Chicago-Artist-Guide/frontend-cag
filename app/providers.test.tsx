import fs from 'fs';
import path from 'path';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import { vi } from 'vitest';
import { useFirebaseContext } from '../src/context/FirebaseContext';

const providerMocks = vi.hoisted(() => ({
  client: {
    app: { name: '[DEFAULT]' },
    auth: { type: 'auth' },
    firestore: { type: 'firestore' },
    storage: { type: 'storage' }
  },
  getFirebaseAnalytics: vi.fn(),
  getFirebaseClient: vi.fn(),
  onAuthStateChanged: vi.fn(),
  unsubscribe: vi.fn()
}));

vi.mock('../src/lib/firebase/client', () => ({
  getFirebaseAnalytics: providerMocks.getFirebaseAnalytics,
  getFirebaseClient: providerMocks.getFirebaseClient
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: providerMocks.onAuthStateChanged
}));

import AppProviders from './providers';

const readProjectFile = (file: string) =>
  fs.readFileSync(path.resolve(__dirname, '..', file), 'utf8');

describe('AppProviders', () => {
  beforeEach(() => {
    providerMocks.getFirebaseAnalytics.mockReset();
    providerMocks.getFirebaseClient.mockReset();
    providerMocks.onAuthStateChanged.mockReset();
    providerMocks.unsubscribe.mockReset();
    providerMocks.getFirebaseClient.mockReturnValue(providerMocks.client);
    providerMocks.getFirebaseAnalytics.mockReturnValue(
      new Promise<never>(() => undefined)
    );
    providerMocks.onAuthStateChanged.mockImplementation(
      (_auth: unknown, onChange: (user: null) => void) => {
        onChange(null);
        return providerMocks.unsubscribe;
      }
    );
  });

  it('renders children once and initializes Firebase once per mounted tree', () => {
    const observedAuth: unknown[] = [];
    const Child = vi.fn(() => {
      observedAuth.push(useFirebaseContext().firebaseAuth);
      return <p>provider child</p>;
    });
    const firstTree = render(
      <AppProviders>
        <Child />
      </AppProviders>
    );

    expect(screen.getByText('provider child')).toBeTruthy();
    expect(Child).toHaveBeenCalledTimes(1);
    expect(observedAuth).toEqual([providerMocks.client.auth]);
    expect(providerMocks.getFirebaseClient).toHaveBeenCalledTimes(1);

    firstTree.unmount();
    render(
      <AppProviders>
        <span>second tree</span>
      </AppProviders>
    );

    expect(screen.getByText('second tree')).toBeTruthy();
    expect(providerMocks.getFirebaseClient).toHaveBeenCalledTimes(2);
  });

  it('does no Firebase SDK work while rendering on the server', () => {
    vi.stubGlobal('window', undefined);

    try {
      expect(
        renderToString(
          <AppProviders>
            <span>server child</span>
          </AppProviders>
        )
      ).toContain('server child');
      expect(providerMocks.getFirebaseClient).not.toHaveBeenCalled();
      expect(providerMocks.getFirebaseAnalytics).not.toHaveBeenCalled();
      expect(providerMocks.onAuthStateChanged).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it('owns the exact provider nesting once', () => {
    const source = readProjectFile('app/providers.tsx');

    expect(source).toMatch(
      /<FirebaseContext\.Provider[\s\S]*<UserContext\.Provider[\s\S]*<AdminProvider[\s\S]*<MarketingContext\.Provider[\s\S]*<PaginationProvider>[\s\S]*<ErrorBoundary>[\s\S]*{children}[\s\S]*<\/ErrorBoundary>[\s\S]*<\/PaginationProvider>[\s\S]*<\/MarketingContext\.Provider>[\s\S]*<\/AdminProvider>[\s\S]*<\/UserContext\.Provider>[\s\S]*<\/FirebaseContext\.Provider>/
    );
    expect(source.match(/<FirebaseContext\.Provider/g)).toHaveLength(1);
    expect(source.match(/<UserContext\.Provider/g)).toHaveLength(1);
    expect(source.match(/<AdminProvider/g)).toHaveLength(1);
    expect(source.match(/<MarketingContext\.Provider/g)).toHaveLength(1);
    expect(source.match(/<PaginationProvider>/g)).toHaveLength(1);
    expect(source.match(/<ErrorBoundary>/g)).toHaveLength(1);
  });

  it('is mounted only by the authorized legacy and native shell owners', () => {
    const appSource = readProjectFile('src/routes/App.tsx');
    const siteShellSource = readProjectFile('app/site-shell.tsx');
    const legacyAppSource = readProjectFile('app/legacy-app.tsx');
    const rootLayoutSource = readProjectFile('app/layout.tsx');
    const mainLayoutSource = readProjectFile('app/(main)/layout.tsx');
    const catchAllSource = readProjectFile('app/[...path]/page.tsx');

    expect(appSource.match(/<AppProviders>/g)).toHaveLength(1);
    expect(siteShellSource.match(/<AppProviders>/g)).toHaveLength(1);
    expect(appSource).not.toMatch(
      /FirebaseContext\.Provider|UserContext\.Provider|AdminProvider|MarketingContext\.Provider|PaginationProvider/
    );
    expect(siteShellSource).not.toMatch(/LegacyApp|src\/routes\/App/);
    expect(legacyAppSource).toMatch(
      /dynamic\([\s\S]*import\('\.\.\/src\/routes\/App'\)[\s\S]*ssr:\s*false[\s\S]*\)/
    );
    expect(legacyAppSource).toMatch(
      /const LegacyApp\s*=\s*\(\)\s*=>\s*<App\s*\/>/
    );
    expect(legacyAppSource).not.toMatch(/AppProviders|SiteShell/);
    for (const source of [
      rootLayoutSource,
      mainLayoutSource,
      legacyAppSource,
      catchAllSource
    ]) {
      expect(source).not.toMatch(
        /AppProviders|FirebaseContext|UserContext|AdminProvider|MarketingContext|PaginationProvider/
      );
    }
    expect(catchAllSource).toMatch(/LegacyApp/);
    expect(catchAllSource).not.toMatch(/SiteShell/);
    expect(
      fs.existsSync(
        path.resolve(__dirname, '(main)', '[...path]', 'page.tsx')
      )
    ).toBe(false);
  });
});
