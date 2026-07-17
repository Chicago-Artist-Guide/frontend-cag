// @vitest-environment node

import { createHash } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { constants as fsConstants } from 'node:fs';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  rm,
  symlink,
  writeFile
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  CALIBRATION_CASES,
  CALIBRATION_RELATIVE_FILES,
  createCalibrationEnvironment,
  inventoryCalibrationCorpus,
  runCalibrationCommand,
  type CalibrationDependencies,
  type CalibrationInventory,
  type CalibrationRecord,
  type SpawnedChild
} from './calibrate';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true }))
  );
});

const digest = (value: string) =>
  createHash('sha256').update(value).digest('hex');

const createCorpus = async (prefix: string) => {
  const root = await mkdtemp(path.join(os.tmpdir(), prefix));
  temporaryDirectories.push(root);
  for (const relativePath of CALIBRATION_RELATIVE_FILES) {
    const absolutePath = path.join(root, relativePath);
    await mkdir(path.dirname(absolutePath), { recursive: true });
    await writeFile(absolutePath, `png:${relativePath}`);
  }
  return root;
};

const publicValues = {
  NEXT_PUBLIC_FIREBASE_API_KEY: 'public-api-key',
  NEXT_PUBLIC_FIREBASE_APP_ID: 'public-app-id',
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'public-measurement-id',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'public-project-id',
  NEXT_PUBLIC_FIREBASE_SENDER_ID: 'public-sender-id',
  NEXT_PUBLIC_LGL_API_KEY: 'public-lgl-key'
};

class FakeChild extends EventEmitter implements SpawnedChild {
  exitCode: number | null = null;
  signalCode: NodeJS.Signals | null = null;
  readonly kill = vi.fn((signal?: NodeJS.Signals | number) => {
    this.signalCode = typeof signal === 'string' ? signal : 'SIGTERM';
    this.emit('exit', null, this.signalCode);
    return true;
  });
}

const inventory = (suffix = ''): CalibrationInventory =>
  CALIBRATION_RELATIVE_FILES.map((relativePath) => ({
    bytes: 10,
    relativePath,
    sha256: digest(`${relativePath}${suffix}`)
  }));

const harness = () => {
  const events: string[] = [];
  const records: CalibrationRecord[] = [];
  const server = new FakeChild();
  let inventoryCalls = 0;
  const dependencies: CalibrationDependencies = {
    assertPortAvailable: async () => {
      events.push('port');
    },
    copyCorpus: async () => {
      events.push('copy');
    },
    createGeneration: async () => {
      events.push('generation');
      return {
        artifactDir: '/private/tmp/cag-vr/calibration-test/artifacts',
        authDir: '/private/tmp/cag-vr/calibration-test/auth',
        baselineDir: '/private/tmp/cag-vr/calibration-test/baseline',
        generationDir: '/private/tmp/cag-vr/calibration-test',
        recordFile:
          '/private/tmp/cag-vr/calibration-test/calibration-record.json'
      };
    },
    inventoryCorpus: async () => {
      inventoryCalls += 1;
      events.push(`inventory:${inventoryCalls}`);
      return inventory();
    },
    now: () => new Date('2026-07-17T00:00:00.000Z'),
    probeHealth: async () => {
      events.push('health');
    },
    probeHydratedRoute: async () => {
      events.push('hydrated');
    },
    readBuildMetadata: async () => ({
      buildId: 'build-id',
      gitRevision: 'abc123',
      nextVersion: '16.2.10',
      npmVersion: '10.9.4'
    }),
    runCommand: async (specification) => {
      events.push(`command:${specification.stage}`);
      return { code: 0, signal: null };
    },
    spawnServer: () => {
      events.push('server');
      return server;
    },
    waitForServerExit: async () =>
      new Promise((resolve) =>
        server.once('exit', (code, signal) => resolve({ code, signal }))
      ),
    writeRecord: async (_file, record) => {
      events.push(`record:${record.status}`);
      records.push(structuredClone(record));
    }
  };
  return { dependencies, events, records, server };
};

