// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderReport, runReport } from './report';
import {
  acquireGenerationLock,
  type DiffResult,
  type DiffSummaryV1
} from './diff-core';

const result = (overrides: Partial<DiffResult>): DiffResult => ({
  auth: 'anonymous',
  baselineAsset: 'report-assets/baseline/faq/desktop.png',
  baselineDimensions: { height: 1, width: 1 },
  baselineEvidence: 'valid',
  baselinePolicy: { kind: 'blocking-candidate' },
  comparison: 'identical',
  currentAsset: 'report-assets/current/faq/desktop.png',
  currentDimensions: { height: 1, width: 1 },
  currentEvidence: 'valid',
  diffPixels: 0,
  dimensionsMatch: true,
  gateVerdict: 'pass',
  id: 'faq',
  issues: [],
  path: '/faq',
  ratio: 0,
  totalPixels: 1,
  verdict: 'pass',
  viewport: 'desktop',
  ...overrides
});

const summary = (results: DiffResult[]): DiffSummaryV1 => ({
  capture: null,
  finishedAt: '2026-07-17T01:00:01.000Z',
  gateVerdict: results.some(({ gateVerdict }) => gateVerdict === 'fail')
    ? 'fail'
    : 'pass',
  generationId: 'fixture-generation',
  maxDiffRatio: 0.001,
  pixelSensitivity: 0.1,
  results,
  runErrors: [],
  schemaVersion: 1,
  startedAt: '2026-07-17T01:00:00.000Z',
  totals: {
    failed: results.filter(({ gateVerdict }) => gateVerdict === 'fail').length,
    notEnforced: results.filter(
      ({ gateVerdict }) => gateVerdict === 'not-enforced'
    ).length,
    passed: results.filter(({ gateVerdict }) => gateVerdict === 'pass').length,
    selected: results.length
  }
});

