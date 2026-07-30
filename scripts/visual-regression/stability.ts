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
  | 'external-font-block'
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
    resolvedFamily: string;
    resources: Array<{
      sameOrigin: true;
      url: string;
    }>;
    status: FontFaceLoadStatus;
    style: string;
    variable: string;
    weight: string;
  }>;
  frames: Array<{
    crossOrigin: boolean;
    declaredSrc: string;
    src: string;
    visible: boolean;
  }>;
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

  try {
    const hostname = new URL(url).hostname.toLowerCase();
    if (
      hostname === 'fonts.googleapis.com' ||
      hostname === 'fonts.gstatic.com'
    ) {
      return 'external-font-block';
    }
  } catch {
    // Invalid URLs fall through to the existing fail-closed host policies.
  }

  if (
    lowerUrl.includes('google-analytics.com') ||
    lowerUrl.includes('googletagmanager.com') ||
    lowerUrl.includes('app-measurement.com') ||
    lowerUrl.includes('firebaseinstallations.googleapis.com') ||
    (lowerUrl.includes('givebutter.com') && normalizedMethod === 'GET')
  ) {
    return 'silent-block';
  }

  try {
    const parsedUrl = new URL(url);
    if (
      normalizedMethod === 'POST' &&
      parsedUrl.hostname === 'www.zeffy.com' &&
      parsedUrl.pathname === '/cdn-cgi/rum'
    ) {
      return 'silent-block';
    }
  } catch {
    // Invalid URLs fall through to the existing fail-closed host policies.
  }

  if (
    lowerUrl.includes('firestore.googleapis.com') &&
    (lowerUrl.includes('firestore/write/channel') ||
      lowerUrl.includes(':commit') ||
      lowerUrl.includes(':batchwrite'))
  ) {
    return 'mutation-block';
  }

  if (lowerUrl.includes('firestore.googleapis.com')) {
    let pathname = '';
    try {
      pathname = new URL(url).pathname.toLowerCase();
    } catch {
      pathname = lowerUrl;
    }
    const isReadRpc =
      pathname.endsWith(':runquery') || pathname.endsWith(':batchget');
    if (
      pathname.includes('/documents') &&
      !isReadRpc &&
      (normalizedMethod === 'PATCH' ||
        normalizedMethod === 'DELETE' ||
        normalizedMethod === 'POST')
    ) {
      return 'mutation-block';
    }
  }

  if (
    NON_IDEMPOTENT_METHODS.has(normalizedMethod) &&
    (lowerUrl.includes('firebasestorage.googleapis.com') ||
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
      await route.fallback();
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
      const externalFonts = diagnostics.filter(
        ({ disposition }) => disposition === 'external-font-block'
      );
      if (externalFonts.length > 0) {
        throw new Error(
          `visual capture blocked ${externalFonts.length} external Google Font request(s)`
        );
      }
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
            window.setTimeout(resolve, timeout);
            image.addEventListener('error', () => resolve(), { once: true });
            image.addEventListener('load', () => resolve(), { once: true });
          })
      )
    );
  }, timeoutMs);
};

