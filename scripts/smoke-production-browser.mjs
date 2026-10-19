/* eslint-env node */
import { resolve4 } from 'node:dns/promises';
import { chromium, expect } from '@playwright/test';
import { validateHttpsOrigin } from './production-config.mjs';

const origin = validateHttpsOrigin(process.env.NEXT_PUBLIC_SITE_URL);
const hostname = process.env.ALB_DNS || '';
if (
  !/^[a-z0-9][a-z0-9-]*\.[a-z]{2}(?:-[a-z0-9]+)+-\d+\.elb\.amazonaws\.com$/i.test(
    hostname
  )
) {
  throw new Error('ALB_DNS must be an AWS ALB hostname');
}
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
    `Production browser navigation passed through ${hostname} (${address}) with normal TLS validation.`
  );
} finally {
  await browser.close();
}
