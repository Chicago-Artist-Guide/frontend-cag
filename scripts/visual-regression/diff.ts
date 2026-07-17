/**
 * Diffs two snapshot buckets (typically baseline vs current) and emits
 * per-route diff PNGs plus a summary JSON. Returns exit 1 if any route
 * exceeds the pixel-delta threshold so CI/agent loops can branch on it.
 *
 * Usage:
 *   npx tsx scripts/visual-regression/diff.ts \
 *     [--target=src/components/Home] \
 *     [--threshold=0.1]   # max fraction of pixels different (0.0–1.0)
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import { MANIFEST, selectVisualCases } from './manifest';

const SNAP_DIR = path.resolve(
  process.cwd(),
  'scripts/visual-regression/snapshots'
);
const BASELINE_DIR = path.join(SNAP_DIR, 'baseline');
const CURRENT_DIR = path.join(SNAP_DIR, 'current');
const DIFF_DIR = path.join(SNAP_DIR, 'diff');

type Args = {
  target?: string;
  threshold: number;
};

function parseArgs(): Args {
  const args: Args = { threshold: 0.001 }; // 0.1% pixel delta default
  for (const arg of process.argv.slice(2)) {
    const [k, v] = arg.replace(/^--/, '').split('=');
    if (k === 'target') args.target = v;
    else if (k === 'threshold') args.threshold = Number(v);
  }
  return args;
}

export type DiffEntry = {
  route: string;
  viewport: string;
  status: 'ok' | 'changed' | 'missing-baseline' | 'missing-current';
  totalPixels: number;
  diffPixels: number;
  diffRatio: number;
  baselinePath: string;
  currentPath: string;
  diffPath: string;
};

async function loadPng(file: string): Promise<PNG | null> {
  if (!existsSync(file)) return null;
  const buf = await fs.readFile(file);
  return PNG.sync.read(buf);
}

async function diffPair(
  routeName: string,
  viewportName: string
): Promise<DiffEntry> {
  const rel = path.join(routeName, `${viewportName}.png`);
  const baselinePath = path.join(BASELINE_DIR, rel);
  const currentPath = path.join(CURRENT_DIR, rel);
  const diffPath = path.join(DIFF_DIR, rel);

  const baseline = await loadPng(baselinePath);
  const current = await loadPng(currentPath);

  if (!baseline) {
    return {
      route: routeName,
      viewport: viewportName,
      status: 'missing-baseline',
      totalPixels: 0,
      diffPixels: 0,
      diffRatio: 0,
      baselinePath,
      currentPath,
      diffPath
    };
  }
  if (!current) {
    return {
      route: routeName,
      viewport: viewportName,
      status: 'missing-current',
      totalPixels: 0,
      diffPixels: 0,
      diffRatio: 0,
      baselinePath,
      currentPath,
      diffPath
    };
  }

  // Pad both to the larger size so pages of different heights still diff
  // cleanly (full-page captures of growing pages are common).
  const width = Math.max(baseline.width, current.width);
  const height = Math.max(baseline.height, current.height);
  const a = padTo(baseline, width, height);
  const b = padTo(current, width, height);
  const out = new PNG({ width, height });

  const diffPixels = pixelmatch(a.data, b.data, out.data, width, height, {
    threshold: 0.1, // per-pixel sensitivity (anti-aliasing tolerant)
    includeAA: false
  });
  const totalPixels = width * height;
  const diffRatio = diffPixels / totalPixels;

  await fs.mkdir(path.dirname(diffPath), { recursive: true });
  await fs.writeFile(diffPath, PNG.sync.write(out));

  return {
    route: routeName,
    viewport: viewportName,
    status: diffPixels === 0 ? 'ok' : 'changed',
    totalPixels,
    diffPixels,
    diffRatio,
    baselinePath,
    currentPath,
    diffPath
  };
}

function padTo(src: PNG, width: number, height: number): PNG {
  if (src.width === width && src.height === height) return src;
  const dst = new PNG({ width, height });
  // Initialize to transparent
  dst.data.fill(0);
  // Copy src into top-left corner row-by-row.
  for (let y = 0; y < src.height; y++) {
    const srcStart = y * src.width * 4;
    const srcEnd = srcStart + src.width * 4;
    const dstStart = y * width * 4;
    src.data.copy(dst.data, dstStart, srcStart, srcEnd);
  }
  return dst;
}

async function main() {
  const args = parseArgs();
  const cases = selectVisualCases(MANIFEST, { target: args.target });

  const results: DiffEntry[] = [];
  await fs.mkdir(DIFF_DIR, { recursive: true });

  for (const { entry, viewport } of cases) {
    const result = await diffPair(entry.id, viewport);
    results.push(result);
    const pct = (result.diffRatio * 100).toFixed(3);
    const tag =
      result.status === 'ok'
        ? '✓'
        : result.status === 'changed'
          ? result.diffRatio > args.threshold
            ? '✗'
            : '~'
          : '?';
    console.log(
      `[diff] ${tag} ${result.route} ${result.viewport}: ${result.status} (${result.diffPixels}px, ${pct}%)`
    );
  }

  await fs.writeFile(
    path.join(DIFF_DIR, 'summary.json'),
    JSON.stringify({ threshold: args.threshold, results }, null, 2)
  );

  const failures = results.filter(
    (r) =>
      r.status === 'missing-baseline' ||
      r.status === 'missing-current' ||
      (r.status === 'changed' && r.diffRatio > args.threshold)
  );
  if (failures.length > 0) {
    console.error(
      `\n[diff] ${failures.length} route(s) exceeded threshold ${args.threshold}. See scripts/visual-regression/snapshots/diff/.`
    );
    process.exit(1);
  }
  console.log('\n[diff] all routes within threshold');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
