/**
 * Captures a structural DOM snapshot for diff: every element's tag, class,
 * and bounding box at viewport=1440x900. Output is JSON, comparable line-by-line
 * with `diff` after capturing two states.
 */

import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';

const BASE_URL = process.env.VR_BASE_URL ?? 'http://localhost:3000';

async function main() {
  const [, , route, outFile] = process.argv;
  if (!route || !outFile)
    throw new Error('usage: dom-snapshot.ts <route> <outFile>');

  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  const tree = await page.evaluate(() => {
    const out: Array<{
      tag: string;
      cls: string;
      y: number;
      h: number;
      mt: string;
      mb: string;
      pt: string;
      pb: string;
    }> = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_ELEMENT
    );
    let node = walker.nextNode() as HTMLElement | null;
    while (node) {
      const r = node.getBoundingClientRect();
      if (r.height > 0) {
        const cs = getComputedStyle(node);
        out.push({
          tag: node.tagName.toLowerCase(),
          cls: node.className?.toString().slice(0, 80) ?? '',
          y: Math.round(r.y),
          h: Math.round(r.height),
          mt: cs.marginTop,
          mb: cs.marginBottom,
          pt: cs.paddingTop,
          pb: cs.paddingBottom
        });
      }
      node = walker.nextNode() as HTMLElement | null;
    }
    return out;
  });

  await fs.writeFile(path.resolve(outFile), JSON.stringify(tree, null, 2));
  console.log(`wrote ${tree.length} elements to ${outFile}`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
