// @vitest-environment node

import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { PNG } from 'pngjs';
import { afterEach, describe, expect, it } from 'vitest';
import type { CaptureCaseSummaryV1, CaptureSummaryV1 } from './capture-core';
import {
  acquireGenerationLock,
  comparePngCase,
  runDiff,
  validateCaptureSummary,
  validateDiffSummary,
  type PngEvidenceInput
} from './diff-core';
import { MANIFEST, type BaselinePolicy, type VisualCase } from './manifest';

const temporaryDirectories: string[] = [];
type SummaryRecord = Record<string, unknown>;

afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map((directory) => rm(directory, { force: true, recursive: true }))
  );
});

const png = (width: number, height: number, rgba: number[]): Buffer => {
  const image = new PNG({ height, width });
  for (let index = 0; index < width * height; index += 1) {
    image.data.set(rgba, index * 4);
  }
  return PNG.sync.write(image);
};

const pixelPng = (...pixels: number[][]): Buffer => {
  const image = new PNG({ height: 1, width: pixels.length });
  pixels.forEach((pixel, index) => image.data.set(pixel, index * 4));
  return PNG.sync.write(image);
};

const bytes = (value: Buffer): PngEvidenceInput => ({
  bytes: value,
  kind: 'bytes'
});

const visualCase = (
  policy: BaselinePolicy = { kind: 'blocking-candidate' },
  index = 1
): VisualCase => ({
  entry: { ...MANIFEST[index], baselinePolicy: policy },
  viewport: 'desktop'
});

const passedCapture = (subject: VisualCase): CaptureCaseSummaryV1 => ({
  artifact: `current/${subject.entry.id}/${subject.viewport}.png`,
  auth: subject.entry.auth,
  baselinePolicy: subject.entry.baselinePolicy,
  blockedRequests: [],
  durationMs: 5,
  finalUrl: `http://127.0.0.1:3000${subject.entry.path}`,
  id: subject.entry.id,
  path: subject.entry.path,
  stability: null,
  status: 'passed',
  viewport: subject.viewport
});

const captureSummary = (
  cases: VisualCase[],
  rows = cases.map(passedCapture)
): CaptureSummaryV1 => ({
  baseUrl: 'http://127.0.0.1:3000',
  cases: rows,
  command: 'capture',
  finishedAt: '2026-07-17T01:00:01.000Z',
  outputBucket: 'current',
  runtime: { browser: 'fixture', node: 'v22', os: 'fixture' },
  runErrors: [],
  schemaVersion: 1,
  selection: { ids: cases.map(({ entry }) => entry.id) },
  startedAt: '2026-07-17T01:00:00.000Z',
  status: rows.some(({ status }) => status === 'failed') ? 'failed' : 'passed',
  totals: {
    failed: rows.filter(({ status }) => status === 'failed').length,
    passed: rows.filter(({ status }) => status === 'passed').length,
    selected: rows.length
  }
});

describe('generation lock', () => {
  it('recovers a stale owner but never removes a live owner lock', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cag-diff-lock-'));
    temporaryDirectories.push(root);
    const diffDir = path.join(root, 'diff');
    const lockRoot = `${diffDir}.lock`;
    await mkdir(lockRoot);
    await writeFile(
      path.join(lockRoot, 'owner.json'),
      JSON.stringify({
        pid: 2_147_483_647,
        startedAt: '2026-07-17T01:00:00.000Z',
        token: 'stale-owner'
      })
    );

    const recovered = await acquireGenerationLock(diffDir);
    await recovered.release();
    await expect(readFile(path.join(lockRoot, 'owner.json'))).rejects.toThrow();

    await mkdir(lockRoot);
    await writeFile(
      path.join(lockRoot, 'owner.json'),
      JSON.stringify({
        pid: process.pid,
        startedAt: '2026-07-17T01:00:00.000Z',
        token: 'live-owner'
      })
    );
    await expect(acquireGenerationLock(diffDir)).rejects.toThrow(
      'another visual diff generation is active'
    );
    expect(
      JSON.parse(await readFile(path.join(lockRoot, 'owner.json'), 'utf8'))
        .token
    ).toBe('live-owner');
  });

  it('does not release a lock after its owner token changes', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cag-diff-owner-'));
    temporaryDirectories.push(root);
    const diffDir = path.join(root, 'diff');
    const lock = await acquireGenerationLock(diffDir);
    await writeFile(
      path.join(`${diffDir}.lock`, 'owner.json'),
      JSON.stringify({
        pid: process.pid,
        startedAt: '2026-07-17T01:00:00.000Z',
        token: 'replacement-owner'
      })
    );

    await lock.release();

    expect(
      JSON.parse(
        await readFile(path.join(`${diffDir}.lock`, 'owner.json'), 'utf8')
      ).token
    ).toBe('replacement-owner');
  });
});

