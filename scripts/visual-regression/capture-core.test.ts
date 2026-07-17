// @vitest-environment node

import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { runCapture, writeCapturePngAtomically } from './capture-core';
import { MANIFEST, type VisualCase } from './manifest';

const temporaryDirectories: string[] = [];

const selectedCases: VisualCase[] = [
  { entry: MANIFEST[0], viewport: 'desktop' },
  { entry: MANIFEST[1], viewport: 'desktop' }
];

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true }))
  );
});

async function outputDirectory(): Promise<string> {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'cag-capture-core-'));
  temporaryDirectories.push(directory);
  return directory;
}

describe('runCapture', () => {
  it('aggregates case failures, continues, and names artifacts only for success', async () => {
    const artifactDir = await outputDirectory();
    const summaryPath = path.join(artifactDir, 'capture-summary.json');

    const result = await runCapture({
      artifactDir,
      baseUrl: 'https://user:secret@example.test/?token=secret#fragment',
      captureOne: async (visualCase) => {
        if (visualCase.entry.id === 'home') {
          throw new Error('failed https://example.test/path?secret=yes#token');
        }
        return {
          artifact: `current/${visualCase.entry.id}/${visualCase.viewport}.png`,
          blockedRequests: [],
          finalUrl: `https://example.test/${visualCase.entry.id}?secret=yes`,
          stability: null
        };
      },
      cases: selectedCases,
      command: 'capture',
      selection: { ids: selectedCases.map(({ entry }) => entry.id) },
      summaryPath
    });

    expect(result.ok).toBe(false);
    expect(result.summary.totals).toEqual({
      failed: 1,
      passed: 1,
      selected: 2
    });
    expect(result.summary.outputBucket).toBe('current');
    expect(result.summary.cases).toEqual([
      expect.objectContaining({ id: 'home', status: 'failed' }),
      expect.objectContaining({
        artifact: 'current/faq/desktop.png',
        finalUrl: 'https://example.test/faq',
        id: 'faq',
        status: 'passed'
      })
    ]);
    expect(result.summary.cases[0]).not.toHaveProperty('artifact');
    expect(result.summary.cases[0].baselinePolicy).toEqual(
      selectedCases[0].entry.baselinePolicy
    );

    const persisted = JSON.parse(await readFile(summaryPath, 'utf8'));
    expect(persisted.schemaVersion).toBe(1);
    expect(persisted.baseUrl).toBe('https://example.test/');
    expect(JSON.stringify(persisted)).not.toContain('secret');
    expect(JSON.stringify(persisted)).not.toContain('stack');
  });

  it('writes a failed summary when preflight cannot start a browser', async () => {
    const artifactDir = await outputDirectory();
    const summaryPath = path.join(artifactDir, 'capture-summary.json');

    const result = await runCapture({
      artifactDir,
      baseUrl: 'http://127.0.0.1:3000',
      captureOne: async () => {
        throw new Error('must not run');
      },
      cases: selectedCases,
      command: 'baseline',
      prepare: async () => {
        throw new TypeError('browser unavailable');
      },
      selection: {},
      summaryPath
    });

    expect(result.ok).toBe(false);
    expect(result.summary.runErrors).toEqual([
      {
        message: 'browser unavailable',
        name: 'TypeError',
        phase: 'prepare'
      }
    ]);
    expect(result.summary.cases).toHaveLength(2);
    expect(
      result.summary.cases.every(({ status }) => status === 'failed')
    ).toBe(true);
    expect(result.summary.cases.map(({ id }) => id)).toEqual(['home', 'faq']);
    expect(JSON.parse(await readFile(summaryPath, 'utf8'))).toMatchObject({
      status: 'failed',
      totals: { failed: 2, passed: 0, selected: 2 }
    });
  });

  it('keeps row totals consistent when cleanup fails after successful cases', async () => {
    const artifactDir = await outputDirectory();
    const result = await runCapture({
      artifactDir,
      baseUrl: 'http://127.0.0.1:3000',
      captureOne: async (visualCase) => ({
        artifact: `current/${visualCase.entry.id}/${visualCase.viewport}.png`,
        blockedRequests: [],
        finalUrl: `http://127.0.0.1:3000${visualCase.entry.path}`,
        stability: null
      }),
      cases: selectedCases,
      cleanup: async () => {
        throw new Error('close failed');
      },
      command: 'capture',
      selection: {},
      summaryPath: path.join(artifactDir, 'capture-summary.json')
    });

    expect(result.ok).toBe(false);
    expect(result.summary.cases.map(({ id }) => id)).toEqual(['home', 'faq']);
    expect(result.summary.totals).toEqual({
      failed: 0,
      passed: 2,
      selected: 2
    });
    expect(result.summary.runErrors).toEqual([
      { message: 'close failed', name: 'Error', phase: 'cleanup' }
    ]);
  });

  it.each([
    '',
    '.',
    '../escape.png',
    'current\\home\\desktop.png',
    'home/desktop.png'
  ])(
    'rejects non-canonical artifact %j without naming it',
    async (artifact) => {
      const artifactDir = await outputDirectory();
      const result = await runCapture({
        artifactDir,
        baseUrl: 'http://127.0.0.1:3000',
        captureOne: async () => ({
          artifact,
          blockedRequests: [],
          finalUrl: 'http://127.0.0.1:3000/home',
          stability: null
        }),
        cases: [selectedCases[0]],
        command: 'capture',
        selection: {},
        summaryPath: path.join(artifactDir, 'capture-summary.json')
      });

      expect(result.summary.cases[0]).not.toHaveProperty('artifact');
      expect(result.summary.cases[0].status).toBe('failed');
    }
  );

  it('fails duplicate selected cases before capture and preserves their order', async () => {
    const artifactDir = await outputDirectory();
    const duplicated = [selectedCases[1], selectedCases[0], selectedCases[1]];
    const result = await runCapture({
      artifactDir,
      baseUrl: 'http://127.0.0.1:3000',
      captureOne: async () => {
        throw new Error('must not capture');
      },
      cases: duplicated,
      command: 'capture',
      selection: {},
      summaryPath: path.join(artifactDir, 'capture-summary.json')
    });

    expect(result.summary.cases.map(({ id }) => id)).toEqual([
      'faq',
      'home',
      'faq'
    ]);
    expect(result.summary.totals).toEqual({
      failed: 3,
      passed: 0,
      selected: 3
    });
    expect(result.summary.runErrors[0].phase).toBe('prepare');
  });
});

describe('writeCapturePngAtomically', () => {
  it('promotes a completed partial and leaves no temporary file', async () => {
    const directory = await outputDirectory();
    const finalPath = path.join(directory, 'current/home/desktop.png');

    await writeCapturePngAtomically(finalPath, async (partialPath) => {
      expect(partialPath).toMatch(/\.partial\.png$/u);
      await writeFile(partialPath, 'fresh image');
    });

    expect(await readFile(finalPath, 'utf8')).toBe('fresh image');
    expect(await readdir(path.dirname(finalPath))).toEqual(['desktop.png']);
  });

  it('removes stale and partial images when capture fails', async () => {
    const directory = await outputDirectory();
    const finalPath = path.join(directory, 'current/home/desktop.png');
    await writeCapturePngAtomically(finalPath, async (partialPath) => {
      await writeFile(partialPath, 'stale image');
    });

    await expect(
      writeCapturePngAtomically(finalPath, async (partialPath) => {
        await writeFile(partialPath, 'partial image');
        throw new Error('screenshot failed');
      })
    ).rejects.toThrow('screenshot failed');

    expect(await readdir(path.dirname(finalPath))).toEqual([]);
  });
});
