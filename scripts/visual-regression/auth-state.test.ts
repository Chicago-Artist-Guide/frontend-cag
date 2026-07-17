// @vitest-environment node

import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  loadAuthState,
  loadSelectedAuthStates,
  validateAuthStorageState
} from './auth-state';
import { MANIFEST, type VisualCase } from './manifest';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true }))
  );
});

const firebaseState = (origin = 'http://127.0.0.1:3000') => ({
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
                    value: { uid: 'not-logged' }
                  }
                }
              ]
            }
          ],
          version: 1
        }
      ],
      localStorage: [{ name: 'theme', value: 'light' }],
      origin
    }
  ]
});

describe('validateAuthStorageState', () => {
  it('returns a complete validated Playwright state without dropping IndexedDB', () => {
    const source = firebaseState();
    const state = validateAuthStorageState(source, 'http://127.0.0.1:3000');

    expect(state).toEqual(source);
    expect(state.origins[0].indexedDB[0].stores[0].records).toHaveLength(1);
  });

  it.each([
    { label: 'malformed top level', mutate: () => [] },
    {
      label: 'unknown top-level field',
      mutate: () => ({ ...firebaseState(), secret: true })
    },
    {
      label: 'cookies',
      mutate: () => ({ ...firebaseState(), cookies: [{ name: 'session' }] })
    },
    {
      label: 'extra origin',
      mutate: () => ({
        ...firebaseState(),
        origins: [
          ...firebaseState().origins,
          ...firebaseState('http://localhost:3000').origins
        ]
      })
    },
    {
      label: 'origin drift',
      mutate: () => firebaseState('http://localhost:3000')
    },
    {
      label: 'noncanonical origin',
      mutate: () => firebaseState('http://127.0.0.1:3000/')
    },
    {
      label: 'malformed localStorage',
      mutate: () => {
        const state = firebaseState();
        return {
          ...state,
          origins: [{ ...state.origins[0], localStorage: [{ name: 'x' }] }]
        };
      }
    },
    {
      label: 'missing IndexedDB',
      mutate: () => {
        const state = firebaseState();
        return {
          ...state,
          origins: [
            {
              localStorage: state.origins[0].localStorage,
              origin: state.origins[0].origin
            }
          ]
        };
      }
    },
    {
      label: 'wrong database',
      mutate: () => {
        const state = firebaseState();
        state.origins[0].indexedDB[0].name = 'other';
        return state;
      }
    },
    {
      label: 'wrong store',
      mutate: () => {
        const state = firebaseState();
        state.origins[0].indexedDB[0].stores[0].name = 'other';
        return state;
      }
    },
    {
      label: 'empty Firebase records',
      mutate: () => {
        const state = firebaseState();
        state.origins[0].indexedDB[0].stores[0].records = [];
        return state;
      }
    },
    {
      label: 'non-auth Firebase record',
      mutate: () => {
        const state = firebaseState();
        const store = state.origins[0].indexedDB[0].stores[0] as unknown as {
          records: Array<{ value: unknown }>;
        };
        store.records = [
          { value: { fbase_key: 'firebase:not-auth:test', value: {} } }
        ];
        return state;
      }
    },
    {
      label: 'wrong Firebase database version',
      mutate: () => {
        const state = firebaseState();
        state.origins[0].indexedDB[0].version = 2;
        return state;
      }
    },
    {
      label: 'nonempty Firebase indexes',
      mutate: () => {
        const state = firebaseState();
        const store = state.origins[0].indexedDB[0].stores[0] as unknown as {
          indexes: Array<{
            multiEntry: boolean;
            name: string;
            unique: boolean;
          }>;
        };
        store.indexes = [{ multiEntry: false, name: 'leak', unique: false }];
        return state;
      }
    }
  ])('rejects $label', ({ mutate }) => {
    expect(() =>
      validateAuthStorageState(mutate(), 'http://127.0.0.1:3000')
    ).toThrow();
  });

  it('does not echo unknown fields or auth record canaries', () => {
    const state = firebaseState();
    const canary = 'SECRET_AUTH_TOKEN_CANARY';
    const value = state.origins[0].indexedDB[0].stores[0].records[0]
      .value as Record<string, unknown>;
    value[canary] = canary;
    try {
      validateAuthStorageState(state, 'http://127.0.0.1:3000');
      throw new Error('expected validation to fail');
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      expect(message).not.toContain(canary);
    }
  });
});