describe('comparePngCase', () => {
  it('passes identical one-pixel images', () => {
    const subject = visualCase();
    const compared = comparePngCase({
      baselineBytes: bytes(png(1, 1, [10, 20, 30, 255])),
      captureResult: passedCapture(subject),
      currentBytes: bytes(png(1, 1, [10, 20, 30, 255])),
      maxDiffRatio: 0,
      pixelSensitivity: 0,
      visualCase: subject
    });

    expect(compared.diffPng).toBeUndefined();
    expect(compared.result).toMatchObject({
      comparison: 'identical',
      diffPixels: 0,
      dimensionsMatch: true,
      gateVerdict: 'pass',
      ratio: 0,
      totalPixels: 1,
      verdict: 'pass'
    });
  });

  it.each([
    { changed: 1, expected: 'pass', maxDiffRatio: 0.5 },
    { changed: 1, expected: 'pass', maxDiffRatio: 0.25 },
    { changed: 2, expected: 'fail', maxDiffRatio: 0.25 }
  ] as const)(
    'uses exact ratio threshold semantics for $changed changed pixels',
    ({ changed, expected, maxDiffRatio }) => {
      const subject = visualCase();
      const black = [0, 0, 0, 255];
      const white = [255, 255, 255, 255];
      const current = Array.from({ length: 4 }, (_, index) =>
        index < changed ? white : black
      );
      const { result } = comparePngCase({
        baselineBytes: bytes(pixelPng(black, black, black, black)),
        captureResult: passedCapture(subject),
        currentBytes: bytes(pixelPng(...current)),
        maxDiffRatio,
        pixelSensitivity: 0,
        visualCase: subject
      });

      expect(result.ratio).toBe(changed / 4);
      expect(result.gateVerdict).toBe(expected);
    }
  );

  it('pads dimension changes, emits a diff, and fails factually', () => {
    const subject = visualCase();
    const compared = comparePngCase({
      baselineBytes: bytes(png(1, 1, [0, 0, 0, 255])),
      captureResult: passedCapture(subject),
      currentBytes: bytes(png(2, 1, [0, 0, 0, 255])),
      maxDiffRatio: 0.9,
      pixelSensitivity: 0,
      visualCase: subject
    });

    expect(compared.diffPng).toBeInstanceOf(Buffer);
    expect(compared.result).toMatchObject({
      baselineDimensions: { height: 1, width: 1 },
      currentDimensions: { height: 1, width: 2 },
      dimensionsMatch: false,
      gateVerdict: 'fail',
      totalPixels: 2,
      verdict: 'fail'
    });
    expect(compared.result.issues.map(({ code }) => code)).toContain(
      'dimension-mismatch'
    );
  });

  it.each([
    { evidence: { kind: 'missing' }, issue: 'missing-baseline' },
    { evidence: bytes(Buffer.from('not png')), issue: 'invalid-baseline' },
    {
      evidence: { kind: 'read-error', message: 'permission denied' },
      issue: 'baseline-read-error'
    }
  ] as Array<{ evidence: PngEvidenceInput; issue: string }>)(
    'fails explicit baseline evidence state $issue',
    ({ evidence, issue }) => {
      const subject = visualCase();
      const { result } = comparePngCase({
        baselineBytes: evidence,
        captureResult: passedCapture(subject),
        currentBytes: bytes(png(1, 1, [0, 0, 0, 255])),
        maxDiffRatio: 1 / 2,
        pixelSensitivity: 0,
        visualCase: subject
      });
      expect(result.baselineEvidence).toBe(
        issue === 'missing-baseline'
          ? 'missing'
          : issue === 'invalid-baseline'
            ? 'invalid'
            : 'read-error'
      );
      expect(result.issues.map(({ code }) => code)).toContain(issue);
      expect(result.gateVerdict).toBe('fail');
    }
  );

  it('retains simultaneous independent baseline and current faults', () => {
    const subject = visualCase();
    const { result } = comparePngCase({
      baselineBytes: { kind: 'missing' },
      captureResult: passedCapture(subject),
      currentBytes: { kind: 'read-error', message: 'denied' },
      maxDiffRatio: 0.1,
      pixelSensitivity: 0.1,
      visualCase: subject
    });
    expect(result.issues.map(({ code }) => code)).toEqual([
      'missing-baseline',
      'current-read-error'
    ]);
    expect(result.comparison).toBe('not-run');
    expect(result.ratio).toBeNull();
  });

  it('does not enforce reference-only pixel or dimension changes', () => {
    const subject = visualCase({ kind: 'reference-only', reason: 'live data' });
    const { result } = comparePngCase({
      baselineBytes: bytes(png(1, 1, [0, 0, 0, 255])),
      captureResult: passedCapture(subject),
      currentBytes: bytes(png(2, 1, [255, 255, 255, 255])),
      maxDiffRatio: 0,
      pixelSensitivity: 0,
      visualCase: subject
    });
    expect(result.verdict).toBe('fail');
    expect(result.gateVerdict).toBe('not-enforced');
  });

  it.each([false, true])(
    'always fails missing baseline policy when baseline present=%s',
    (present) => {
      const subject = visualCase({
        kind: 'missing',
        reason: 'not captured yet'
      });
      const { result } = comparePngCase({
        baselineBytes: present
          ? bytes(png(1, 1, [0, 0, 0, 255]))
          : { kind: 'missing' },
        captureResult: passedCapture(subject),
        currentBytes: bytes(png(1, 1, [0, 0, 0, 255])),
        maxDiffRatio: 0,
        pixelSensitivity: 0,
        visualCase: subject
      });
      expect(result.gateVerdict).toBe('fail');
      expect(result.issues.map(({ code }) => code)).toContain(
        present ? 'unexpected-baseline' : 'missing-baseline-policy'
      );
    }
  );

  it('preserves capture failures and ignores stale current bytes', () => {
    const subject = visualCase();
    const failed: CaptureCaseSummaryV1 = {
      ...passedCapture(subject),
      artifact: undefined,
      error: { message: 'capture exploded', name: 'Error' },
      status: 'failed'
    };
    const { result } = comparePngCase({
      baselineBytes: bytes(png(1, 1, [0, 0, 0, 255])),
      captureResult: failed,
      currentBytes: bytes(png(1, 1, [0, 0, 0, 255])),
      maxDiffRatio: 0,
      pixelSensitivity: 0,
      visualCase: subject
    });
    expect(result.comparison).toBe('not-run');
    expect(result.currentEvidence).toBe('missing');
    expect(result.issues.map(({ code }) => code)).toContain('capture-failed');
    expect(result.currentAsset).toBeUndefined();
  });
});

