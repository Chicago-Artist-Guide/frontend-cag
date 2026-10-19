/* eslint-env node */
import { resolve4 } from 'node:dns/promises';
import { chromium, expect } from '@playwright/test';
import { resolveProductionBrowserOrigin } from './production-config.mjs';

const origin = resolveProductionBrowserOrigin(process.env);
const hostname = process.env.ALB_DNS || '';
const [address] = await resolve4(hostname);
if (!address) throw new Error('The production ALB has no IPv4 address');

const browser = await chromium.launch({
  args: [
    '--no-proxy-server',
    `--host-resolver-rules=MAP ${origin.hostname} ${address}`
  ]
});
try {
  const context = await browser.newContext({ baseURL: origin.origin });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('/home', { waitUntil: 'domcontentloaded' });
  if (!response?.ok()) throw new Error('The production home page failed');
  const remote = await response.serverAddr();
  if (remote?.ipAddress.replace(/^::ffff:/, '') !== address) {
    throw new Error('Browser traffic did not reach the new production ALB');
  }
  await expect(
    page.getByRole('heading', { name: /Discover your next\s+dream gig/i })
  ).toBeVisible({ timeout: 30000 });
  await expect(page.locator('#cag-frontend-app')).toHaveCount(1);
  await expect(page.getByRole('img', { name: 'CAG Logo' })).toHaveCount(1);

  await page.getByRole('link', { exact: true, name: 'LOGIN' }).click();
  await expect(page).toHaveURL((url) => url.pathname === '/login');
  await expect(
    page.getByRole('heading', { exact: true, name: 'WELCOME BACK' })
  ).toBeVisible();
  await expect(page.locator('#cag-frontend-app')).toHaveCount(1);

  await page.getByRole('link', { exact: true, name: 'HOME' }).first().click();
  await expect(page).toHaveURL((url) => url.pathname === '/home');
  await expect(
    page.getByRole('heading', { name: /Discover your next\s+dream gig/i })
  ).toBeVisible();
  expect(errors).toEqual([]);
  console.log(
    `Production browser navigation passed through ${hostname} (${address}) over ${origin.protocol === 'https:' ? 'HTTPS with normal TLS validation' : 'HTTP before cutover'}.`
  );
} finally {
  await browser.close();
}
