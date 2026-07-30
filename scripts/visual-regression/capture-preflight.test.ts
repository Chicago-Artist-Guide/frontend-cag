// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { resolveCaptureInvocation } from './capture-preflight';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true }))
  );
});

async function fixture() {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'cag-capture-preflight-'));
  temporaryDirectories.push(cwd);
  const artifactDir = path.join(cwd, 'artifacts');
  const summaryPath = path.join(artifactDir, 'capture-summary.json');
  await mkdir(artifactDir, { recursive: true });
  await writeFile(
    summaryPath,
    JSON.stringify({ stale: true, status: 'passed' })
  );
  return {
    artifactDir,
    cwd,
    environment: {
      VR_ARTIFACT_DIR: artifactDir,
      VR_AUTH_DIR: path.join(cwd, 'auth'),
      VR_BASELINE_DIR: path.join(cwd, 'baseline'),
      VR_BASE_URL: 'http://127.0.0.1:3000'
    },
    summaryPath
  };
}

describe('resolveCaptureInvocation', () => {
  it.each(['--only=unknown', '--wat=yes', '--only=home,,faq'])(
    'replaces stale green evidence for malformed selection %s',
    async (flag) => {
      const test = await fixture();
      await expect(
        resolveCaptureInvocation(['capture', flag], test.environment, test.cwd)
      ).resolves.toBeNull();
      const summary = JSON.parse(await readFile(test.summaryPath, 'utf8'));
      expect(summary).toMatchObject({ command: 'capture', status: 'failed' });
      expect(summary.stale).toBeUndefined();
      expect(summary.runErrors[0].phase).toBe('prepare');
    }
  );

  it('writes failed evidence for invalid base URL when output paths are safe', async () => {
    const test = await fixture();
    await expect(
      resolveCaptureInvocation(
        ['capture', '--only=home'],
        {
          ...test.environment,
          VR_BASE_URL: 'https://user:secret@example.test'
        },
        test.cwd
      )
    ).resolves.toBeNull();
    expect(JSON.parse(await readFile(test.summaryPath, 'utf8')).status).toBe(
      'failed'
    );
  });

  it('does not write when overlap makes the artifact path unsafe', async () => {
    const test = await fixture();
    const stale = await readFile(test.summaryPath, 'utf8');
    await expect(
      resolveCaptureInvocation(
        ['capture'],
        { ...test.environment, VR_BASELINE_DIR: test.artifactDir },
        test.cwd
      )
    ).rejects.toThrow('must not overlap');
    expect(await readFile(test.summaryPath, 'utf8')).toBe(stale);
  });

  it('rejects invalid authority without choosing an output bucket', async () => {
    const test = await fixture();
    const stale = await readFile(test.summaryPath, 'utf8');
    await expect(
      resolveCaptureInvocation(['current'], test.environment, test.cwd)
    ).rejects.toThrow('leading baseline or capture command');
    expect(await readFile(test.summaryPath, 'utf8')).toBe(stale);
  });
});