describe('calibration corpus', () => {
  it('pins the six sorted anonymous desktop cases', () => {
    expect(CALIBRATION_CASES).toEqual([
      'about-us',
      'donate',
      'faq',
      'forgot-password',
      'login',
      'signup'
    ]);
    expect(CALIBRATION_RELATIVE_FILES).toEqual(
      CALIBRATION_CASES.map((id) => `${id}/desktop.png`)
    );
  });

  it('reads exact regular files into a sorted descriptor-bound inventory', async () => {
    const root = await createCorpus('cag-calibration-corpus-');

    await expect(inventoryCalibrationCorpus(root)).resolves.toEqual(
      CALIBRATION_RELATIVE_FILES.map((relativePath) => ({
        bytes: Buffer.byteLength(`png:${relativePath}`),
        relativePath,
        sha256: digest(`png:${relativePath}`)
      }))
    );
  });

  it('rejects a symlink in place of approved evidence', async () => {
    const root = await createCorpus('cag-calibration-symlink-');
    const target = path.join(root, CALIBRATION_RELATIVE_FILES[0]);
    const replacement = `${target}.replacement`;
    await writeFile(replacement, 'replacement');
    await rm(target);
    await symlink(replacement, target);

    await expect(inventoryCalibrationCorpus(root)).rejects.toThrow(
      'approved evidence must be a regular file'
    );
  });
});

describe('calibration environment', () => {
  it('requires independent absolute proof roots and all public build values', () => {
    expect(() =>
      createCalibrationEnvironment(
        {
          ...publicValues,
          VR_APPROVED_BASELINE_DIR: 'relative/baseline',
          VR_APPROVED_STAGING_DIR: '/proof/staging'
        },
        '/repo'
      )
    ).toThrow('VR_APPROVED_BASELINE_DIR must be an absolute path');

    expect(() =>
      createCalibrationEnvironment(
        {
          ...publicValues,
          NEXT_PUBLIC_FIREBASE_API_KEY: '',
          VR_APPROVED_BASELINE_DIR: '/proof/baseline',
          VR_APPROVED_STAGING_DIR: '/proof/staging'
        },
        '/repo'
      )
    ).toThrow('NEXT_PUBLIC_FIREBASE_API_KEY is required');
  });

  it('passes only allowlisted operational and explicit public values to children', () => {
    const result = createCalibrationEnvironment(
      {
        ...publicValues,
        AWS_SECRET_ACCESS_KEY: 'do-not-forward',
        HOME: '/safe-home',
        PATH: '/safe-path',
        VR_APPROVED_BASELINE_DIR: '/proof/baseline',
        VR_APPROVED_STAGING_DIR: '/proof/staging',
        VR_AUTH_EMAIL: 'do-not-forward'
      },
      '/repo'
    );

    expect(result.childEnvironment).toMatchObject({
      ...publicValues,
      HOME: '/safe-home',
      NODE_ENV: 'production',
      PATH: '/safe-path'
    });
    expect(result.childEnvironment).not.toHaveProperty('AWS_SECRET_ACCESS_KEY');
    expect(result.childEnvironment).not.toHaveProperty('VR_AUTH_EMAIL');
    expect(result.publicValueHashes).toEqual(
      Object.keys(publicValues)
        .sort()
        .map((name) => ({
          name,
          sha256: digest(publicValues[name as keyof typeof publicValues])
        }))
    );
  });
});

