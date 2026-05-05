import { chromium } from '@playwright/test';
async function main() {
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('http://localhost:3000/theatre-resources', {
    waitUntil: 'load'
  });
  await page.waitForTimeout(1500);
  const probe = await page.evaluate(() => {
    const t = document.querySelector('table');
    if (!t) return null;
    const cs = getComputedStyle(t as Element);
    return {
      className: (t as HTMLElement).className,
      fontSize: cs.fontSize,
      marginBottom: cs.marginBottom,
      marginTop: cs.marginTop,
      display: cs.display
    };
  });
  console.log(JSON.stringify(probe, null, 2));
  await browser.close();
}
main().catch((e) => {
  console.error(e);
  process.exit(1);
});
