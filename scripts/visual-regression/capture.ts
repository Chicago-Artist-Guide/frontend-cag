/**
 * Captures screenshots for routes in the manifest.
 *
 * Usage:
 *   npx tsx scripts/visual-regression/capture.ts \
 *     --bucket=baseline \
 *     [--target=src/components/Home] \
 *     [--only=home,faq]
 *
 * Bucket determines the output directory:
 *   - baseline → scripts/visual-regression/snapshots/baseline
 *   - current  → scripts/visual-regression/snapshots/current
 *
 * Target filters the manifest to only routes touched by that source path.
 * Only filters by route name (comma-separated).
 *
 * Assumes:
 *   - dev server already running at VR_BASE_URL (default http://localhost:3000)
 *   - For auth states, scripts/visual-regression/.auth/<state>.json exists
 *     (run auth-setup.ts first).
 */

import { chromium, type BrowserContext } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import {
  MANIFEST,
  VIEWPORTS,
  selectVisualCases,
  type VisualCase
} from './manifest';

const BASE_URL = process.env.VR_BASE_URL ?? 'http://localhost:3000';
const AUTH_DIR = path.resolve(process.cwd(), 'scripts/visual-regression/.auth');
const SNAP_DIR = path.resolve(
  process.cwd(),
  'scripts/visual-regression/snapshots'
);

type Args = {
  bucket: 'baseline' | 'current';
  target?: string;
  only?: string[];
};

function parseArgs(): Args {
  const args: Partial<Args> = {};
  for (const arg of process.argv.slice(2)) {
    const [k, v] = arg.replace(/^--/, '').split('=');
    if (k === 'bucket') args.bucket = v as Args['bucket'];
    else if (k === 'target') args.target = v;
    else if (k === 'only') args.only = v.split(',').map((s) => s.trim());
  }
  if (args.bucket !== 'baseline' && args.bucket !== 'current') {
    throw new Error('--bucket=baseline|current is required');
  }
  return args as Args;
}

async function ensureBaseUrlReachable(): Promise<void> {
  for (let i = 0; i < 20; i++) {
    try {
      const res = await fetch(BASE_URL, { redirect: 'manual' });
      if (res.status < 500) return;
    } catch {
      /* not yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(
    `[capture] dev server not reachable at ${BASE_URL}. Run 'npm run start' first.`
  );
}

async function contextFor(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  visualCase: VisualCase
): Promise<BrowserContext> {
  const viewport = VIEWPORTS[visualCase.viewport];
  const contextOptions = {
    deviceScaleFactor: viewport.deviceScaleFactor,
    viewport: { height: viewport.height, width: viewport.width }
  };
  if (visualCase.entry.auth === 'anonymous') {
    return browser.newContext(contextOptions);
  }
  const stateFile = path.join(AUTH_DIR, `${visualCase.entry.auth}.json`);
  if (!existsSync(stateFile)) {
    throw new Error(
      `[capture] missing ${stateFile} — run scripts/visual-regression/auth-setup.ts first`
    );
  }
  return browser.newContext({ ...contextOptions, storageState: stateFile });
}

async function captureCase(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  visualCase: VisualCase,
  bucket: Args['bucket']
) {
  const { entry, viewport: viewportName } = visualCase;
  const context = await contextFor(browser, visualCase);
  try {
    const page = await context.newPage();

    const url = `${BASE_URL}${entry.path}`;
    console.log(`[capture] ${entry.id} ${viewportName} → ${url}`);

    // 'load' instead of 'networkidle' — the app uses Firebase realtime
    // listeners that keep sockets busy, so 'networkidle' never resolves.
    await page.goto(url, { waitUntil: 'load', timeout: 30_000 });
    for (const selector of entry.readiness.visible) {
      await page.waitForSelector(selector, { timeout: 15_000 }).catch(() => {
        console.warn(
          `[capture] visible readiness "${selector}" did not match for ${entry.id}; continuing`
        );
      });
    }
    for (const selector of entry.readiness.hidden ?? []) {
      await page
        .waitForSelector(selector, { state: 'hidden', timeout: 15_000 })
        .catch(() => {
          console.warn(
            `[capture] hidden readiness "${selector}" did not settle for ${entry.id}; continuing`
          );
        });
    }
    // Settle for animations, lazy images, and Firebase data fetches.
    await page.waitForTimeout(1500);

    const outDir = path.join(SNAP_DIR, bucket, entry.id);
    await fs.mkdir(outDir, { recursive: true });
    const file = path.join(outDir, `${viewportName}.png`);
    await page.screenshot({
      path: file,
      fullPage: entry.fullPage,
      animations: 'disabled'
    });
    await page.close();
  } finally {
    await context.close();
  }
}

async function main() {
  const args = parseArgs();
  const cases = selectVisualCases(MANIFEST, {
    ids: args.only,
    target: args.target
  });
  await ensureBaseUrlReachable();

  console.log(
    `[capture] bucket=${args.bucket} cases=${cases.map(({ entry, viewport }) => `${entry.id}:${viewport}`).join(',')}`
  );

  const browser = await chromium.launch();
  try {
    for (const visualCase of cases) {
      try {
        await captureCase(browser, visualCase, args.bucket);
      } catch (err) {
        console.error(
          `[capture] FAILED ${visualCase.entry.id}:${visualCase.viewport}:`,
          err
        );
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
