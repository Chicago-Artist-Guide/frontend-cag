// @vitest-environment node

import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  stat,
  writeFile
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  runAuthSetupCommand,
  type AuthSetupBrowser,
  type AuthSetupContext,
  type AuthSetupPage
} from './auth-setup';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true }))
  );
});

const firebaseState = (origin: string) => ({
  cookies: [],
  origins: [
    {
      indexedDB: [
        {
          name: 'firebaseLocalStorageDb',
          stores: [
            {
              autoIncrement: false,
              indexes: [],
              keyPath: 'fbase_key',
              name: 'firebaseLocalStorage',
              records: [
                {
                  value: {
                    fbase_key: 'firebase:authUser:test-api-key:[DEFAULT]',
                    value: { uid: 'redacted-fixture' }
                  }
                }
              ]
            }
          ],
          version: 1
        }
      ],
      localStorage: [],
      origin
    }
  ]
});

async function fixture(
  options: { invalidState?: boolean; failMarker?: boolean } = {}
) {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'cag-auth-setup-'));
  temporaryDirectories.push(cwd);
  const authDir = path.join(cwd, 'auth');
  const events: string[] = [];
  let finalUrl = 'http://127.0.0.1:3000/profile';
  const closePage = vi.fn(async () => undefined);
  const closeContext = vi.fn(async () => undefined);
  const closeBrowser = vi.fn(async () => undefined);
  const page: AuthSetupPage = {
    close: closePage,
    fill: vi.fn(async (selector, value) => {
      events.push(`fill:${selector}:${value.length}`);
    }),
    getByRole: vi.fn(() => ({ click: async () => events.push('click') })),
    goto: vi.fn(async () => {
      events.push('goto');
    }),
    locator: vi.fn((selector) => ({
      waitFor: async () => {
        events.push(`marker:${selector}`);
        if (options.failMarker) throw new Error('marker missing');
      }
    })),
    url: () => finalUrl,
    waitForURL: vi.fn(async () => {
      events.push('wait-url');
      finalUrl = 'http://127.0.0.1:3000/profile';
    })
  };
  const context: AuthSetupContext = {
    close: closeContext,
    newPage: async () => page,
    storageState: vi.fn(async ({ indexedDB, path: partial }) => {
      events.push(`storage:${String(indexedDB)}`);
      await writeFile(
        partial,
        JSON.stringify(
          options.invalidState
            ? { cookies: [], origins: [] }
            : firebaseState('http://127.0.0.1:3000')
        ),
        'utf8'
      );
      return firebaseState('http://127.0.0.1:3000');
    })
  };
  const browser: AuthSetupBrowser = {
    close: closeBrowser,
    newContext: async () => context
  };
  const assertNoMutations = vi.fn(() => events.push('assert-mutations'));
  return {
    assertNoMutations,
    authDir,
    browser,
    closeBrowser,
    closeContext,
    closePage,
    cwd,
    environment: {
      VR_ARTIFACT_DIR: path.join(cwd, 'artifacts'),
      VR_AUTH_DIR: authDir,
      VR_BASELINE_DIR: path.join(cwd, 'baseline'),
      VR_BASE_URL: 'http://127.0.0.1:3000',
      VR_COMPANY_EMAIL: 'company@example.test',
      VR_COMPANY_PASSWORD: 'do-not-log'
    },
    events,
    prepareContext: vi.fn(async () => {
      events.push('prepare');
      return { assertNoMutations };
    })
  };
}

describe('runAuthSetupCommand', () => {
  it('installs the guard before login and atomically saves validated IndexedDB evidence', async () => {
    const test = await fixture();
    await expect(
      runAuthSetupCommand([], test.environment, test.cwd, {
        launchBrowser: async () => test.browser,
        prepareContext: test.prepareContext
      })
    ).resolves.toBe(0);

    expect(test.events.indexOf('prepare')).toBeLessThan(
      test.events.indexOf('goto')
    );
    expect(test.events).toContain('marker:text="YOUR PROFILE"');
    expect(test.events).toContain('marker:text="Basic Group Info"');
    expect(
      test.events.filter((event) => event === 'assert-mutations')
    ).toHaveLength(2);
    expect(test.events).toContain('storage:true');
    const final = path.join(test.authDir, 'company.json');
    expect(JSON.parse(await readFile(final, 'utf8'))).toEqual(
      firebaseState('http://127.0.0.1:3000')
    );
    expect((await stat(test.authDir)).mode & 0o777).toBe(0o700);
    expect((await stat(final)).mode & 0o777).toBe(0o600);
    expect(test.closePage).toHaveBeenCalledOnce();
    expect(test.closeContext).toHaveBeenCalledOnce();
    expect(test.closeBrowser).toHaveBeenCalledOnce();
  });

  it('preserves valid prior evidence and removes partials after validation failure', async () => {
    const test = await fixture({ invalidState: true });
    await mkdir(test.authDir, { recursive: true });
    const final = path.join(test.authDir, 'company.json');
    await writeFile(final, '{"prior":true}', 'utf8');
    await chmod(final, 0o600);

    await expect(
      runAuthSetupCommand([], test.environment, test.cwd, {
        launchBrowser: async () => test.browser,
        prepareContext: test.prepareContext
      })
    ).resolves.toBe(1);

    expect(await readFile(final, 'utf8')).toBe('{"prior":true}');
    await expect(
      (await import('node:fs/promises')).readdir(test.authDir)
    ).resolves.toEqual(['company.json']);
    expect(test.closePage).toHaveBeenCalledOnce();
    expect(test.closeContext).toHaveBeenCalledOnce();
    expect(test.closeBrowser).toHaveBeenCalledOnce();
  });

  it('fails without opening a browser when credentials or arguments are invalid', async () => {
    const test = await fixture();
    const launchBrowser = vi.fn(async () => test.browser);
    await expect(
      runAuthSetupCommand(['--state=admin'], test.environment, test.cwd, {
        launchBrowser,
        prepareContext: test.prepareContext
      })
    ).resolves.toBe(1);
    await expect(
      runAuthSetupCommand(
        [],
        { ...test.environment, VR_COMPANY_PASSWORD: undefined },
        test.cwd,
        { launchBrowser, prepareContext: test.prepareContext }
      )
    ).resolves.toBe(1);
    expect(launchBrowser).not.toHaveBeenCalled();
  });
});