describe('runCalibrationCommand', () => {
  const environment = {
    ...publicValues,
    PATH: '/safe-path',
    VR_APPROVED_BASELINE_DIR: '/proof/baseline',
    VR_APPROVED_STAGING_DIR: '/proof/staging'
  };

  it('owns one build and server while running semantic then visual gates', async () => {
    const test = harness();

    await expect(
      runCalibrationCommand([], environment, '/repo', test.dependencies)
    ).resolves.toBe(0);

    expect(test.events).toEqual([
      'inventory:1',
      'inventory:2',
      'generation',
      'record:preparing',
      'copy',
      'inventory:3',
      'record:prepared',
      'port',
      'command:build',
      'record:built',
      'server',
      'health',
      'hydrated',
      'record:ready',
      'command:semantic',
      'record:semantic-complete',
      'health',
      'command:visual',
      'record:visual-complete',
      'inventory:4',
      'inventory:5',
      'inventory:6',
      'record:passed',
      'record:passed'
    ]);
    expect(test.server.kill).toHaveBeenCalledWith('SIGTERM');

    const final = test.records.at(-1);
    expect(final).toMatchObject({
      status: 'passed',
      commands: {
        build: { argv: ['npm', 'run', 'build'], code: 0 },
        semantic: {
          argv: ['npm', 'run', 'test:e2e:external'],
          code: 0
        },
        visual: {
          argv: [
            'npm',
            'run',
            'vr:verify',
            '--',
            '--only=faq,donate,about-us,login,signup,forgot-password',
            '--viewport=desktop',
            '--threshold=0.001'
          ],
          code: 0
        }
      },
      metadata: { buildId: 'build-id', nodeVersion: process.version },
      publicEnvironment: expect.any(Array)
    });
    expect(JSON.stringify(final)).not.toContain('public-api-key');
    expect(JSON.stringify(final)).not.toContain('/proof/baseline');
  });

  it('still runs the visual gate after semantic failure while healthy', async () => {
    const test = harness();
    test.dependencies.runCommand = async (specification) => {
      test.events.push(`command:${specification.stage}`);
      return {
        code: specification.stage === 'semantic' ? 2 : 0,
        signal: null
      };
    };

    await expect(
      runCalibrationCommand([], environment, '/repo', test.dependencies)
    ).resolves.toBe(1);
    expect(test.events).toContain('command:visual');
    expect(test.records.at(-1)).toMatchObject({ status: 'failed' });
  });

  it('still runs the visual gate when the semantic command cannot start', async () => {
    const test = harness();
    test.dependencies.runCommand = async (specification) => {
      test.events.push(`command:${specification.stage}`);
      if (specification.stage === 'semantic') {
        throw new Error('semantic process could not start');
      }
      return { code: 0, signal: null };
    };

    await expect(
      runCalibrationCommand([], environment, '/repo', test.dependencies)
    ).resolves.toBe(1);
    expect(test.events).toContain('command:visual');
    expect(test.records.at(-1)).toMatchObject({ status: 'failed' });
  });

  it('stops before server ownership when the build fails', async () => {
    const test = harness();
    test.dependencies.runCommand = async (specification) => {
      test.events.push(`command:${specification.stage}`);
      return { code: specification.stage === 'build' ? 1 : 0, signal: null };
    };

    await expect(
      runCalibrationCommand([], environment, '/repo', test.dependencies)
    ).resolves.toBe(1);
    expect(test.events).not.toContain('server');
    expect(test.records.at(-1)).toMatchObject({ status: 'failed' });
  });

  it('fails and terminates its child when readiness never succeeds', async () => {
    const test = harness();
    test.dependencies.probeHealth = async () => {
      test.events.push('health');
      throw new Error('secret readiness detail');
    };

    await expect(
      runCalibrationCommand([], environment, '/repo', test.dependencies)
    ).resolves.toBe(1);
    expect(test.server.kill).toHaveBeenCalledWith('SIGTERM');
    expect(test.events).not.toContain('command:semantic');
    expect(JSON.stringify(test.records.at(-1))).not.toContain('secret');
  });

  it('fails closed when any post-run proof inventory changes', async () => {
    const test = harness();
    let call = 0;
    test.dependencies.inventoryCorpus = async () => {
      call += 1;
      test.events.push(`inventory:${call}`);
      return call === 4 ? inventory('-changed') : inventory();
    };

    await expect(
      runCalibrationCommand([], environment, '/repo', test.dependencies)
    ).resolves.toBe(1);
    expect(test.records.at(-1)).toMatchObject({ status: 'failed' });
  });

  it.each([
    ['SIGINT', 130],
    ['SIGTERM', 143]
  ] as const)(
    'maps %s cancellation to %i and cleans up',
    async (signal, code) => {
      const test = harness();
      const controller = new AbortController();
      test.dependencies.probeHealth = async () => {
        controller.abort(signal);
        throw new Error('aborted');
      };

      await expect(
        runCalibrationCommand([], environment, '/repo', test.dependencies, {
          signal: controller.signal
        })
      ).resolves.toBe(code);
      expect(test.server.kill).toHaveBeenCalled();
    }
  );
});

describe('immutable copied permissions', () => {
  it('documents the expected no-write permission bits', async () => {
    const root = await createCorpus('cag-calibration-mode-');
    const file = path.join(root, CALIBRATION_RELATIVE_FILES[0]);
    await chmod(file, 0o444);
    expect((await lstat(file)).mode & 0o777).toBe(0o444);
    expect(fsConstants.O_NOFOLLOW).toBeTypeOf('number');
  });
});