describe('validateCaptureSummary', () => {
  it('accepts an exact current capture matrix in manifest selection order', () => {
    const cases = [visualCase(undefined, 1), visualCase(undefined, 2)];
    expect(
      validateCaptureSummary(captureSummary(cases), MANIFEST).cases
    ).toHaveLength(2);
  });

  const firstRow = (summary: SummaryRecord): SummaryRecord =>
    (summary.cases as SummaryRecord[])[0];

  const invalidSummaryMutations: Array<
    [string, (summary: SummaryRecord) => void]
  > = [
    [
      'unknown-version',
      (summary) => {
        summary.schemaVersion = 2;
      }
    ],
    [
      'wrong-command',
      (summary) => {
        summary.command = 'baseline';
      }
    ],
    [
      'wrong-bucket',
      (summary) => {
        summary.outputBucket = 'baseline';
      }
    ],
    [
      'totals-drift',
      (summary) => {
        (summary.totals as SummaryRecord).selected = 99;
      }
    ],
    [
      'status-drift',
      (summary) => {
        summary.status = 'failed';
      }
    ],
    [
      'path-drift',
      (summary) => {
        firstRow(summary).path = '/about-us';
      }
    ],
    [
      'auth-drift',
      (summary) => {
        firstRow(summary).auth = 'admin';
      }
    ],
    [
      'policy-drift',
      (summary) => {
        firstRow(summary).baselinePolicy = {
          kind: 'reference-only',
          reason: 'stale'
        };
      }
    ],
    [
      'duplicate-case',
      (summary) => {
        (summary.cases as SummaryRecord[]).push(firstRow(summary));
      }
    ],
    [
      'absolute-artifact',
      (summary) => {
        firstRow(summary).artifact = '/tmp/x.png';
      }
    ],
    [
      'backslash-artifact',
      (summary) => {
        firstRow(summary).artifact = 'current\\faq\\desktop.png';
      }
    ],
    [
      'traversal-artifact',
      (summary) => {
        firstRow(summary).artifact = 'current/../faq/desktop.png';
      }
    ],
    [
      'wrong-artifact',
      (summary) => {
        firstRow(summary).artifact = 'current/home/desktop.png';
      }
    ]
  ];

  it.each(invalidSummaryMutations)('rejects %s', (_name, mutate) => {
    const cases = [visualCase()];
    const summary = structuredClone(
      captureSummary(cases)
    ) as unknown as SummaryRecord;
    mutate(summary);
    expect(() => validateCaptureSummary(summary, MANIFEST)).toThrow();
  });

  it('requires failed rows to omit artifacts and passed rows to name one exact artifact', () => {
    const subject = visualCase();
    const failed = { ...passedCapture(subject), status: 'failed' as const };
    expect(() =>
      validateCaptureSummary(captureSummary([subject], [failed]), MANIFEST)
    ).toThrow('failed capture case must not name an artifact');
    const passed = { ...passedCapture(subject), artifact: undefined };
    expect(() =>
      validateCaptureSummary(captureSummary([subject], [passed]), MANIFEST)
    ).toThrow('passed capture case must name');
  });

  it('reconstructs the full summary instead of returning the caller object', () => {
    const subject = visualCase();
    const raw = captureSummary([subject]);
    const validated = validateCaptureSummary(raw, MANIFEST);
    expect(validated).not.toBe(raw);
    expect(validated.cases[0]).not.toBe(raw.cases[0]);
    expect(validated).toEqual(raw);
  });

  it.each([
    [
      'summary',
      (value: SummaryRecord) => {
        value.junk = 'secret';
      }
    ],
    [
      'runtime',
      (value: SummaryRecord) => {
        (value.runtime as SummaryRecord).junk = true;
      }
    ],
    [
      'selection',
      (value: SummaryRecord) => {
        (value.selection as SummaryRecord).junk = true;
      }
    ],
    [
      'row',
      (value: SummaryRecord) => {
        firstRow(value).junk = true;
      }
    ],
    [
      'blocked request',
      (value: SummaryRecord) => {
        firstRow(value).blockedRequests = [
          {
            disposition: 'silent-block',
            junk: 'secret',
            method: 'POST',
            url: 'https://example.test/collect'
          }
        ];
      }
    ],
    [
      'stability',
      (value: SummaryRecord) => {
        firstRow(value).stability = {
          durationMs: 1,
          fonts: [],
          frames: [],
          images: { checked: 0, exemptedBroken: [] },
          intervalsCleared: 0,
          junk: true,
          masks: []
        };
      }
    ]
  ] as Array<[string, (value: SummaryRecord) => void]>)(
    'rejects unknown fields in the nested %s object',
    (_label, mutate) => {
      const subject = visualCase();
      const raw = structuredClone(
        captureSummary([subject])
      ) as unknown as SummaryRecord;
      mutate(raw);
      expect(() => validateCaptureSummary(raw, MANIFEST)).toThrow('unknown');
    }
  );

  it('rejects credentialed or unsanitized capture URLs', () => {
    const subject = visualCase();
    const raw = structuredClone(captureSummary([subject]));
    raw.baseUrl = 'https://user:secret@example.test';
    expect(() => validateCaptureSummary(raw, MANIFEST)).toThrow('sanitized');
    raw.baseUrl = 'http://127.0.0.1:3000';
    raw.cases[0].finalUrl = 'http://127.0.0.1:3000/faq?token=secret';
    expect(() => validateCaptureSummary(raw, MANIFEST)).toThrow('sanitized');
  });

  it('sanitizes absolute filesystem paths from capture failure diagnostics', () => {
    const subject = visualCase();
    const failed: CaptureCaseSummaryV1 = {
      ...passedCapture(subject),
      artifact: undefined,
      error: {
        message: 'failed /Users/person/private.json and C:\\secret\\key.txt',
        name: 'Error'
      },
      status: 'failed'
    };
    const validated = validateCaptureSummary(
      captureSummary([subject], [failed]),
      MANIFEST
    );
    expect(validated.cases[0].error?.message).not.toMatch(/(?:\/Users|C:\\)/u);
  });
});

