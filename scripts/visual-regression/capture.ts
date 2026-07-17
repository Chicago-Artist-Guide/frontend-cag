import {
  chromium,
  type Browser,
  type BrowserContextOptions
} from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  loadSelectedAuthStates,
  type ValidatedAuthStorageState
} from './auth-state';
import {
  CaptureCaseFailure,
  ensureBaseUrlReachable,
  runCapture,
  writeCapturePngAtomically
} from './capture-core';
import { type VisualEnvironment } from './config';
import { resolveCaptureInvocation } from './capture-preflight';
import { VIEWPORTS, type VisualCase } from './manifest';
import {
  captureStablePage,
  prepareCaptureContext,
  type CaptureRequestGuard,
  type StabilityResult
} from './stability';

export interface CaptureCommandDependencies {
  launchBrowser(): Promise<Browser>;
}

const productionDependencies: CaptureCommandDependencies = {
  launchBrowser: async () => chromium.launch({ headless: true })
};

type RuntimeContextOptions = Omit<BrowserContextOptions, 'storageState'> & {
  storageState?: ValidatedAuthStorageState;
};

const contextOptionsFor = (
  visualCase: VisualCase,
  authStates: ReadonlyMap<
    Exclude<VisualCase['entry']['auth'], 'anonymous'>,
    ValidatedAuthStorageState
  >
): RuntimeContextOptions => {
  const viewport = VIEWPORTS[visualCase.viewport];
  const options: Omit<BrowserContextOptions, 'storageState'> = {
    colorScheme: 'light',
    deviceScaleFactor: viewport.deviceScaleFactor,
    locale: 'en-US',
    reducedMotion: 'reduce',
    serviceWorkers: 'block',
    timezoneId: 'America/Chicago',
    viewport: { height: viewport.height, width: viewport.width }
  };
  if (visualCase.entry.auth !== 'anonymous') {
    const storageState = authStates.get(visualCase.entry.auth);
    if (!storageState) {
      throw new Error(
        `missing ${visualCase.entry.auth} auth state; run visual auth setup first`
      );
    }
    return { ...options, storageState };
  }
  return options;
};

export async function runCaptureCommand(
  argv: readonly string[],
  environment: VisualEnvironment,
  cwd: string,
  dependencies: CaptureCommandDependencies = productionDependencies
): Promise<0 | 1> {
  const invocation = await resolveCaptureInvocation(argv, environment, cwd);
  if (!invocation) return 1;
  const { cases, command, paths, selection } = invocation;
  const outputDir =
    command === 'baseline' ? paths.baselineDir : paths.currentDir;
  const expectedOrigin = new URL(paths.baseUrl).origin;
  let browser: Browser | undefined;
  let authStates = new Map<
    Exclude<VisualCase['entry']['auth'], 'anonymous'>,
    ValidatedAuthStorageState
  >();

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
        await writeCapturePngAtomically(
          finalArtifact,
          outputDir,
          async (partialPath) => {
            context = await captureBrowser.newContext(
              contextOptionsFor(visualCase, authStates) as BrowserContextOptions
            );
            requestGuard = await prepareCaptureContext(context);
            const page = await context.newPage();
            await page.goto(`${paths.baseUrl}${entry.path}`, {
              timeout: 30_000,
              waitUntil: 'domcontentloaded'
            });
            const captured = await captureStablePage(
              page,
              entry,
              requestGuard,
              partialPath,
              15_000,
              expectedOrigin
            );
            finalUrl = captured.finalUrl;
            stability = captured.stability;
            await context.close();
            context = undefined;
            requestGuard.assertNoMutations();
          }
        );
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
      authStates = await loadSelectedAuthStates(
        cases,
        paths.authDir,
        paths.baseUrl
      );
      await ensureBaseUrlReachable(paths.baseUrl);
      browser = await dependencies.launchBrowser();
    },
    selection,
    summaryPath: paths.captureSummary
  });

  return result.ok ? 0 : 1;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  void runCaptureCommand(process.argv.slice(2), process.env, process.cwd())
    .then((code) => {
      process.exitCode = code;
    })
    .catch(() => {
      process.exitCode = 1;
    });
}