describe('renderReport', () => {
  it('is pure, byte-identical, and sorts a failure-first view without mutating JSON order', () => {
    const input = summary([
      result({ id: 'same', path: '/same' }),
      result({
        comparison: 'changed',
        diffPixels: 1,
        gateVerdict: 'pass',
        id: 'under',
        ratio: 0.0005
      }),
      result({
        comparison: 'changed',
        diffPixels: 2,
        gateVerdict: 'not-enforced',
        id: 'info',
        ratio: 0.5,
        verdict: 'fail'
      }),
      result({
        comparison: 'not-run',
        gateVerdict: 'fail',
        id: 'failure',
        issues: [
          { code: 'missing-current', message: 'missing', scope: 'current' }
        ],
        ratio: null,
        verdict: 'fail'
      })
    ]);
    const before = JSON.stringify(input);
    const first = renderReport(input);
    const second = renderReport(input);

    expect(first).toBe(second);
    expect(JSON.stringify(input)).toBe(before);
    expect(first.indexOf('data-id="failure"')).toBeLessThan(
      first.indexOf('data-id="info"')
    );
    expect(first.indexOf('data-id="info"')).toBeLessThan(
      first.indexOf('data-id="under"')
    );
    expect(first.indexOf('data-id="under"')).toBeLessThan(
      first.indexOf('data-id="same"')
    );
    expect(first).toContain('changed-under-threshold');
  });

  it('escapes every text and attribute context and emits placeholders for missing assets', () => {
    const hostile = '&<>"\'';
    const html = renderReport(
      summary([
        result({
          baselineAsset: undefined,
          baselineEvidence: 'missing',
          comparison: 'not-run',
          currentAsset: undefined,
          currentEvidence: 'read-error',
          gateVerdict: 'fail',
          id: `id${hostile}`,
          issues: [
            {
              code: `code${hostile}`,
              message: `message${hostile}`,
              scope: 'run'
            }
          ],
          path: `/path${hostile}`,
          ratio: null,
          verdict: 'fail'
        })
      ])
    );

    expect(html).not.toContain(hostile);
    expect(html).toContain('&amp;&lt;&gt;&quot;&#39;');
    expect(html).toContain('asset unavailable');
    expect(html).not.toMatch(/<img[^>]+src="undefined"/u);
  });

  it('uses a restrictive no-network CSP and contains no script or absolute paths', () => {
    const html = renderReport(summary([result({})]));
    expect(html).toContain(
      'default-src &#39;none&#39;; img-src &#39;self&#39; data:; style-src &#39;unsafe-inline&#39;; object-src &#39;none&#39;; connect-src &#39;none&#39;; base-uri &#39;none&#39;; form-action &#39;none&#39;'
    );
    expect(html).not.toMatch(/<script\b/iu);
    expect(html).not.toMatch(/(?:src|href)="(?:https?:|\/|file:)/iu);
    expect(html).not.toContain('toLocaleString');
  });

  it('invalidates an existing report when the diff summary is malformed', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cag-report-'));
    try {
      const summaryFile = path.join(root, 'summary.json');
      const reportFile = path.join(root, 'report.html');
      await mkdir(root, { recursive: true });
      await writeFile(summaryFile, JSON.stringify({ gateVerdict: 'pass' }));
      await writeFile(reportFile, 'stale green');
      expect(await runReport(summaryFile, reportFile)).toBe(1);
      await expect(readFile(reportFile)).rejects.toThrow();
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it('rejects internally inconsistent evidence instead of rendering a broken image', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cag-report-shape-'));
    try {
      const summaryFile = path.join(root, 'summary.json');
      const reportFile = path.join(root, 'report.html');
      const inconsistent = summary([
        result({ baselineAsset: undefined, baselineEvidence: 'valid' })
      ]);
      await writeFile(summaryFile, JSON.stringify(inconsistent));
      expect(await runReport(summaryFile, reportFile)).toBe(1);
      await expect(readFile(reportFile)).rejects.toThrow();
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it('rechecks the generation before committing a report', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cag-report-race-'));
    try {
      const summaryFile = path.join(root, 'summary.json');
      const reportFile = path.join(root, 'report.html');
      const oldGreen = summary([result({})]);
      oldGreen.generationId = 'old-green';
      oldGreen.capture = {
        baseUrl: 'http://127.0.0.1:3000/',
        cases: [
          {
            artifact: 'current/faq/desktop.png',
            auth: 'anonymous',
            baselinePolicy: { kind: 'blocking-candidate' },
            blockedRequests: [],
            durationMs: 1,
            id: 'faq',
            path: '/faq',
            status: 'passed',
            viewport: 'desktop'
          }
        ],
        command: 'capture',
        finishedAt: '2026-07-17T01:00:01.000Z',
        outputBucket: 'current',
        runtime: { node: 'v22.22.0', os: 'darwin' },
        runErrors: [],
        schemaVersion: 1,
        selection: { ids: ['faq'], viewports: ['desktop'] },
        startedAt: '2026-07-17T01:00:00.000Z',
        status: 'passed',
        totals: { failed: 0, passed: 1, selected: 1 }
      };
      const newRed = structuredClone(oldGreen);
      newRed.generationId = 'new-red';
      newRed.gateVerdict = 'fail';
      newRed.runErrors = [
        { message: 'new failure', name: 'Error', phase: 'asset-tree' }
      ];
      await writeFile(summaryFile, JSON.stringify(oldGreen));
      let beforeCommitCalled = false;

      const code = await runReport(summaryFile, reportFile, {
        beforeCommit: async () => {
          beforeCommitCalled = true;
          await writeFile(summaryFile, JSON.stringify(newRed));
        }
      });

      expect(code).toBe(1);
      expect(beforeCommitCalled).toBe(true);
      await expect(readFile(reportFile)).rejects.toThrow();
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it('does not invalidate a report when another owner holds the generation lock', async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), 'cag-report-lock-'));
    try {
      const summaryFile = path.join(root, 'summary.json');
      const reportFile = path.join(root, 'report.html');
      await writeFile(reportFile, 'owner A report');
      const ownerA = await acquireGenerationLock(root);

      expect(await runReport(summaryFile, reportFile)).toBe(1);
      expect(await readFile(reportFile, 'utf8')).toBe('owner A report');

      await ownerA.release();
    } finally {
      await rm(root, { force: true, recursive: true });
    }
  });

  it('renders validated capture cleanup errors even when every pixel is identical', () => {
    const input = summary([result({})]);
    input.gateVerdict = 'fail';
    input.runErrors = [
      {
        message: 'browser cleanup failed',
        name: 'Error',
        phase: 'capture-cleanup'
      }
    ];
    const html = renderReport(input);
    expect(html).toContain('capture-cleanup');
    expect(html).toContain('browser cleanup failed');
  });
});
