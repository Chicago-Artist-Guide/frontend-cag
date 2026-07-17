import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseVisualArgs, resolveSafeVisualPaths } from './config';
import {
  validateDiffSummary,
  type DiffIssue,
  type DiffResult,
  type DiffSummaryV1
} from './diff-core';

const CSP =
  "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; object-src 'none'; connect-src 'none'; base-uri 'none'; form-action 'none'";

const escapeHtml = (value: unknown): string =>
  String(value)
    .replace(/&/gu, '&amp;')
    .replace(/</gu, '&lt;')
    .replace(/>/gu, '&gt;')
    .replace(/"/gu, '&quot;')
    .replace(/'/gu, '&#39;');

const codePointCompare = (left: string, right: string): number => {
  const leftPoints = Array.from(
    left,
    (character) => character.codePointAt(0) ?? 0
  );
  const rightPoints = Array.from(
    right,
    (character) => character.codePointAt(0) ?? 0
  );
  const length = Math.max(leftPoints.length, rightPoints.length);
  for (let index = 0; index < length; index += 1) {
    const difference =
      (leftPoints[index] ?? Number.NEGATIVE_INFINITY) -
      (rightPoints[index] ?? Number.NEGATIVE_INFINITY);
    if (difference !== 0) return difference;
  }
  return 0;
};

const issueKey = (issues: readonly DiffIssue[]): string =>
  issues
    .map(({ code }) => code)
    .sort(codePointCompare)
    .join('\0');

const viewGroup = (result: DiffResult): number => {
  if (result.gateVerdict === 'fail') return 0;
  if (result.gateVerdict === 'not-enforced') return 1;
  if (result.comparison === 'changed') return 2;
  return 3;
};

const viewportOrder = (viewport: string): number =>
  viewport === 'desktop' ? 0 : viewport === 'mobile' ? 1 : 2;

const sortedView = (results: readonly DiffResult[]): DiffResult[] =>
  [...results].sort((left, right) => {
    const group = viewGroup(left) - viewGroup(right);
    if (group !== 0) return group;
    const issues = codePointCompare(
      issueKey(left.issues),
      issueKey(right.issues)
    );
    if (issues !== 0) return issues;
    const leftRatio = left.ratio ?? Number.NEGATIVE_INFINITY;
    const rightRatio = right.ratio ?? Number.NEGATIVE_INFINITY;
    if (leftRatio !== rightRatio) return rightRatio - leftRatio;
    const id = codePointCompare(left.id, right.id);
    if (id !== 0) return id;
    return viewportOrder(left.viewport) - viewportOrder(right.viewport);
  });

const imageOrPlaceholder = (
  label: string,
  asset: string | undefined,
  evidence: string
): string => {
  const body = asset
    ? `<img alt="${escapeHtml(label)}" loading="lazy" src="${escapeHtml(asset)}" />`
    : `<div class="placeholder">asset unavailable (${escapeHtml(evidence)})</div>`;
  return `<figure><figcaption>${escapeHtml(label)}</figcaption>${body}</figure>`;
};

const renderResult = (result: DiffResult): string => {
  const changedUnderThreshold =
    result.comparison === 'changed' && result.gateVerdict === 'pass';
  const classes = [
    'row',
    `gate-${result.gateVerdict}`,
    changedUnderThreshold ? 'changed-under-threshold' : ''
  ]
    .filter(Boolean)
    .join(' ');
  const ratio =
    result.ratio === null
      ? 'not available'
      : `${(result.ratio * 100).toFixed(6)}%`;
  const issues =
    result.issues.length === 0
      ? '<li>none</li>'
      : result.issues
          .map(
            ({ code, message, scope }) =>
              `<li><code>${escapeHtml(code)}</code> [${escapeHtml(scope)}] ${escapeHtml(message)}</li>`
          )
          .join('');
  return `<section class="${escapeHtml(classes)}" data-id="${escapeHtml(result.id)}">
  <header><h2>${escapeHtml(result.id)} <span>${escapeHtml(result.viewport)}</span></h2><strong>${escapeHtml(result.gateVerdict)}</strong></header>
  <p><code>${escapeHtml(result.path)}</code> · ${escapeHtml(result.comparison)} · ${escapeHtml(String(result.diffPixels))} pixels · ${escapeHtml(ratio)}</p>
  <ul>${issues}</ul>
  <div class="grid">
    ${imageOrPlaceholder('baseline', result.baselineAsset, result.baselineEvidence)}
    ${imageOrPlaceholder('current', result.currentAsset, result.currentEvidence)}
    ${imageOrPlaceholder('diff', result.diffAsset, result.comparison)}
  </div>
</section>`;
};

export function renderReport(summary: DiffSummaryV1): string {
  const results = sortedView(summary.results);
  const runErrors = summary.runErrors
    .map(
      ({ message, name, phase }) =>
        `<li><code>${escapeHtml(phase)}</code> ${escapeHtml(name)}: ${escapeHtml(message)}</li>`
    )
    .join('');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta http-equiv="Content-Security-Policy" content="${escapeHtml(CSP)}" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Visual Regression Report</title>
  <style>
    * { box-sizing: border-box; }
    body { background: #0e1116; color: #e6edf3; font: 14px/1.5 system-ui, sans-serif; margin: 0; padding: 24px; }
    .summary, figcaption, header span { color: #8b949e; }
    .row { background: #161b22; border: 2px solid #30363d; border-radius: 8px; margin: 16px 0; padding: 16px; }
    .gate-fail { border-color: #f85149; }
    .gate-not-enforced { border-color: #d29922; }
    .changed-under-threshold { border-style: dashed; border-color: #58a6ff; }
    header { align-items: baseline; display: flex; gap: 12px; justify-content: space-between; }
    h1, h2 { margin-top: 0; }
    .grid { display: grid; gap: 12px; grid-template-columns: repeat(3, minmax(0, 1fr)); }
    figure { margin: 0; }
    img { background: #0e1116; border: 1px solid #30363d; max-height: 600px; object-fit: contain; width: 100%; }
    .placeholder { align-items: center; border: 1px dashed #8b949e; display: flex; justify-content: center; min-height: 120px; }
    code { overflow-wrap: anywhere; }
  </style>
</head>
<body>
  <h1>Visual Regression Report</h1>
  <p class="summary">gate ${escapeHtml(summary.gateVerdict)} · threshold ${escapeHtml(String(summary.maxDiffRatio))} · selected ${escapeHtml(String(summary.totals.selected))} · failed ${escapeHtml(String(summary.totals.failed))} · informational ${escapeHtml(String(summary.totals.notEnforced))}</p>
  ${runErrors ? `<aside><h2>Run errors</h2><ul>${runErrors}</ul></aside>` : ''}
  ${results.map(renderResult).join('\n')}
</body>
</html>
`;
}

const writeReportAtomically = async (
  file: string,
  html: string
): Promise<void> => {
  await mkdir(path.dirname(file), { recursive: true });
  const partial = path.join(
    path.dirname(file),
    `.${path.basename(file)}.${process.pid}.partial`
  );
  try {
    await writeFile(partial, html, 'utf8');
    await rename(partial, file);
  } finally {
    await rm(partial, { force: true });
  }
};

export async function runReport(
  summaryFile: string,
  reportFile: string
): Promise<0 | 1> {
  try {
    const summary = validateDiffSummary(
      JSON.parse(await readFile(summaryFile, 'utf8'))
    );
    await writeReportAtomically(reportFile, renderReport(summary));
    return 0;
  } catch {
    await rm(reportFile, { force: true });
    return 1;
  }
}

async function main(): Promise<void> {
  parseVisualArgs(process.argv.slice(2), 'report');
  const paths = resolveSafeVisualPaths(process.env, process.cwd());
  process.exitCode = await runReport(paths.summaryFile, paths.reportFile);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  void main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
