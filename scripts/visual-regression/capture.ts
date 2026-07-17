import {
  chromium,
  type Browser,
  type BrowserContextOptions
} from '@playwright/test';
import { existsSync } from 'node:fs';
import path from 'node:path';
import {
  CaptureCaseFailure,
  runCapture,
  writeCapturePngAtomically
} from './capture-core';
import {
  parseVisualArgs,
  resolveVisualPaths,
  resolveVisualSelection,
  type VisualEnvironment
} from './config';
import {
  MANIFEST,
  VIEWPORTS,
  selectVisualCases,
  type VisualCase
} from './manifest';
import {
  prepareCaptureContext,
  stabilizePage,
  type CaptureRequestGuard,
  type StabilityResult
} from './stability';

const environment = (): VisualEnvironment => ({
  VR_ARTIFACT_DIR: process.env.VR_ARTIFACT_DIR,
  VR_AUTH_DIR: process.env.VR_AUTH_DIR,
  VR_BASELINE_DIR: process.env.VR_BASELINE_DIR,
  VR_BASE_URL: process.env.VR_BASE_URL
});

const captureCommand = (
  argv: readonly string[]
): { command: 'baseline' | 'capture'; flags: string[] } => {
  const [requestedCommand, ...flags] = argv;
  if (requestedCommand !== 'baseline' && requestedCommand !== 'capture') {
    throw new Error(
      'visual capture requires a leading baseline or capture command'
    );
  }
  return { command: requestedCommand, flags };
};

const ensureBaseUrlReachable = async (baseUrl: string): Promise<void> => {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    try {
      const response = await fetch(baseUrl, { redirect: 'manual' });
      if (response.status < 500) return;
    } catch {
      // The compatibility host may still be starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`visual capture host is not reachable at ${baseUrl}`);
};

const contextOptionsFor = (
  visualCase: VisualCase,
  authDir: string
): BrowserContextOptions => {
  const viewport = VIEWPORTS[visualCase.viewport];
  const options: BrowserContextOptions = {
    colorScheme: 'light',
    deviceScaleFactor: viewport.deviceScaleFactor,
    locale: 'en-US',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    timezoneId: 'America/Chicago',
    viewport: { height: viewport.height, width: viewport.width }
  };
  if (visualCase.entry.auth !== 'anonymous') {
    const stateFile = path.join(authDir, `${visualCase.entry.auth}.json`);
    if (!existsSync(stateFile)) {
      throw new Error(
        `missing ${visualCase.entry.auth} auth state; run visual auth setup first`
      );
    }
    options.storageState = stateFile;
  }
  return options;
};

async function main(): Promise<void> {
  const { command, flags } = captureCommand(process.argv.slice(2));
  const args = parseVisualArgs(flags, command);
  const paths = resolveVisualPaths(environment(), process.cwd());
  const selection = resolveVisualSelection(args, MANIFEST, process.cwd());
  const cases = selectVisualCases(MANIFEST, selection);
  const outputDir =
    command === 'baseline' ? paths.baselineDir : paths.currentDir;
  let browser: Browser | undefined;

  const result = await runCapture({
    artifactDir: paths.artifactDir,
    baseUrl: paths.baseUrl,
    browserVersion: () => browser?.version(),
    captureOne: async (visualCase) => {
      if (!browser) throw new Error('capture browser is unavailable');
      const captureBrowser = browser;
      const { entry, viewport } = visualCase;
      const relativeArtifact = `${command === 'baseline' ? 'baseline' : 'current'}/${entry.id}/${viewport}.png`;
      const finalArtifact = path.join(outputDir, entry.id, `${viewport}.png`);
      let context: Awaited<ReturnType<Browser['newContext']>> | undefined;
      let requestGuard: CaptureRequestGuard | undefined;
      let finalUrl: string | undefined;
      let stability: StabilityResult | undefined;
      try {
        await writeCapturePngAtomically(finalArtifact, async (partialPath) => {
          context = await captureBrowser.newContext(
            contextOptionsFor(visualCase, paths.authDir)
          );
          requestGuard = await prepareCaptureContext(context);
          const page = await context.newPage();
          await page.goto(`${paths.baseUrl}${entry.path}`, {
            timeout: 30_000,
            waitUntil: 'domcontentloaded'
          });
          finalUrl = page.url();
          if (new URL(finalUrl).pathname !== entry.path) {
            throw new Error(
              `capture navigation changed pathname from ${entry.path} to ${new URL(finalUrl).pathname}`
            );
          }
          const stabilized = await stabilizePage(page, entry);
          stability = stabilized.result;
          requestGuard.assertNoMutations();
          await page.screenshot({
            animations: 'disabled',
            fullPage: entry.fullPage,
            mask: stabilized.maskLocators,
            path: partialPath,
            type: 'png'
          });
          requestGuard.assertNoMutations();
          await context.close();
          context = undefined;
          requestGuard.assertNoMutations();
        });
        if (!finalUrl || !requestGuard || !stability) {
          throw new Error('capture completed without required diagnostics');
        }
        return {
          artifact: relativeArtifact,
          blockedRequests: requestGuard.diagnostics,
          finalUrl,
          stability
        };
      } catch (error) {
        await context?.close().catch(() => undefined);
        throw new CaptureCaseFailure(error, {
          blockedRequests: requestGuard?.diagnostics ?? [],
          finalUrl,
          stability
        });
      }
    },
    cases,
    cleanup: async () => {
      await browser?.close();
    },
    command,
    prepare: async () => {
      await ensureBaseUrlReachable(paths.baseUrl);
      browser = await chromium.launch({ headless: true });
    },
    selection,
    summaryPath: paths.captureSummary
  });

  if (!result.ok) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
