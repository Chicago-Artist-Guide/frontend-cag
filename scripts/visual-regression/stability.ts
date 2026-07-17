import type {
  BrowserContext,
  Locator,
  Page,
  Request,
  Route
} from '@playwright/test';
import type { RouteEntry } from './manifest';

export type CaptureRequestDisposition =
  | 'allow'
  | 'mutation-block'
  | 'silent-block';

export interface CaptureRequestInput {
  method: string;
  url: string;
}

export interface RequestDiagnostic {
  disposition: Exclude<CaptureRequestDisposition, 'allow'>;
  method: string;
  url: string;
}

export interface CaptureRequestGuard {
  assertNoMutations(): void;
  diagnostics: RequestDiagnostic[];
}

export interface StabilityResult {
  durationMs: number;
  fonts: Array<{
    family: string;
    status: FontFaceLoadStatus;
    style: string;
    weight: string;
  }>;
  frames: Array<{ crossOrigin: boolean; src: string; visible: boolean }>;
  images: {
    checked: number;
    exemptedBroken: Array<{
      reason: string;
      selector: string;
      url: string;
    }>;
  };
  intervalsCleared: number;
  masks: Array<{
    matchCount: number;
    reason: string;
    selector: string;
    visibleCount: number;
  }>;
}

export interface StabilizedPage {
  maskLocators: Locator[];
  result: StabilityResult;
}

export interface StabilityOptions {
  timeoutMs?: number;
}

const withTimeout = async <T>(
  operation: Promise<T>,
  timeoutMs: number,
  problem: string
): Promise<T> => {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(problem)), timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const NON_IDEMPOTENT_METHODS = new Set(['DELETE', 'PATCH', 'POST', 'PUT']);

const sanitizeUrl = (raw: string): string => {
  try {
    const url = new URL(raw);
    url.username = '';
    url.password = '';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return '<invalid-url>';
  }
};

export function classifyCaptureRequest({
  method,
  url
}: CaptureRequestInput): CaptureRequestDisposition {
  const normalizedMethod = method.toUpperCase();
  const lowerUrl = url.toLowerCase();

  if (
    lowerUrl.includes('google-analytics.com') ||
    lowerUrl.includes('googletagmanager.com') ||
    lowerUrl.includes('app-measurement.com') ||
    lowerUrl.includes('firebaseinstallations.googleapis.com') ||
    (lowerUrl.includes('givebutter.com') && normalizedMethod === 'GET')
  ) {
    return 'silent-block';
  }

  if (
    lowerUrl.includes('firestore.googleapis.com') &&
    (lowerUrl.includes('firestore/write/channel') ||
      lowerUrl.includes(':commit') ||
      lowerUrl.includes(':batchwrite'))
  ) {
    return 'mutation-block';
  }

  if (
    NON_IDEMPOTENT_METHODS.has(normalizedMethod) &&
    ((lowerUrl.includes('firebasestorage.googleapis.com') &&
      (lowerUrl.includes('uploadtype=') || normalizedMethod !== 'POST')) ||
      lowerUrl.includes('storage.googleapis.com'))
  ) {
    return 'mutation-block';
  }

  if (
    NON_IDEMPOTENT_METHODS.has(normalizedMethod) &&
    (lowerUrl.includes('givebutter.com') ||
      lowerUrl.includes('zeffy.com') ||
      lowerUrl.includes('lglforms.com') ||
      lowerUrl.includes('littlegreenlight.com'))
  ) {
    return 'mutation-block';
  }

  return 'allow';
}

const intervalTrackingScript = `(() => {
  const originalSetInterval = window.setInterval.bind(window);
  const originalClearInterval = window.clearInterval.bind(window);
  const intervals = new Set();
  window.setInterval = (...args) => {
    const id = originalSetInterval(...args);
    intervals.add(id);
    return id;
  };
  window.clearInterval = (id) => {
    intervals.delete(id);
    return originalClearInterval(id);
  };
  Object.defineProperty(window, '__cagVisualClearIntervals', {
    configurable: false,
    value: () => {
      const count = intervals.size;
      for (const id of intervals) originalClearInterval(id);
      intervals.clear();
      return count;
    }
  });
})();`;

