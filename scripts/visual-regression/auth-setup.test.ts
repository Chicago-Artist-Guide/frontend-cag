// @vitest-environment node

import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rename,
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
  options: {
    failGuardAt?: 1 | 2;
    failMarker?: boolean;
    finalUrl?: string;
    invalidState?: boolean;
    mutationDuringClose?: boolean;
  } = {}
) {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'cag-auth-setup-'));
  temporaryDirectories.push(cwd);
  const authDir = path.join(cwd, 'auth');
  const events: string[] = [];
  const finalUrl = options.finalUrl ?? 'http://127.0.0.1:3000/profile';
  let mutationDuringClose = false;
  const closePage = vi.fn(async () => {
    events.push('page-close');
  });
  const closeContext = vi.fn(async () => {
    events.push('context-close');
    mutationDuringClose = options.mutationDuringClose ?? false;
  });
  const closeBrowser = vi.fn(async () => {
    events.push('browser-close');
  });
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
    waitForURL: vi.fn(async (matcher) => {
      const matched = matcher(new URL(finalUrl));
      events.push(`wait-url:${String(matched)}`);
      if (!matched) throw new Error('URL did not match');
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
  let guardCalls = 0;
  const assertNoMutations = vi.fn(() => {
    guardCalls += 1;
    events.push(`assert-mutations:${guardCalls}`);
    if (options.failGuardAt === guardCalls || mutationDuringClose) {
      throw new Error('mutation blocked');
    }
  });
  const promoteState = vi.fn(async (partial: string, final: string) => {
    events.push('promote');
    await rename(partial, final);
  });
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
    dependencies: {
      launchBrowser: async () => browser,
      prepareContext: async () => {
        events.push('prepare');
        return { assertNoMutations };
      },
      promoteState
    },
    prepareContext: vi.fn(async () => {
      events.push('prepare');
      return { assertNoMutations };
    }),
    promoteState
  };
}

describe('runAuthSetupCommand', () => {
  it('installs the guard before login and atomically saves validated IndexedDB evidence', async () => {
    const test = await fixture();
    await expect(
      runAuthSetupCommand([], test.environment, test.cwd, test.dependencies)
    ).resolves.toBe(0);

    expect(test.events.indexOf('prepare')).toBeLessThan(
      test.events.indexOf('goto')
    );
    expect(test.events).toContain('marker:text="YOUR PROFILE"');
    expect(test.events).toContain('marker:text="Basic Group Info"');
    expect(
      test.events.filter((event) => event.startsWith('assert-mutations:'))
    ).toHaveLength(2);
    expect(test.events).toContain('assert-mutations:1');
    expect(test.events).toContain('assert-mutations:2');
    expect(test.events).toContain('wait-url:true');
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
    expect(test.events.indexOf('page-close')).toBeLessThan(
      test.events.indexOf('context-close')
    );
    expect(test.events.indexOf('context-close')).toBeLessThan(
      test.events.indexOf('assert-mutations:2')
    );
    expect(test.events.indexOf('assert-mutations:2')).toBeLessThan(
      test.events.indexOf('promote')
    );
    expect(test.promoteState).toHaveBeenCalledOnce();
  });

  it('preserves valid prior evidence and removes partials after validation failure', async () => {
    const test = await fixture({ invalidState: true });
    await mkdir(test.authDir, { recursive: true });
    const final = path.join(test.authDir, 'company.json');
    await writeFile(final, '{"prior":true}', 'utf8');
    await chmod(final, 0o600);

    await expect(
      runAuthSetupCommand([], test.environment, test.cwd, test.dependencies)
    ).resolves.toBe(1);

    expect(await readFile(final, 'utf8')).toBe('{"prior":true}');
    await expect(
      (await import('node:fs/promises')).readdir(test.authDir)
    ).resolves.toEqual(['company.json']);
    expect(test.closePage).toHaveBeenCalledOnce();
    expect(test.closeContext).toHaveBeenCalledOnce();
    expect(test.closeBrowser).toHaveBeenCalledOnce();
    expect(test.promoteState).not.toHaveBeenCalled();
  });

  it.each([
    ['wrong origin', { finalUrl: 'http://localhost:3000/profile' }],
    ['wrong path', { finalUrl: 'http://127.0.0.1:3000/login' }],
    ['query', { finalUrl: 'http://127.0.0.1:3000/profile?next=x' }],
    ['hash', { finalUrl: 'http://127.0.0.1:3000/profile#private' }],
    ['marker failure', { failMarker: true }],
    ['first guard failure', { failGuardAt: 1 as const }],
    ['final guard failure', { failGuardAt: 2 as const }],
    ['post-close guard failure', { mutationDuringClose: true }]
  ])('preserves prior evidence after %s', async (_label, options) => {
    const test = await fixture(options);
    await mkdir(test.authDir, { recursive: true });
    const final = path.join(test.authDir, 'company.json');
    const prior = Buffer.from('prior-company-state');
    await writeFile(final, prior, { mode: 0o600 });

    await expect(
      runAuthSetupCommand([], test.environment, test.cwd, test.dependencies)
    ).resolves.toBe(1);

    expect(await readFile(final)).toEqual(prior);
    await expect(
      (await import('node:fs/promises')).readdir(test.authDir)
    ).resolves.toEqual(['company.json']);
    expect(test.promoteState).not.toHaveBeenCalled();
    expect(test.closeBrowser).toHaveBeenCalledOnce();
  });

  it('never logs visual credentials on a failed guarded promotion', async () => {
    const test = await fixture({ failGuardAt: 1 });
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    try {
      await runAuthSetupCommand(
        [],
        {
          ...test.environment,
          VR_COMPANY_EMAIL: 'SECRET_EMAIL_CANARY',
          VR_COMPANY_PASSWORD: 'SECRET_PASSWORD_CANARY'
        },
        test.cwd,
        test.dependencies
      );
      const output = [
        ...log.mock.calls,
        ...warn.mock.calls,
        ...error.mock.calls
      ]
        .flat()
        .join(' ');
      expect(output).not.toContain('SECRET_EMAIL_CANARY');
      expect(output).not.toContain('SECRET_PASSWORD_CANARY');
    } finally {
      log.mockRestore();
      warn.mockRestore();
      error.mockRestore();
    }
  });

  it('fails without opening a browser when credentials or arguments are invalid', async () => {
    const test = await fixture();
    const launchBrowser = vi.fn(async () => test.browser);
    await expect(
      runAuthSetupCommand(['--state=admin'], test.environment, test.cwd, {
        launchBrowser,
        prepareContext: test.prepareContext,
        promoteState: test.promoteState
      })
    ).resolves.toBe(1);
    await expect(
      runAuthSetupCommand(
        [],
        { ...test.environment, VR_COMPANY_PASSWORD: undefined },
        test.cwd,
        {
          launchBrowser,
          prepareContext: test.prepareContext,
          promoteState: test.promoteState
        }
      )
    ).resolves.toBe(1);
    expect(launchBrowser).not.toHaveBeenCalled();
  });
});
