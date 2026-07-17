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
  assertNoCalibrationDotenv,
  assertSecureGenerationParent,
  createCalibrationEnvironment,
  inventoryCalibrationCorpus,
  resolveEvidenceRootIdentity,
  runCalibrationCommand,
  selectCalibrationInventory,
  stopOwnedServer,
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
    announceRecord: (file) => {
      events.push(`announce:${file}`);
    },
    assertNoDotenv: async () => {
      events.push('dotenv');
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
    resolveEvidenceRoot: async (root) => ({
      canonicalPath: root,
      device: '1',
      inode: root.includes('baseline') ? '1' : '2'
    }),
    runCommand: async (specification) => {
      events.push(`command:${specification.stage}`);
      return { code: 0, signal: null };
    },
    spawnServer: () => {
      events.push('server');
      return server;
    },
    stopServer: async (child) => {
      events.push('stop');
      child.kill('SIGTERM');
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
      CALIBRATION_RELATIVE_FILES.flatMap((relativePath) => [
        {
          bytes: 0,
          kind: 'directory',
          relativePath: `${path.dirname(relativePath)}/`,
          sha256: digest('directory')
        },
        {
          bytes: Buffer.byteLength(`png:${relativePath}`),
          relativePath,
          sha256: digest(`png:${relativePath}`)
        }
      ])
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
      'approved evidence tree entries must be real files or directories'
    );
  });

  it('inventories legitimate extra evidence but requires the fixed selected files', async () => {
    const root = await createCorpus('cag-calibration-exact-tree-');
    await writeFile(path.join(root, 'unexpected.png'), 'unexpected');
    const expanded = await inventoryCalibrationCorpus(root);
    expect(
      expanded.some(({ relativePath }) => relativePath === 'unexpected.png')
    ).toBe(true);
    expect(selectCalibrationInventory(expanded)).toHaveLength(6);

    await rm(path.join(root, 'unexpected.png'));
    const expected = path.join(root, CALIBRATION_RELATIVE_FILES[0]);
    await writeFile(
      path.join(path.dirname(expected), 'renamed.png'),
      'renamed'
    );
    await rm(expected);
    await expect(
      inventoryCalibrationCorpus(root).then(selectCalibrationInventory)
    ).rejects.toThrow(
      'approved calibration evidence is missing: about-us/desktop.png'
    );
  });

  it('resolves physical identity for symlink aliases', async () => {
    const root = await createCorpus('cag-calibration-root-');
    const alias = `${root}-alias`;
    temporaryDirectories.push(alias);
    await symlink(root, alias);

    await expect(resolveEvidenceRootIdentity(root)).resolves.toEqual(
      await resolveEvidenceRootIdentity(alias)
    );
  });
});

