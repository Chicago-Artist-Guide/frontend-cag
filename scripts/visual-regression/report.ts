/**
 * Renders an HTML side-by-side report from snapshots/diff/summary.json.
 *
 * Usage:
 *   npx tsx scripts/visual-regression/report.ts
 *
 * Output: scripts/visual-regression/snapshots/diff/report.html
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import type { DiffEntry } from './diff';

const SNAP_DIR = path.resolve(
  process.cwd(),
  'scripts/visual-regression/snapshots'
);
const DIFF_DIR = path.join(SNAP_DIR, 'diff');

function relFromReport(absPath: string): string {
  return path.relative(DIFF_DIR, absPath);
}

function escape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderRow(r: DiffEntry): string {
  const pct = (r.diffRatio * 100).toFixed(3);
  const cls =
    r.status === 'ok' ? 'ok' : r.status === 'changed' ? 'changed' : 'missing';
  return `
    <section class="row ${cls}">
      <header>
        <h2>${escape(r.route)} <span class="vp">${escape(r.viewport)}</span></h2>
        <span class="badge ${cls}">${r.status}</span>
        <span class="metric">${r.diffPixels.toLocaleString()} px (${pct}%)</span>
      </header>
      <div class="grid">
        <figure><figcaption>baseline</figcaption><img src="${escape(relFromReport(r.baselinePath))}" loading="lazy" /></figure>
        <figure><figcaption>current</figcaption><img src="${escape(relFromReport(r.currentPath))}" loading="lazy" /></figure>
        <figure><figcaption>diff</figcaption><img src="${escape(relFromReport(r.diffPath))}" loading="lazy" /></figure>
      </div>
    </section>`;
}

async function main() {
  const summaryFile = path.join(DIFF_DIR, 'summary.json');
  const summary = JSON.parse(await fs.readFile(summaryFile, 'utf8')) as {
    threshold: number;
    results: DiffEntry[];
  };

  // Sort: changed first (descending diffRatio), then missing, then ok
  const order = (s: DiffEntry['status']) =>
    s === 'changed'
      ? 0
      : s === 'missing-baseline' || s === 'missing-current'
        ? 1
        : 2;
  const sorted = [...summary.results].sort((a, b) => {
    const o = order(a.status) - order(b.status);
    return o !== 0 ? o : b.diffRatio - a.diffRatio;
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Visual Regression Report</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font: 14px/1.5 -apple-system, BlinkMacSystemFont, sans-serif; background: #0e1116; color: #e6edf3; padding: 24px; }
    h1 { margin: 0 0 4px; }
    .summary { color: #8b949e; margin-bottom: 24px; }
    .row { background: #161b22; border: 1px solid #30363d; border-radius: 8px; margin-bottom: 16px; padding: 16px; }
    .row.changed { border-color: #d29922; }
    .row.missing { border-color: #f85149; }
    .row.ok { opacity: 0.5; }
    .row header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 12px; }
    .row h2 { margin: 0; font-size: 16px; }
    .vp { color: #8b949e; font-weight: normal; font-size: 13px; }
    .badge { padding: 2px 8px; border-radius: 12px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
    .badge.ok { background: #1f6feb33; color: #58a6ff; }
    .badge.changed { background: #d2992233; color: #f0b429; }
    .badge.missing { background: #f8514933; color: #ff7b72; }
    .metric { color: #8b949e; margin-left: auto; }
    .grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
    figure { margin: 0; }
    figcaption { font-size: 12px; color: #8b949e; margin-bottom: 4px; }
    img { width: 100%; max-height: 600px; object-fit: contain; background: #0e1116; border: 1px solid #30363d; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Visual Regression Report</h1>
  <p class="summary">
    threshold = ${summary.threshold} •
    ${summary.results.filter((r) => r.status === 'changed').length} changed •
    ${summary.results.filter((r) => r.status.startsWith('missing')).length} missing •
    ${summary.results.filter((r) => r.status === 'ok').length} ok
  </p>
  ${sorted.map(renderRow).join('\n')}
</body>
</html>
`;

  const out = path.join(DIFF_DIR, 'report.html');
  await fs.writeFile(out, html);
  console.log(`[report] wrote ${out}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
