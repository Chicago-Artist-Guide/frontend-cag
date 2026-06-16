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
  entriesForTarget,
  type RouteEntry
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

function selectEntries(args: Args): RouteEntry[] {
  let entries = args.target ? entriesForTarget(args.target) : MANIFEST;
  if (args.only) {
    const allow = new Set(args.only);
    entries = entries.filter((e) => allow.has(e.name));
  }
  return entries;
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
  entry: RouteEntry
): Promise<BrowserContext> {
  if (entry.auth === 'public') {
    return browser.newContext();
  }
  const stateFile = path.join(AUTH_DIR, `${entry.auth}.json`);
  if (!existsSync(stateFile)) {
    throw new Error(
      `[capture] missing ${stateFile} — run scripts/visual-regression/auth-setup.ts first`
    );
  }
  return browser.newContext({ storageState: stateFile });
}

async function captureEntry(
  browser: Awaited<ReturnType<typeof chromium.launch>>,
  entry: RouteEntry,
  bucket: Args['bucket']
) {
  const context = await contextFor(browser, entry);
  try {
    for (const viewport of entry.viewports ?? [VIEWPORTS.desktop]) {
      const page = await context.newPage();
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height
      });

      const url = `${BASE_URL}${entry.path}`;
      console.log(`[capture] ${entry.name} ${viewport.name} → ${url}`);

      // 'load' instead of 'networkidle' — the app uses Firebase realtime
      // listeners that keep sockets busy, so 'networkidle' never resolves.
      await page.goto(url, { waitUntil: 'load', timeout: 30_000 });
      if (entry.waitFor) {
        await page
          .waitForSelector(entry.waitFor, { timeout: 15_000 })
          .catch(() => {
            console.warn(
              `[capture] waitFor "${entry.waitFor}" did not match for ${entry.name}; continuing`
            );
          });
      }
      // Settle for animations, lazy images, and Firebase data fetches.
      await page.waitForTimeout(1500);

      const outDir = path.join(SNAP_DIR, bucket, entry.name);
      await fs.mkdir(outDir, { recursive: true });
      const file = path.join(outDir, `${viewport.name}.png`);
      await page.screenshot({
        path: file,
        fullPage: entry.fullPage ?? false,
        animations: 'disabled'
      });
      await page.close();
    }
  } finally {
    await context.close();
  }
}

async function main() {
  const args = parseArgs();
  const entries = selectEntries(args);
  if (entries.length === 0) {
    console.warn(
      '[capture] no manifest entries matched filters; nothing to do'
    );
    return;
  }
  await ensureBaseUrlReachable();

  console.log(
    `[capture] bucket=${args.bucket} entries=${entries.map((e) => e.name).join(',')}`
  );

  const browser = await chromium.launch();
  try {
    for (const entry of entries) {
      try {
        await captureEntry(browser, entry, args.bucket);
      } catch (err) {
        console.error(`[capture] FAILED ${entry.name}:`, err);
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