describe('calibration filesystem preflight', () => {
  it('rejects Next dotenv files that could override explicit build values', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cag-calibration-env-'));
    temporaryDirectories.push(root);
    await writeFile(path.join(root, '.env.local'), 'SECRET=value');

    await expect(assertNoCalibrationDotenv(root)).rejects.toThrow(
      'Next dotenv files are prohibited during calibration'
    );
  });

  it('repairs an owned real generation parent to private permissions', async () => {
    const created = await mkdtemp(path.join(os.tmpdir(), 'cag-vr-parent-'));
    temporaryDirectories.push(created);
    const parent = await resolveEvidenceRootIdentity(created).then(
      ({ canonicalPath }) => canonicalPath
    );
    await chmod(parent, 0o755);

    await assertSecureGenerationParent(parent);

    expect((await lstat(parent)).mode & 0o777).toBe(0o700);
  });

  it('rejects a symlink generation parent', async () => {
    const target = await mkdtemp(path.join(os.tmpdir(), 'cag-vr-target-'));
    const parent = `${target}-alias`;
    temporaryDirectories.push(target, parent);
    await symlink(target, parent);

    await expect(assertSecureGenerationParent(parent)).rejects.toThrow(
      'calibration parent must be a real owned directory'
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
      'generation',
      'announce:/private/tmp/cag-vr/calibration-test/calibration-record.json',
      'record:preparing',
      'inventory:1',
      'inventory:2',
      'record:preparing',
      'copy',
      'inventory:3',
      'record:prepared',
      'port',
      'dotenv',
      'command:build',
      'record:built',
      'port',
      'server',
      'health',
      'hydrated',
      'record:ready',
      'command:semantic',
      'record:semantic-complete',
      'health',
      'command:visual',
      'record:visual-complete',
      'stop',
      'inventory:4',
      'inventory:5',
      'inventory:6',
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

  it('allows independent full corpora to differ outside the fixed six', async () => {
    const test = harness();
    const source = [
      ...inventory(),
      { bytes: 3, relativePath: 'company-profile/desktop.png', sha256: 'aaa' }
    ];
    const staging = [
      ...inventory(),
      { bytes: 4, relativePath: 'events/desktop.png', sha256: 'bbbb' }
    ];
    const inventories = [
      source,
      staging,
      inventory(),
      source,
      staging,
      inventory()
    ];
    test.dependencies.inventoryCorpus = async () => {
      const next = inventories.shift();
      if (!next) throw new Error('unexpected inventory call');
      return next;
    };

    await expect(
      runCalibrationCommand([], environment, '/repo', test.dependencies)
    ).resolves.toBe(0);
  });

  it('rejects physical aliases before copying or building', async () => {
    const test = harness();
    test.dependencies.resolveEvidenceRoot = async () => ({
      canonicalPath: '/proof/canonical',
      device: '1',
      inode: '1'
    });

    await expect(
      runCalibrationCommand([], environment, '/repo', test.dependencies)
    ).resolves.toBe(1);
    expect(test.events).not.toContain('copy');
    expect(test.events).not.toContain('command:build');
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
    expect(test.events).toContain('inventory:6');
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
    expect(test.events).toContain('inventory:6');
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

  it('records corpus preflight failure in an announced generation', async () => {
    const test = harness();
    test.dependencies.inventoryCorpus = async () => {
      test.events.push('inventory:failed');
      throw new Error('untrusted detail');
    };

    await expect(
      runCalibrationCommand([], environment, '/repo', test.dependencies)
    ).resolves.toBe(1);
    expect(test.events.slice(0, 3)).toEqual([
      'generation',
      'announce:/private/tmp/cag-vr/calibration-test/calibration-record.json',
      'record:preparing'
    ]);
    expect(test.records.at(-1)).toMatchObject({ status: 'failed' });
    expect(JSON.stringify(test.records)).not.toContain('untrusted detail');
  });

  it('fails immediately for an already-aborted signal without preflight or commands', async () => {
    const test = harness();
    const controller = new AbortController();
    controller.abort('SIGINT');

    await expect(
      runCalibrationCommand([], environment, '/repo', test.dependencies, {
        signal: controller.signal
      })
    ).resolves.toBe(130);
    expect(test.events).not.toContain('inventory:1');
    expect(test.events.some((event) => event.startsWith('command:'))).toBe(
      false
    );
    expect(test.records).toEqual([]);
  });

  it('does not run visual after the owned server exits during semantic checks', async () => {
    const test = harness();
    test.dependencies.runCommand = async (specification) => {
      test.events.push(`command:${specification.stage}`);
      if (specification.stage === 'semantic') {
        test.server.exitCode = 1;
        test.server.emit('exit', 1, null);
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
      return { code: 0, signal: null };
    };

    await expect(
      runCalibrationCommand([], environment, '/repo', test.dependencies)
    ).resolves.toBe(1);
    expect(test.events).not.toContain('command:visual');
    expect(test.records.at(-1)).toMatchObject({ status: 'failed' });
  });

  it('fails a nominal run when owned-server cleanup cannot be proved', async () => {
    const test = harness();
    test.dependencies.stopServer = async () => {
      test.events.push('stop');
      throw new Error('cleanup did not complete');
    };

    await expect(
      runCalibrationCommand([], environment, '/repo', test.dependencies)
    ).resolves.toBe(1);
    expect(test.records.at(-1)).toMatchObject({
      failure: { stage: 'server-cleanup' },
      status: 'failed'
    });
  });
});

describe('immutable copied permissions', () => {
  it('documents the expected no-write permission bits', async () => {
    const root = await createCorpus('cag-calibration-mode-');
    const file = path.join(root, CALIBRATION_RELATIVE_FILES[0]);
    await chmod(file, 0o444);
    expect((await lstat(file)).mode & 0o777).toBe(0o444);
    expect(fsConstants.O_NOFOLLOW).toBeTypeOf('number');
  });

  it('fails cleanup after TERM and KILL when no owned exit is observed', async () => {
    const child: SpawnedChild = {
      exitCode: null,
      kill: vi.fn(() => false),
      signalCode: null
    };
    const neverExits = new Promise<{
      code: number | null;
      signal: NodeJS.Signals | null;
    }>(() => undefined);

    await expect(stopOwnedServer(child, neverExits, 1)).rejects.toThrow(
      'owned server cleanup could not be proved'
    );
    expect(child.kill).toHaveBeenNthCalledWith(1, 'SIGTERM');
    expect(child.kill).toHaveBeenNthCalledWith(2, 'SIGKILL');
  });
});