const inspectFonts = async (
  page: Page,
  entry: RouteEntry,
  timeoutMs: number
): Promise<StabilityResult['fonts']> => {
  if (!entry.requiredFonts || entry.requiredFonts.length === 0) {
    if (entry.baselinePolicy.kind === 'blocking-candidate') {
      throw new Error('blocking candidate must declare required fonts');
    }
    return page.evaluate(() =>
      Array.from(document.fonts).map((font) => {
        const family = font.family.replace(/^['"]|['"]$/gu, '');
        return {
          family,
          resolvedFamily: family,
          resources: [],
          status: font.status,
          style: font.style,
          variable: '',
          weight: font.weight
        };
      })
    );
  }

  return withTimeout(
    page.evaluate(async (requiredFonts) => {
      const fontRules: Array<{
        family: string;
        sources: string[];
        style: string;
        weight: string;
      }> = [];
      const pendingRules: CSSRule[] = [];
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          pendingRules.push(...Array.from(sheet.cssRules));
        } catch {
          // Cross-origin sheets are not acceptable evidence and are ignored.
        }
      }
      while (pendingRules.length > 0) {
        const rule = pendingRules.shift();
        if (!rule) continue;
        if (rule instanceof CSSFontFaceRule) {
          const sourceBase = rule.parentStyleSheet?.href ?? document.baseURI;
          const sources = Array.from(
            rule.style
              .getPropertyValue('src')
              .matchAll(/url\((['"]?)(.*?)\1\)/gu)
          ).map((match) => new URL(match[2], sourceBase).toString());
          fontRules.push({
            family: rule.style
              .getPropertyValue('font-family')
              .trim()
              .replace(/^['"]|['"]$/gu, ''),
            sources,
            style: rule.style.getPropertyValue('font-style').trim() || 'normal',
            weight:
              rule.style.getPropertyValue('font-weight').trim() || 'normal'
          });
          continue;
        }
        if ('cssRules' in rule) {
          pendingRules.push(...Array.from((rule as CSSGroupingRule).cssRules));
        }
      }

      const pageOrigin = location.origin;
      const results = [];

      for (const required of requiredFonts) {
        const variableValue = getComputedStyle(
          document.documentElement
        ).getPropertyValue(required.variable);
        if (!variableValue.trim()) {
          throw new Error(
            `required font variable is missing: ${required.variable}`
          );
        }
        const familyMatch = variableValue
          .trim()
          .match(/^(?:'([^']+)'|"([^"]+)"|([^,]+))/u);
        const resolvedFamily = (
          familyMatch?.[1] ??
          familyMatch?.[2] ??
          familyMatch?.[3] ??
          ''
        )
          .trim()
          .replace(/^['"]|['"]$/gu, '');
        if (!resolvedFamily) {
          throw new Error(
            `required font variable is missing: ${required.variable}`
          );
        }

        const matchingRules = fontRules.filter(
          (rule) =>
            rule.family === resolvedFamily &&
            rule.style === required.style &&
            rule.weight === required.weight
        );
        if (matchingRules.length === 0) {
          throw new Error(
            `required font face is absent: ${required.family} ${required.style} ${required.weight}`
          );
        }

        try {
          await document.fonts.load(
            `${required.style} ${required.weight} 16px "${resolvedFamily.replace(/"/gu, '\\"')}"`,
            'Chicago Artist Guide'
          );
        } catch {
          throw new Error(
            `required font load failed: ${required.family} ${required.style} ${required.weight}`
          );
        }

        const matchingFaces = Array.from(document.fonts).filter(
          (font) =>
            font.family.trim().replace(/^['"]|['"]$/gu, '') ===
              resolvedFamily &&
            font.style === required.style &&
            font.weight === required.weight
        );
        if (matchingFaces.length === 0) {
          throw new Error(
            `required font face is absent: ${required.family} ${required.style} ${required.weight}`
          );
        }
        const loadedFace = matchingFaces.find(
          ({ status }) => status === 'loaded'
        );
        if (!loadedFace) {
          throw new Error(
            `required font did not load: ${required.family} ${required.style} ${required.weight}`
          );
        }

        const sourceUrls = matchingRules.flatMap(({ sources }) => sources);
        if (
          sourceUrls.some((rawUrl) => {
            const hostname = new URL(rawUrl).hostname.toLowerCase();
            return (
              hostname === 'fonts.googleapis.com' ||
              hostname === 'fonts.gstatic.com'
            );
          })
        ) {
          throw new Error('external Google Font resource is prohibited');
        }
        const resources = sourceUrls
          .filter((rawUrl) =>
            performance
              .getEntriesByType('resource')
              .some((entry) => entry.name === rawUrl)
          )
          .map((rawUrl) => new URL(rawUrl))
          .filter(
            (url) =>
              url.origin === pageOrigin &&
              url.pathname.startsWith('/_next/static/media/')
          )
          .map((url) => ({
            sameOrigin: true as const,
            url: `${url.origin}${url.pathname}`
          }));
        if (resources.length === 0) {
          throw new Error(
            `required font lacks same-origin Next font resource evidence: ${required.family} ${required.style} ${required.weight}`
          );
        }

        results.push({
          family: required.family,
          resolvedFamily,
          resources,
          status: loadedFace.status,
          style: required.style,
          variable: required.variable,
          weight: required.weight
        });
      }
      return results;
    }, entry.requiredFonts),
    timeoutMs,
    `required font loading did not settle within ${timeoutMs}ms`
  );
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

const inspectFrames = async (
  page: Page
): Promise<StabilityResult['frames']> => {
  const locators = page.locator('iframe');
  const frames: StabilityResult['frames'] = [];
  const parentUrl = new URL(page.url());
  const count = await locators.count();
  for (let index = 0; index < count; index += 1) {
    const locator = locators.nth(index);
    const element = await locator.elementHandle();
    const navigatedFrame = await element?.contentFrame();
    const attributes = await locator.evaluate((node) => {
      const frame = node as HTMLIFrameElement;
      const style = getComputedStyle(frame);
      const rectangle = frame.getBoundingClientRect();
      const declared = frame.getAttribute('src');
      return {
        declaredSrc: frame.hasAttribute('srcdoc')
          ? 'about:srcdoc'
          : declared
            ? new URL(declared, document.baseURI).toString()
            : 'about:blank',
        visible:
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          Number(style.opacity) !== 0 &&
          rectangle.height > 0 &&
          rectangle.width > 0
      };
    });
    const source = navigatedFrame?.url() || attributes.declaredSrc;
    const inheritsParentOrigin =
      source === 'about:blank' || source === 'about:srcdoc';
    let crossOrigin = false;
    if (!inheritsParentOrigin) {
      try {
        crossOrigin = new URL(source).origin !== parentUrl.origin;
      } catch {
        crossOrigin = true;
      }
    }
    frames.push({
      crossOrigin,
      declaredSrc: attributes.declaredSrc,
      src: source,
      visible: attributes.visible
    });
  }
  return frames;
};

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
  const fonts = await inspectFonts(page, entry, timeoutMs);
  const failedFont = fonts.find(({ status }) => status === 'error');
  if (failedFont) {
    throw new Error(`declared font failed: ${failedFont.family}`);
  }

  const images = await inspectImages(page, entry, timeoutMs);
  const masks = await inspectMasks(page, entry);
  const frames = (await inspectFrames(page)).map((frame) => ({
    ...frame,
    declaredSrc: sanitizeUrl(frame.declaredSrc),
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

  await withTimeout(
    page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
        )
    ),
    timeoutMs,
    `animation-frame settle did not complete within ${timeoutMs}ms`
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

const assertPageLocation = (
  page: Page,
  expectedOrigin: string,
  expectedPath: string
): string => {
  const finalUrl = page.url();
  const actual = new URL(finalUrl);
  if (actual.origin !== expectedOrigin) {
    throw new Error(
      `capture origin changed from ${expectedOrigin} to ${actual.origin}`
    );
  }
  if (actual.pathname !== expectedPath) {
    throw new Error(
      `capture pathname changed from ${expectedPath} to ${actual.pathname}`
    );
  }
  return finalUrl;
};

export async function captureStablePage(
  page: Page,
  entry: RouteEntry,
  requestGuard: CaptureRequestGuard,
  partialPath: string,
  timeoutMs: number,
  expectedOrigin: string
): Promise<{ finalUrl: string; stability: StabilityResult }> {
  assertPageLocation(page, expectedOrigin, entry.path);
  const stabilized = await stabilizePage(page, entry, { timeoutMs });
  assertPageLocation(page, expectedOrigin, entry.path);
  requestGuard.assertNoMutations();
  await page.screenshot({
    animations: 'disabled',
    fullPage: entry.fullPage,
    mask: stabilized.maskLocators,
    path: partialPath,
    type: 'png'
  });
  requestGuard.assertNoMutations();
  const finalUrl = assertPageLocation(page, expectedOrigin, entry.path);
  return { finalUrl, stability: stabilized.result };
}
