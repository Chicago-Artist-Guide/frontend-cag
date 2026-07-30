// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { validateAuthStorageState } from './auth-state';
import { captureContextOptionsFor, runCaptureCommand } from './capture';
import { runDiffCommand } from './diff';
import { MANIFEST } from './manifest';
import { runReportCommand } from './report';

describe('visual command entrypoints', () => {
  it('are import-safe and leave process exit ownership to their main guards', async () => {
    const previous = process.exitCode;
    process.exitCode = 73;
    await import('./auth-setup');
    await import('./capture');
    await import('./diff');
    await import('./report');
    await import('./verify');
    expect(process.exitCode).toBe(73);
    process.exitCode = previous;
  });

  it('rejects flags in the runner that owns each command', async () => {
    const environment = {
      VR_ARTIFACT_DIR: '/tmp/cag-vr-entry-artifacts',
      VR_AUTH_DIR: '/tmp/cag-vr-entry-auth',
      VR_BASELINE_DIR: '/tmp/cag-vr-entry-baseline'
    };
    await expect(
      runCaptureCommand(['wrong'], environment, '/tmp/cag-vr-entry')
    ).rejects.toThrow('leading baseline or capture command');
    await expect(
      runDiffCommand(['--only=home'], environment, '/tmp/cag-vr-entry')
    ).rejects.toThrow('diff does not accept');
    await expect(
      runReportCommand(['--threshold=0.1'], environment, '/tmp/cag-vr-entry')
    ).rejects.toThrow('report does not accept');
  });

  it('passes validated IndexedDB auth state to Playwright in memory', () => {
    const company = MANIFEST.find(({ id }) => id === 'company-profile');
    if (!company) throw new Error('company visual fixture is missing');
    const storageState = validateAuthStorageState(
      {
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
                          value: { uid: 'fixture' }
                        }
                      }
                    ]
                  }
                ],
                version: 1
              }
            ],
            localStorage: [],
            origin: 'http://127.0.0.1:3000'
          }
        ]
      },
      'http://127.0.0.1:3000'
    );

    const options = captureContextOptionsFor(
      { entry: company, viewport: 'desktop' },
      new Map([['company', storageState]])
    );
    expect(options.storageState).toBe(storageState);
    expect(typeof options.storageState).toBe('object');
  });
});