describe('loadAuthState', () => {
  async function fixture() {
    const cwd = await mkdtemp(path.join(os.tmpdir(), 'cag-auth-state-'));
    temporaryDirectories.push(cwd);
    const authDir = path.join(cwd, 'auth');
    await mkdir(authDir);
    await writeFile(
      path.join(authDir, 'company.json'),
      JSON.stringify(firebaseState()),
      'utf8'
    );
    await chmod(path.join(authDir, 'company.json'), 0o600);
    return { authDir, cwd };
  }

  it('loads company reference evidence once and returns the in-memory state', async () => {
    const test = await fixture();
    const state = await loadAuthState({
      auth: 'company',
      authDir: test.authDir,
      baseUrl: 'http://127.0.0.1:3000',
      baselinePolicy: { kind: 'reference-only', reason: 'manual evidence' }
    });
    await writeFile(path.join(test.authDir, 'company.json'), '{}', 'utf8');

    expect(state.origins[0].origin).toBe('http://127.0.0.1:3000');
    expect(
      JSON.parse(
        await readFile(path.join(test.authDir, 'company.json'), 'utf8')
      )
    ).toEqual({});
  });

  it('validates every auth policy before loading company state once', async () => {
    const company = MANIFEST.find(({ id }) => id === 'company-profile');
    if (!company) throw new Error('company fixture missing');
    const load = vi.fn(async () =>
      validateAuthStorageState(firebaseState(), 'http://127.0.0.1:3000')
    );
    const cases: VisualCase[] = [
      { entry: company, viewport: 'desktop' },
      { entry: { ...company, id: 'company-copy' }, viewport: 'desktop' }
    ];

    const states = await loadSelectedAuthStates(
      cases,
      '/unused',
      'http://127.0.0.1:3000',
      load
    );
    expect(load).toHaveBeenCalledOnce();
    expect(states.get('company')).toBeDefined();

    await expect(
      loadSelectedAuthStates(
        [
          ...cases,
          {
            entry: {
              ...company,
              baselinePolicy: { kind: 'blocking-candidate' },
              id: 'promoted-company'
            },
            viewport: 'desktop'
          }
        ],
        '/unused',
        'http://127.0.0.1:3000',
        load
      )
    ).rejects.toThrow('reference-only');
    expect(load).toHaveBeenCalledOnce();
  });

  it.each(['admin', 'individual'] as const)(
    'unconditionally rejects %s state',
    async (auth) => {
      const test = await fixture();
      await expect(
        loadAuthState({
          auth,
          authDir: test.authDir,
          baseUrl: 'http://127.0.0.1:3000',
          baselinePolicy: { kind: 'reference-only', reason: 'manual evidence' }
        })
      ).rejects.toThrow(`${auth} auth state is forbidden`);
    }
  );

  it('rejects promoted company evidence before reading its state file', async () => {
    const test = await fixture();
    await expect(
      loadAuthState({
        auth: 'company',
        authDir: test.authDir,
        baseUrl: 'http://127.0.0.1:3000',
        baselinePolicy: { kind: 'blocking-candidate' }
      })
    ).rejects.toThrow('reference-only');
  });

  it('rejects group-readable and symlinked company evidence', async () => {
    const test = await fixture();
    const statePath = path.join(test.authDir, 'company.json');
    await chmod(statePath, 0o640);
    await expect(
      loadAuthState({
        auth: 'company',
        authDir: test.authDir,
        baseUrl: 'http://127.0.0.1:3000',
        baselinePolicy: { kind: 'reference-only', reason: 'manual evidence' }
      })
    ).rejects.toThrow('unsafe');

    const realPath = path.join(test.authDir, 'real.json');
    await writeFile(realPath, JSON.stringify(firebaseState()), { mode: 0o600 });
    await rm(statePath);
    await (await import('node:fs/promises')).symlink(realPath, statePath);
    await expect(
      loadAuthState({
        auth: 'company',
        authDir: test.authDir,
        baseUrl: 'http://127.0.0.1:3000',
        baselinePolicy: { kind: 'reference-only', reason: 'manual evidence' }
      })
    ).rejects.toThrow('unsafe');
  });
});
