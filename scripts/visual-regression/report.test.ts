// @vitest-environment node

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { renderReport, runReport } from './report';
import type { DiffResult, DiffSummaryV1 } from './diff-core';

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
});
