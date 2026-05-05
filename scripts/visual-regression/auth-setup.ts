/**
 * One-time auth setup. Logs in for each non-public auth state defined in
 * the manifest and persists Playwright storageState to
 * scripts/visual-regression/.auth/<state>.json (gitignored).
 *
 * Credentials come from environment variables to avoid committing secrets:
 *   VR_COMPANY_EMAIL
 *   VR_COMPANY_PASSWORD
 *
 * Usage: npx tsx scripts/visual-regression/auth-setup.ts
 */

import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs/promises';

const BASE_URL = process.env.VR_BASE_URL ?? 'http://localhost:3000';
const AUTH_DIR = path.resolve(process.cwd(), 'scripts/visual-regression/.auth');

type AuthFlow = {
  state: string;
  email: string | undefined;
  password: string | undefined;
};

const FLOWS: AuthFlow[] = [
  {
    state: 'company',
    email: process.env.VR_COMPANY_EMAIL,
    password: process.env.VR_COMPANY_PASSWORD
  }
];

async function loginAndSave(flow: AuthFlow) {
  if (!flow.email || !flow.password) {
    console.warn(
      `[auth-setup] skipping "${flow.state}" — missing VR_${flow.state.toUpperCase()}_EMAIL/PASSWORD`
    );
    return false;
  }
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log(`[auth-setup] logging in for state="${flow.state}"`);
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });

  // The login form fields use email/password types — resilient selectors.
  await page.fill('input[type="email"]', flow.email);
  await page.fill('input[type="password"]', flow.password);
  // The login button is a custom <Button text="LOG IN" type="button" /> so we
  // can't use type=submit; match by accessible name instead.
  await page.getByRole('button', { name: /log in/i }).click();

  // Auth success = redirect away from /login. Wait up to 15s.
  await page
    .waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 15_000
    })
    .catch(async () => {
      const errorText = await page
        .locator('body')
        .innerText()
        .catch(() => '');
      throw new Error(
        `[auth-setup] login redirect did not happen for "${flow.state}". Page text:\n${errorText.slice(0, 500)}`
      );
    });

  await fs.mkdir(AUTH_DIR, { recursive: true });
  const file = path.join(AUTH_DIR, `${flow.state}.json`);
  await context.storageState({ path: file });
  console.log(`[auth-setup] saved ${file}`);

  await browser.close();
  return true;
}

async function main() {
  let any = false;
  for (const flow of FLOWS) {
    const ok = await loginAndSave(flow);
    any = any || ok;
  }
  if (!any) {
    console.error(
      '[auth-setup] no auth flows ran. Set VR_COMPANY_EMAIL/VR_COMPANY_PASSWORD in .env.local and re-run.'
    );
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
