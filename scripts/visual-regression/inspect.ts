/**
 * Diagnostic: load a regressed page, walk the DOM, and report element bounding
 * boxes / computed styles for elements that we know got migrated. Writes the
 * report to /tmp/inspect-<route>.json so we can compare against expectations.
 *
 * Usage:
 *   npx tsx scripts/visual-regression/inspect.ts <route> <selector1> [selector2 ...]
 */

import { chromium } from '@playwright/test';

const BASE_URL = process.env.VR_BASE_URL ?? 'http://localhost:3000';

async function main() {
  const [, , route, ...selectors] = process.argv;
  if (!route || selectors.length === 0) {
    throw new Error('usage: inspect.ts <route> <selector...>');
  }
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${BASE_URL}${route}`, { waitUntil: 'load' });
  await page.waitForTimeout(2000);

  const result = await page.evaluate((sels) => {
    const out: Record<string, unknown[]> = {};
    for (const sel of sels) {
      const els = Array.from(document.querySelectorAll(sel));
      out[sel] = els.map((el) => {
        const r = (el as HTMLElement).getBoundingClientRect();
        const cs = getComputedStyle(el as HTMLElement);
        return {
          rect: { x: r.x, y: r.y, w: r.width, h: r.height },
          margin: `${cs.marginTop} ${cs.marginRight} ${cs.marginBottom} ${cs.marginLeft}`,
          padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
          display: cs.display,
          fontSize: cs.fontSize,
          gap: cs.gap,
          className: (el as HTMLElement).className
        };
      });
    }
    return {
      docHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.scrollHeight,
      ...out
    };
  }, selectors);

  console.log(JSON.stringify(result, null, 2));
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
