/**
 * Probe what Tailwind classes actually compute to in this app's CSS context.
 */
import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/faq', { waitUntil: 'load' });
  await page.waitForTimeout(1500);

  const probe = await page.evaluate(() => {
    const test = document.createElement('div');
    test.className = 'mt-4 mb-8';
    test.style.position = 'absolute';
    test.style.visibility = 'hidden';
    (document.getElementById('root') ?? document.body).appendChild(test);
    const cs = getComputedStyle(test);
    const out = {
      htmlFontSize: getComputedStyle(document.documentElement).fontSize,
      bodyFontSize: getComputedStyle(document.body).fontSize,
      mt4: cs.marginTop,
      mb8: cs.marginBottom
    };
    test.remove();
    return out;
  });
  console.log(JSON.stringify(probe, null, 2));
  await browser.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
