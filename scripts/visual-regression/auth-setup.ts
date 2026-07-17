import { chromium } from '@playwright/test';
import { randomUUID } from 'node:crypto';
import {
  chmod,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile
} from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { validateAuthStorageState } from './auth-state';
import { resolveVisualPaths, type VisualEnvironment } from './config';
import { prepareCaptureContext } from './stability';

export interface AuthSetupPage {
  close(): Promise<void>;
  fill(selector: string, value: string): Promise<void>;
  getByRole(
    role: 'button',
    options: { name: RegExp }
  ): { click(): Promise<unknown> };
  goto(
    url: string,
    options: { waitUntil: 'domcontentloaded' }
  ): Promise<unknown>;
  locator(selector: string): {
    waitFor(options: { state: 'visible' }): Promise<void>;
  };
  url(): string;
  waitForURL(
    matcher: (url: URL) => boolean,
    options: { timeout: number }
  ): Promise<void>;
}

export interface AuthSetupContext {
  close(): Promise<void>;
  newPage(): Promise<AuthSetupPage>;
  storageState(options: { indexedDB: true; path: string }): Promise<unknown>;
}

export interface AuthSetupBrowser {
  close(): Promise<void>;
  newContext(): Promise<AuthSetupContext>;
}

interface MutationGuard {
  assertNoMutations(): void;
}

export interface AuthSetupDependencies {
  launchBrowser(): Promise<AuthSetupBrowser>;
  prepareContext(context: AuthSetupContext): Promise<MutationGuard>;
}

export interface AuthSetupEnvironment extends VisualEnvironment {
  VR_COMPANY_EMAIL?: string;
  VR_COMPANY_PASSWORD?: string;
}

const productionDependencies: AuthSetupDependencies = {
  launchBrowser: async () => chromium.launch({ headless: true }),
  prepareContext: async (context) =>
    prepareCaptureContext(
      context as Parameters<typeof prepareCaptureContext>[0]
    )
};

const exactProfileUrl = (raw: string, expectedOrigin: string): boolean => {
  try {
    const url = new URL(raw);
    return (
      url.origin === expectedOrigin &&
      url.pathname === '/profile' &&
      url.search.length === 0 &&
      url.hash.length === 0
    );
  } catch {
    return false;
  }
};

export async function runAuthSetupCommand(
  argv: readonly string[],
  environment: AuthSetupEnvironment,
  cwd: string,
  dependencies: AuthSetupDependencies = productionDependencies
): Promise<0 | 1> {
  if (argv.length !== 0) return 1;
  const email = environment.VR_COMPANY_EMAIL;
  const password = environment.VR_COMPANY_PASSWORD;
  if (!email || !password) return 1;

  let paths;
  try {
    paths = resolveVisualPaths(environment, cwd);
  } catch {
    return 1;
  }
  const expectedOrigin = new URL(paths.baseUrl).origin;
  const finalPath = path.join(paths.authDir, 'company.json');
  const partialPath = path.join(
    paths.authDir,
    `.company.json.${process.pid}.${randomUUID()}.partial`
  );
  let browser: AuthSetupBrowser | undefined;
  let context: AuthSetupContext | undefined;
  let page: AuthSetupPage | undefined;

  try {
    await mkdir(paths.authDir, { mode: 0o700, recursive: true });
    await chmod(paths.authDir, 0o700);
    await writeFile(partialPath, '', { flag: 'wx', mode: 0o600 });
    browser = await dependencies.launchBrowser();
    context = await browser.newContext();
    const guard = await dependencies.prepareContext(context);
    page = await context.newPage();
    await page.goto(`${paths.baseUrl}/login`, {
      waitUntil: 'domcontentloaded'
    });
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.getByRole('button', { name: /log in/i }).click();
    await page.waitForURL((url) => exactProfileUrl(url.href, expectedOrigin), {
      timeout: 15_000
    });
    if (!exactProfileUrl(page.url(), expectedOrigin)) {
      throw new Error('company login did not settle on the expected profile');
    }
    await page.locator('text="YOUR PROFILE"').waitFor({ state: 'visible' });
    await page.locator('text="Basic Group Info"').waitFor({ state: 'visible' });
    guard.assertNoMutations();
    await context.storageState({ indexedDB: true, path: partialPath });
    const parsed = JSON.parse(await readFile(partialPath, 'utf8')) as unknown;
    validateAuthStorageState(parsed, expectedOrigin);
    await chmod(partialPath, 0o600);
    guard.assertNoMutations();
    await rename(partialPath, finalPath);
    await chmod(finalPath, 0o600);
    return 0;
  } catch {
    return 1;
  } finally {
    await page?.close().catch(() => undefined);
    await context?.close().catch(() => undefined);
    await browser?.close().catch(() => undefined);
    await rm(partialPath, { force: true });
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  void runAuthSetupCommand(process.argv.slice(2), process.env, process.cwd())
    .then((code) => {
      process.exitCode = code;
    })
    .catch(() => {
      process.exitCode = 1;
    });
}