export async function prepareCaptureContext(
  context: BrowserContext
): Promise<CaptureRequestGuard> {
  const diagnostics: RequestDiagnostic[] = [];
  await context.addInitScript({ content: intervalTrackingScript });
  await context.route('**/*', async (route: Route, request: Request) => {
    const disposition = classifyCaptureRequest({
      method: request.method(),
      url: request.url()
    });
    if (disposition === 'allow') {
      await route.continue();
      return;
    }
    diagnostics.push({
      disposition,
      method: request.method().toUpperCase(),
      url: sanitizeUrl(request.url())
    });
    await route.abort('blockedbyclient');
  });

  return {
    assertNoMutations() {
      const mutations = diagnostics.filter(
        ({ disposition }) => disposition === 'mutation-block'
      );
      if (mutations.length > 0) {
        throw new Error(
          `visual capture blocked ${mutations.length} known mutation request(s): ${mutations
            .map(({ method, url }) => `${method} ${url}`)
            .join(', ')}`
        );
      }
    },
    diagnostics
  };
}

interface ImageState {
  broken: boolean;
  index: number;
  url: string;
}

const waitForImages = async (page: Page, timeoutMs: number): Promise<void> => {
  await page.evaluate(() => {
    for (const image of document.querySelectorAll<HTMLImageElement>(
      'img[src]'
    )) {
      if (image.getAttribute('src')?.trim()) image.loading = 'eager';
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.evaluate(async (timeout) => {
    const pending = Array.from(
      document.querySelectorAll<HTMLImageElement>('img[src]')
    ).filter((image) => image.getAttribute('src')?.trim() && !image.complete);
    await Promise.all(
      pending.map(
        (image) =>
          new Promise<void>((resolve) => {
            const timer = window.setTimeout(resolve, timeout);
            const done = () => {
              window.clearTimeout(timer);
              resolve();
            };
            image.addEventListener('error', done, { once: true });
            image.addEventListener('load', done, { once: true });
          })
      )
    );
  }, timeoutMs);
};

const inspectImages = async (
  page: Page,
  entry: RouteEntry,
  timeoutMs: number
): Promise<StabilityResult['images']> => {
  await waitForImages(page, timeoutMs);
  const images = await page.locator('img[src]').evaluateAll((nodes) =>
    nodes
      .map((node, index) => {
        const image = node as HTMLImageElement;
        if (!image.getAttribute('src')?.trim()) return null;
        return {
          broken:
            !image.complete ||
            image.naturalHeight <= 0 ||
            image.naturalWidth <= 0,
          index,
          url: image.currentSrc || image.src
        };
      })
      .filter((image): image is ImageState => image !== null)
  );
  const broken = images.filter(({ broken }) => broken);
  const exemptedIndexes = new Set<number>();
  const exemptedBroken: StabilityResult['images']['exemptedBroken'] = [];

  for (const exemption of entry.allowBrokenImages ?? []) {
    let matchingIndexes: number[];
    try {
      matchingIndexes = await page
        .locator('img[src]')
        .evaluateAll(
          (nodes, selector) =>
            nodes.flatMap((node, index) =>
              node.matches(selector) ? [index] : []
            ),
          exemption.selector
        );
    } catch {
      throw new Error(
        `invalid broken-image exemption selector: ${exemption.selector}`
      );
    }
    const matchingBroken = broken.filter(({ index }) =>
      matchingIndexes.includes(index)
    );
    if (matchingBroken.length === 0) {
      throw new Error(
        `stale broken-image exemption did not match a broken image: ${exemption.selector}`
      );
    }
    for (const image of matchingBroken) {
      exemptedIndexes.add(image.index);
      exemptedBroken.push({
        reason: exemption.reason,
        selector: exemption.selector,
        url: sanitizeUrl(image.url)
      });
    }
  }

  const unapproved = broken.filter(({ index }) => !exemptedIndexes.has(index));
  if (unapproved.length > 0) {
    throw new Error(
      `unapproved broken image(s): ${unapproved
        .map(({ url }) => sanitizeUrl(url))
        .join(', ')}`
    );
  }

  return { checked: images.length, exemptedBroken };
};

const inspectMasks = async (
  page: Page,
  entry: RouteEntry
): Promise<{
  locators: Locator[];
  results: StabilityResult['masks'];
}> => {
  const locators: Locator[] = [];
  const results: StabilityResult['masks'] = [];
  for (const mask of entry.masks ?? []) {
    const locator = page.locator(mask.selector);
    let matchCount: number;
    try {
      matchCount = await locator.count();
    } catch {
      throw new Error(`invalid mask selector: ${mask.selector}`);
    }
    if (matchCount === 0) {
      throw new Error(
        `mask selector did not match an element: ${mask.selector}`
      );
    }
    let visibleCount = 0;
    for (let index = 0; index < matchCount; index += 1) {
      if (await locator.nth(index).isVisible()) visibleCount += 1;
    }
    if (visibleCount === 0) {
      throw new Error(`visible mask required for selector: ${mask.selector}`);
    }
    locators.push(locator);
    results.push({ ...mask, matchCount, visibleCount });
  }
  return { locators, results };
};

const inspectFrames = async (page: Page): Promise<StabilityResult['frames']> =>
  page.locator('iframe').evaluateAll((nodes) =>
    nodes.map((node) => {
      const frame = node as HTMLIFrameElement;
      const source = frame.src || 'about:blank';
      let crossOrigin = false;
      try {
        crossOrigin =
          new URL(source, document.baseURI).origin !== location.origin;
      } catch {
        crossOrigin = true;
      }
      const style = getComputedStyle(frame);
      const rectangle = frame.getBoundingClientRect();
      return {
        crossOrigin,
        src: source,
        visible:
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) !== 0 &&
          rectangle.height > 0 &&
          rectangle.width > 0
      };
    })
  );

export async function stabilizePage(
  page: Page,
  entry: RouteEntry,
  options: StabilityOptions = {}
): Promise<StabilizedPage> {
  const startedAt = Date.now();
  const timeoutMs = options.timeoutMs ?? 15_000;

  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation: none !important;
        animation-delay: 0s !important;
        animation-duration: 0s !important;
        animation-iteration-count: 1 !important;
        caret-color: transparent !important;
        scroll-behavior: auto !important;
        transition: none !important;
        transition-delay: 0s !important;
        transition-duration: 0s !important;
      }
    `
  });

  for (const selector of entry.readiness.visible) {
    try {
      await page
        .locator(selector)
        .first()
        .waitFor({ state: 'visible', timeout: timeoutMs });
    } catch {
      throw new Error(`visible readiness did not settle: ${selector}`);
    }
  }
  for (const selector of entry.readiness.hidden ?? []) {
    try {
      await page
        .locator(selector)
        .first()
        .waitFor({ state: 'hidden', timeout: timeoutMs });
    } catch {
      throw new Error(`hidden readiness did not settle: ${selector}`);
    }
  }

  const intervalsCleared = await page.evaluate(() => {
    const clearIntervals = (
      window as Window & { __cagVisualClearIntervals?: () => number }
    ).__cagVisualClearIntervals;
    return clearIntervals?.() ?? 0;
  });

  await withTimeout(
    page.evaluate(() => document.fonts.ready.then(() => undefined)),
    timeoutMs,
    `font readiness did not settle within ${timeoutMs}ms`
  );
  const fonts = await page.evaluate(() =>
    Array.from(document.fonts).map((font) => ({
      family: font.family.replace(/^['"]|['"]$/gu, ''),
      status: font.status,
      style: font.style,
      weight: font.weight
    }))
  );
  const failedFont = fonts.find(({ status }) => status === 'error');
  if (failedFont) {
    throw new Error(`declared font failed: ${failedFont.family}`);
  }

  const images = await inspectImages(page, entry, timeoutMs);
  const masks = await inspectMasks(page, entry);
  const frames = (await inspectFrames(page)).map((frame) => ({
    ...frame,
    src: sanitizeUrl(frame.src)
  }));
  if (
    entry.baselinePolicy.kind === 'blocking-candidate' &&
    frames.some(({ crossOrigin, visible }) => crossOrigin && visible)
  ) {
    throw new Error(
      'blocking candidate contains a visible cross-origin iframe'
    );
  }

  await page.evaluate(
    () =>
      new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
      )
  );

  return {
    maskLocators: masks.locators,
    result: {
      durationMs: Date.now() - startedAt,
      fonts,
      frames,
      images,
      intervalsCleared,
      masks: masks.results
    }
  };
}
