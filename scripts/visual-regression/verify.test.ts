// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { runVerifyCommand } from './verify';

const temporaryDirectories: string[] = [];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true }))
  );
});

async function fixture() {
  const cwd = await mkdtemp(path.join(os.tmpdir(), 'cag-verify-'));
  temporaryDirectories.push(cwd);
  const artifactDir = path.join(cwd, 'artifacts');
  const diffDir = path.join(artifactDir, 'diff');
  await mkdir(diffDir, { recursive: true });
  const captureSummary = path.join(artifactDir, 'capture-summary.json');
  const summaryFile = path.join(diffDir, 'summary.json');
  const reportFile = path.join(diffDir, 'report.html');
  const currentFile = path.join(artifactDir, 'current', 'home', 'desktop.png');
  await mkdir(path.dirname(currentFile), { recursive: true });
  await writeFile(captureSummary, '{"status":"passed","stale":true}');
  await writeFile(summaryFile, '{"gateVerdict":"pass","stale":true}');
  await writeFile(reportFile, '<html>stale green</html>');
  await writeFile(currentFile, 'preserve-current');
  return {
    artifactDir,
    captureSummary,
    currentFile,
    cwd,
    environment: {
      VR_ARTIFACT_DIR: artifactDir,
      VR_AUTH_DIR: path.join(cwd, 'auth'),
      VR_BASELINE_DIR: path.join(cwd, 'baseline'),
      VR_BASE_URL: 'http://127.0.0.1:3000'
    },
    reportFile,
    summaryFile
  };
}

describe('runVerifyCommand', () => {
  it('canonicalizes ownership and runs capture, diff, then report', async () => {
    const test = await fixture();
    const calls: Array<[string, readonly string[]]> = [];
    const code = await runVerifyCommand(
      [
        '--viewport=desktop',
        '--threshold=0.002',
        '--only=home,faq',
        '--target=src/components/Home',
        '--cluster=public-static'
      ],
      test.environment,
      test.cwd,
      {
        capture: async (args) => {
          calls.push(['capture', args]);
          return 0;
        },
        diff: async (args) => {
          calls.push(['diff', args]);
          return 0;
        },
        report: async (args) => {
          calls.push(['report', args]);
          return 0;
        }
      }
    );

    expect(code).toBe(0);
    expect(calls).toEqual([
      [
        'capture',
        [
          'capture',
          '--cluster=public-static',
          '--only=home,faq',
          '--target=src/components/Home',
          '--viewport=desktop'
        ]
      ],
      ['diff', ['--threshold=0.002']],
      ['report', []]
    ]);
  });

  it('continues after nonzero codes and throws, returning the earliest failure', async () => {
    const test = await fixture();
    const calls: string[] = [];
    const code = await runVerifyCommand([], test.environment, test.cwd, {
      capture: async () => {
        calls.push('capture');
        return 1;
      },
      diff: async () => {
        calls.push('diff');
        throw new Error('diff exploded');
      },
      report: async () => {
        calls.push('report');
        return 0;
      }
    });

    expect(code).toBe(1);
    expect(calls).toEqual(['capture', 'diff', 'report']);
  });

  it.each([
    ['--wat=yes'],
    ['--only=home', '--only=faq'],
    ['--only=unknown'],
    ['--threshold=0.1', '--threshold=0.2']
  ])(
    'rejects invalid selection before mutating evidence: %s',
    async (...argv) => {
      const test = await fixture();
      const stage = vi.fn(async () => 0 as const);
      await expect(
        runVerifyCommand(argv, test.environment, test.cwd, {
          capture: stage,
          diff: stage,
          report: stage
        })
      ).resolves.toBe(1);
      expect(stage).not.toHaveBeenCalled();
      expect(
        JSON.parse(await readFile(test.captureSummary, 'utf8')).stale
      ).toBe(true);
      expect(await readFile(test.reportFile, 'utf8')).toContain('stale green');
    }
  );

  it('invalidates stale green evidence before stages can throw', async () => {
    const test = await fixture();
    const code = await runVerifyCommand([], test.environment, test.cwd, {
      capture: async () => {
        throw new Error('capture exploded');
      },
      diff: async () => {
        throw new Error('diff exploded');
      },
      report: async () => 1
    });

    expect(code).toBe(1);
    await expect(readFile(test.captureSummary, 'utf8')).rejects.toMatchObject({
      code: 'ENOENT'
    });
    await expect(readFile(test.reportFile, 'utf8')).rejects.toMatchObject({
      code: 'ENOENT'
    });
    await expect(readFile(test.summaryFile, 'utf8')).rejects.toMatchObject({
      code: 'ENOENT'
    });
    expect(await readFile(test.currentFile, 'utf8')).toBe('preserve-current');
  });

  it('does not mutate evidence or call stages while a live diff owner exists', async () => {
    const test = await fixture();
    await writeFile(
      `${path.join(test.artifactDir, 'diff')}.lock`,
      JSON.stringify({
        pid: process.pid,
        startedAt: new Date().toISOString(),
        token: 'active-owner'
      })
    );
    const stage = vi.fn(async () => 0 as const);
    await expect(
      runVerifyCommand([], test.environment, test.cwd, {
        capture: stage,
        diff: stage,
        report: stage
      })
    ).resolves.toBe(1);
    expect(stage).not.toHaveBeenCalled();
    expect(JSON.parse(await readFile(test.captureSummary, 'utf8')).stale).toBe(
      true
    );
    expect(await readFile(test.reportFile, 'utf8')).toContain('stale green');
  });

  it('rejects invalid visual environment before mutating evidence', async () => {
    const test = await fixture();
    const stage = vi.fn(async () => 0 as const);
    await expect(
      runVerifyCommand(
        [],
        {
          ...test.environment,
          VR_BASE_URL: 'https://user:secret@example.test'
        },
        test.cwd,
        { capture: stage, diff: stage, report: stage }
      )
    ).resolves.toBe(1);
    expect(stage).not.toHaveBeenCalled();
    expect(await readFile(test.reportFile, 'utf8')).toContain('stale green');
  });
});