describe('runDiff', () => {
  const makeRun = async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cag-diff-core-'));
    temporaryDirectories.push(root);
    const baselineDir = path.join(root, 'baseline');
    const artifactDir = path.join(root, 'artifacts');
    const currentDir = path.join(artifactDir, 'current');
    const diffDir = path.join(artifactDir, 'diff');
    await mkdir(baselineDir, { recursive: true });
    await mkdir(currentDir, { recursive: true });
    return {
      artifactDir,
      baselineDir,
      captureSummary: path.join(artifactDir, 'capture-summary.json'),
      currentDir,
      diffDir,
      reportFile: path.join(diffDir, 'report.html'),
      summaryFile: path.join(diffDir, 'summary.json')
    };
  };

  it('continues deterministically after bad evidence and creates portable assets', async () => {
    const paths = await makeRun();
    const cases = [visualCase(undefined, 1), visualCase(undefined, 2)];
    await writeFile(
      paths.captureSummary,
      JSON.stringify(captureSummary(cases))
    );
    for (const subject of cases) {
      const directory = path.join(paths.currentDir, subject.entry.id);
      await mkdir(directory, { recursive: true });
      await writeFile(
        path.join(directory, 'desktop.png'),
        png(1, 1, [0, 0, 0, 255])
      );
    }
    await mkdir(path.join(paths.baselineDir, cases[0].entry.id), {
      recursive: true
    });
    await writeFile(
      path.join(paths.baselineDir, cases[0].entry.id, 'desktop.png'),
      Buffer.from('bad png')
    );
    await mkdir(path.join(paths.baselineDir, cases[1].entry.id), {
      recursive: true
    });
    await writeFile(
      path.join(paths.baselineDir, cases[1].entry.id, 'desktop.png'),
      png(1, 1, [0, 0, 0, 255])
    );
    await mkdir(path.join(paths.diffDir, 'report-assets/diff/stale'), {
      recursive: true
    });
    await writeFile(
      path.join(paths.diffDir, 'report-assets/diff/stale/desktop.png'),
      'stale'
    );

    const run = await runDiff({
      manifest: MANIFEST,
      maxDiffRatio: 0.001,
      paths,
      pixelSensitivity: 0.1
    });

    expect(run.exitCode).toBe(1);
    expect(run.summary.results.map(({ id }) => id)).toEqual(
      cases.map(({ entry }) => entry.id)
    );
    expect(run.summary.results[0].issues.map(({ code }) => code)).toContain(
      'invalid-baseline'
    );
    expect(run.summary.results[1].comparison).toBe('identical');
    expect(run.summary.results[1]).toMatchObject({
      baselineAsset: `report-assets/baseline/${cases[1].entry.id}/desktop.png`,
      currentAsset: `report-assets/current/${cases[1].entry.id}/desktop.png`
    });
    expect(
      await readdir(path.join(paths.diffDir, 'report-assets/diff'))
    ).not.toContain('stale');
    expect(JSON.stringify(run.summary)).not.toContain(paths.artifactDir);
    expect(JSON.parse(await readFile(paths.summaryFile, 'utf8'))).toEqual(
      run.summary
    );
  });

  it('preflights baseline evidence even when capture failed and never copies stale current', async () => {
    const paths = await makeRun();
    const subject = visualCase();
    const row: CaptureCaseSummaryV1 = {
      ...passedCapture(subject),
      artifact: undefined,
      error: { message: 'capture failed', name: 'Error' },
      status: 'failed'
    };
    await writeFile(
      paths.captureSummary,
      JSON.stringify(captureSummary([subject], [row]))
    );
    await mkdir(path.join(paths.baselineDir, subject.entry.id), {
      recursive: true
    });
    await writeFile(
      path.join(paths.baselineDir, subject.entry.id, 'desktop.png'),
      png(1, 1, [0, 0, 0, 255])
    );
    await mkdir(path.join(paths.currentDir, subject.entry.id), {
      recursive: true
    });
    await writeFile(
      path.join(paths.currentDir, subject.entry.id, 'desktop.png'),
      png(1, 1, [0, 0, 0, 255])
    );

    const run = await runDiff({
      manifest: MANIFEST,
      maxDiffRatio: 0.001,
      paths,
      pixelSensitivity: 0.1
    });
    expect(run.summary.results[0]).toMatchObject({
      baselineEvidence: 'valid',
      comparison: 'not-run',
      currentEvidence: 'missing'
    });
    expect(run.summary.results[0].currentAsset).toBeUndefined();
    await expect(
      readFile(
        path.join(
          paths.diffDir,
          `report-assets/current/${subject.entry.id}/desktop.png`
        )
      )
    ).rejects.toThrow();
  });

  it('replaces stale green evidence with a failure summary and empty fresh assets for malformed input', async () => {
    const paths = await makeRun();
    await mkdir(path.join(paths.diffDir, 'report-assets/baseline/stale'), {
      recursive: true
    });
    await writeFile(
      path.join(paths.diffDir, 'report-assets/baseline/stale/desktop.png'),
      'stale'
    );
    await mkdir(paths.diffDir, { recursive: true });
    await writeFile(paths.summaryFile, JSON.stringify({ gateVerdict: 'pass' }));
    await writeFile(paths.reportFile, '<p>stale green</p>');
    await writeFile(paths.captureSummary, '{broken json');

    const run = await runDiff({
      manifest: MANIFEST,
      maxDiffRatio: 0.001,
      paths,
      pixelSensitivity: 0.1
    });

    expect(run.exitCode).toBe(1);
    expect(run.summary.gateVerdict).toBe('fail');
    expect(run.summary.runErrors[0].phase).toBe('capture-summary');
    expect(run.summary.results).toEqual([]);
    expect(
      await readdir(path.join(paths.diffDir, 'report-assets/baseline'))
    ).toEqual([]);
    await expect(readFile(paths.reportFile)).rejects.toThrow();
    expect(
      JSON.parse(await readFile(paths.summaryFile, 'utf8')).gateVerdict
    ).toBe('fail');
  });

  it('replaces the entire prior generation, including unrelated stale files', async () => {
    const paths = await makeRun();
    const subject = visualCase();
    await writeFile(
      paths.captureSummary,
      JSON.stringify(captureSummary([subject]))
    );
    for (const root of [paths.baselineDir, paths.currentDir]) {
      await mkdir(path.join(root, subject.entry.id), { recursive: true });
      await writeFile(
        path.join(root, subject.entry.id, 'desktop.png'),
        png(1, 1, [0, 0, 0, 255])
      );
    }
    await mkdir(paths.diffDir, { recursive: true });
    await writeFile(path.join(paths.diffDir, 'unrelated-stale.txt'), 'stale');
    await writeFile(paths.reportFile, 'stale green');

    const run = await runDiff({
      manifest: MANIFEST,
      maxDiffRatio: 0.001,
      paths,
      pixelSensitivity: 0.1
    });

    expect(run.exitCode).toBe(0);
    expect(await readdir(paths.diffDir)).toEqual([
      'report-assets',
      'summary.json'
    ]);
  });

  it('does not leak absolute capture-summary paths into a replacement failure summary', async () => {
    const paths = await makeRun();
    const run = await runDiff({
      manifest: MANIFEST,
      maxDiffRatio: 0.001,
      paths,
      pixelSensitivity: 0.1
    });
    expect(JSON.stringify(run.summary)).not.toContain(paths.artifactDir);
  });

  it.each(['baseline', 'current'] as const)(
    'treats a symlinked %s asset as a read error without copying outside bytes',
    async (side) => {
      const paths = await makeRun();
      const subject = visualCase();
      await writeFile(
        paths.captureSummary,
        JSON.stringify(captureSummary([subject]))
      );
      const outside = path.join(
        path.dirname(paths.artifactDir),
        `${side}-outside.png`
      );
      await writeFile(outside, png(1, 1, [0, 0, 0, 255]));
      for (const root of [paths.baselineDir, paths.currentDir]) {
        await mkdir(path.join(root, subject.entry.id), { recursive: true });
        await writeFile(
          path.join(root, subject.entry.id, 'desktop.png'),
          png(1, 1, [0, 0, 0, 255])
        );
      }
      const sourceRoot =
        side === 'baseline' ? paths.baselineDir : paths.currentDir;
      await rm(path.join(sourceRoot, subject.entry.id, 'desktop.png'));
      await symlink(
        outside,
        path.join(sourceRoot, subject.entry.id, 'desktop.png')
      );

      const run = await runDiff({
        manifest: MANIFEST,
        maxDiffRatio: 0.001,
        paths,
        pixelSensitivity: 0.1
      });

      expect(run.summary.results[0][`${side}Evidence`]).toBe('read-error');
      expect(run.summary.results[0][`${side}Asset`]).toBeUndefined();
      expect(run.exitCode).toBe(1);
    }
  );

  it('treats a broken symlinked case directory as read-error evidence', async () => {
    const paths = await makeRun();
    const subject = visualCase();
    await writeFile(
      paths.captureSummary,
      JSON.stringify(captureSummary([subject]))
    );
    await symlink(
      path.join(path.dirname(paths.baselineDir), 'does-not-exist'),
      path.join(paths.baselineDir, subject.entry.id),
      'dir'
    );
    await mkdir(path.join(paths.currentDir, subject.entry.id), {
      recursive: true
    });
    await writeFile(
      path.join(paths.currentDir, subject.entry.id, 'desktop.png'),
      png(1, 1, [0, 0, 0, 255])
    );

    const run = await runDiff({
      manifest: MANIFEST,
      maxDiffRatio: 0.001,
      paths,
      pixelSensitivity: 0.1
    });

    expect(run.summary.results[0].baselineEvidence).toBe('read-error');
    expect(run.summary.results[0].issues.map(({ code }) => code)).toContain(
      'baseline-read-error'
    );
  });

  it('never invokes the current reader for a failed capture row', async () => {
    const paths = await makeRun();
    const subject = visualCase();
    const row: CaptureCaseSummaryV1 = {
      ...passedCapture(subject),
      artifact: undefined,
      error: { message: 'capture failed', name: 'Error' },
      status: 'failed'
    };
    const serialized = Buffer.from(
      JSON.stringify(captureSummary([subject], [row]))
    );
    const baselineFile = path.join(
      paths.baselineDir,
      subject.entry.id,
      'desktop.png'
    );
    await mkdir(path.dirname(baselineFile), { recursive: true });
    await writeFile(baselineFile, png(1, 1, [0, 0, 0, 255]));
    const reads: string[] = [];
    const opened: string[] = [];
    const run = await runDiff({
      afterEvidenceOpen: async (file) => {
        opened.push(file);
      },
      manifest: MANIFEST,
      maxDiffRatio: 0.001,
      paths,
      pixelSensitivity: 0.1,
      readBytes: async (file) => {
        reads.push(file);
        if (file === paths.captureSummary) return serialized;
        return readFile(file);
      }
    });
    expect(run.exitCode).toBe(1);
    expect(opened).toContain(baselineFile);
    expect(opened.some((file) => file.startsWith(paths.currentDir))).toBe(
      false
    );
    expect(reads).toEqual([paths.captureSummary]);
  });

  it('reads evidence from the already-open descriptor when the source path is swapped', async () => {
    const paths = await makeRun();
    const subject = visualCase();
    await writeFile(
      paths.captureSummary,
      JSON.stringify(captureSummary([subject]))
    );
    const baselineFile = path.join(
      paths.baselineDir,
      subject.entry.id,
      'desktop.png'
    );
    const currentFile = path.join(
      paths.currentDir,
      subject.entry.id,
      'desktop.png'
    );
    await mkdir(path.dirname(baselineFile), { recursive: true });
    await mkdir(path.dirname(currentFile), { recursive: true });
    const black = png(1, 1, [0, 0, 0, 255]);
    const outside = path.join(path.dirname(paths.artifactDir), 'outside.png');
    await writeFile(baselineFile, black);
    await writeFile(currentFile, black);
    await writeFile(outside, png(1, 1, [255, 255, 255, 255]));
    let swapped = false;

    const run = await runDiff({
      afterEvidenceOpen: async (file) => {
        if (file !== baselineFile || swapped) return;
        swapped = true;
        await rm(baselineFile);
        await symlink(outside, baselineFile);
      },
      manifest: MANIFEST,
      maxDiffRatio: 0.001,
      paths,
      pixelSensitivity: 0.1
    });

    expect(run.summary.results[0].comparison).toBe('identical');
    expect(
      await readFile(
        path.join(
          paths.diffDir,
          `report-assets/baseline/${subject.entry.id}/desktop.png`
        )
      )
    ).toEqual(black);
  });

  it('installs an asset-tree failure generation after a recoverable staged write fault', async () => {
    const paths = await makeRun();
    const subject = visualCase();
    await writeFile(
      paths.captureSummary,
      JSON.stringify(captureSummary([subject]))
    );
    for (const root of [paths.baselineDir, paths.currentDir]) {
      await mkdir(path.join(root, subject.entry.id), { recursive: true });
      await writeFile(
        path.join(root, subject.entry.id, 'desktop.png'),
        png(1, 1, [0, 0, 0, 255])
      );
    }
    await mkdir(paths.diffDir, { recursive: true });
    await writeFile(paths.reportFile, 'stale green');
    let failed = false;

    const run = await runDiff({
      fault: (operation) => {
        if (operation === 'write-asset' && !failed) {
          failed = true;
          throw new Error('injected /private/write failure');
        }
      },
      manifest: MANIFEST,
      maxDiffRatio: 0.001,
      paths,
      pixelSensitivity: 0.1
    });

    expect(run.exitCode).toBe(1);
    expect(run.summary.runErrors).toEqual([
      expect.objectContaining({ phase: 'asset-tree' })
    ]);
    expect(JSON.stringify(run.summary)).not.toContain('/private');
    await expect(readFile(paths.reportFile)).rejects.toThrow();
    expect(
      JSON.parse(await readFile(paths.summaryFile, 'utf8')).gateVerdict
    ).toBe('fail');
  });

  it('installs a red generation and preserves the backup when rollback fails', async () => {
    const paths = await makeRun();
    const subject = visualCase();
    await writeFile(
      paths.captureSummary,
      JSON.stringify(captureSummary([subject]))
    );
    for (const root of [paths.baselineDir, paths.currentDir]) {
      await mkdir(path.join(root, subject.entry.id), { recursive: true });
      await writeFile(
        path.join(root, subject.entry.id, 'desktop.png'),
        png(1, 1, [0, 0, 0, 255])
      );
    }
    await mkdir(paths.diffDir, { recursive: true });
    await writeFile(paths.reportFile, 'recoverable previous generation');

    const run = await runDiff({
      fault: (operation) => {
        if (operation === 'promote' || operation === 'rollback') {
          throw new Error(`injected ${operation} failure`);
        }
      },
      manifest: MANIFEST,
      maxDiffRatio: 0.001,
      paths,
      pixelSensitivity: 0.1
    });

    expect(run.exitCode).toBe(1);
    expect(run.summary.runErrors[0].phase).toBe('asset-tree');
    const siblings = await readdir(path.dirname(paths.diffDir));
    expect(
      siblings.some((name) =>
        name.startsWith(`${path.basename(paths.diffDir)}.backup-`)
      )
    ).toBe(true);
    expect(
      JSON.parse(await readFile(paths.summaryFile, 'utf8')).gateVerdict
    ).toBe('fail');
  });

  it('rejects forged diff/capture correspondence even when forged totals look green', async () => {
    const paths = await makeRun();
    const subject = visualCase();
    await writeFile(
      paths.captureSummary,
      JSON.stringify(captureSummary([subject]))
    );
    for (const root of [paths.baselineDir, paths.currentDir]) {
      await mkdir(path.join(root, subject.entry.id), { recursive: true });
      await writeFile(
        path.join(root, subject.entry.id, 'desktop.png'),
        png(1, 1, [0, 0, 0, 255])
      );
    }
    const run = await runDiff({
      manifest: MANIFEST,
      maxDiffRatio: 0.001,
      paths,
      pixelSensitivity: 0.1
    });
    const forged = structuredClone(run.summary) as unknown as SummaryRecord;
    forged.results = [];
    forged.totals = { failed: 0, notEnforced: 0, passed: 0, selected: 0 };
    forged.gateVerdict = 'pass';
    (forged.capture as SummaryRecord).status = 'failed';
    (forged.capture as SummaryRecord).totals = {
      failed: 0,
      passed: 999,
      selected: 999
    };
    (forged.capture as SummaryRecord).baseUrl = 'file:///etc/passwd';

    expect(() => validateDiffSummary(forged)).toThrow();
  });
});
