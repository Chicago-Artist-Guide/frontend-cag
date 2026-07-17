// @vitest-environment node

import {
  chromium,
  type Browser,
  type BrowserContext,
  type Page
} from '@playwright/test';
import { readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  captureStablePage,
  classifyCaptureRequest,
  prepareCaptureContext,
  stabilizePage
} from './stability';
import type { RouteEntry } from './manifest';

const fontFile = path.resolve(
  process.cwd(),
  'node_modules/next/dist/next-devtools/server/font/geist-latin.woff2'
);

const fixtureEntry = (overrides: Partial<RouteEntry> = {}): RouteEntry => ({
  allowBrokenImages: [
    { reason: 'Deliberately broken fixture image.', selector: '#broken' }
  ],
  auth: 'anonymous',
  baselinePolicy: {
    kind: 'reference-only',
    reason: 'The fixture contains a cross-origin frame.'
  },
  clusters: ['public-static'],
  fullPage: true,
  id: 'fixture',
  masks: [{ reason: 'Volatile fixture value.', selector: '#masked' }],
  path: '/home',
  readiness: {
    hidden: ['#loading'],
    visible: ['h1:has-text("Ready"):visible']
  },
  sourceGlobs: ['src/components/Home/**'],
  viewports: ['desktop'],
  ...overrides
});

const fixtureHtml = `<!doctype html>
  <style>
    @font-face { font-family: FixtureFont; src: url('https://fixture.test/font.woff2') format('woff2'); }
    #ready { font-family: FixtureFont; }
    #animated { animation: pulse 1s infinite; transition: opacity 1s; }
    @keyframes pulse { from { opacity: 0; } to { opacity: 1; } }
  </style>
  <main>
    <div id="loading">Loading</div>
    <h1 id="ready" hidden>Ready</h1>
    <div id="animated">Animated</div>
    <output id="counter">0</output>
    <div id="masked">${Date.now()}</div>
    <img id="valid" src="https://fixture.test/valid.svg">
    <img id="broken" src="https://fixture.test/broken.svg">
    <iframe src="https://frame.test/embed"></iframe>
  </main>
  <script>
    setTimeout(() => {
      document.querySelector('#ready').hidden = false;
      document.querySelector('#loading').hidden = true;
    }, 60);
    setInterval(() => {
      const output = document.querySelector('#counter');
      output.textContent = String(Number(output.textContent) + 1);
    }, 10);
  </script>`;

describe.sequential('stabilizePage', () => {
  let browser: Browser;

  beforeAll(async () => {
    browser = await chromium.launch({ headless: true });
  });

  afterAll(async () => {
    await browser.close();
  });

  async function fixture(
    html = fixtureHtml
  ): Promise<{ context: BrowserContext; page: Page }> {
    const context = await browser.newContext();
    await prepareCaptureContext(context);
    await context.route('https://fixture.test/font.woff2', async (route) => {
      await route.fulfill({
        body: await readFile(fontFile),
        contentType: 'font/woff2',
        status: 200
      });
    });
    await context.route('https://fixture.test/valid.svg', async (route) => {
      await route.fulfill({
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="2" height="2"></svg>',
        contentType: 'image/svg+xml',
        status: 200
      });
    });
    await context.route('https://fixture.test/broken.svg', (route) =>
      route.abort()
    );
    await context.route('https://frame.test/embed', (route) =>
      route.fulfill({ body: '<p>remote frame</p>', contentType: 'text/html' })
    );
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    return { context, page };
  }

  it('waits for semantic readiness, fonts, images, masks, and freezes motion', async () => {
    const { context, page } = await fixture();
    try {
      const stabilized = await stabilizePage(page, fixtureEntry(), {
        timeoutMs: 2_000
      });

      expect(stabilized.result.durationMs).toBeGreaterThanOrEqual(40);
      expect(stabilized.result.fonts).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ family: 'FixtureFont', status: 'loaded' })
        ])
      );
      expect(stabilized.result.images).toMatchObject({
        checked: 2,
        exemptedBroken: [
          expect.objectContaining({
            reason: 'Deliberately broken fixture image.',
            selector: '#broken',
            url: 'https://fixture.test/broken.svg'
          })
        ]
      });
      expect(stabilized.result.masks).toEqual([
        {
          matchCount: 1,
          reason: 'Volatile fixture value.',
          selector: '#masked',
          visibleCount: 1
        }
      ]);
      expect(stabilized.maskLocators).toHaveLength(1);
      expect(stabilized.result.frames).toEqual([
        {
          crossOrigin: true,
          declaredSrc: 'https://frame.test/embed',
          src: 'https://frame.test/embed',
          visible: true
        }
      ]);
      expect(stabilized.result.intervalsCleared).toBe(1);
      expect(
        await page
          .locator('#animated')
          .evaluate((node) => getComputedStyle(node).animationName)
      ).toBe('none');

      const count = await page.locator('#counter').textContent();
      await page.waitForTimeout(50);
      expect(await page.locator('#counter').textContent()).toBe(count);
    } finally {
      await context.close();
    }
  });

  it.each([
    {
      entry: fixtureEntry({
        readiness: { visible: ['h1:has-text("Missing"):visible'] }
      }),
      problem: 'visible readiness'
    },
    {
      entry: fixtureEntry({
        readiness: {
          hidden: ['#animated'],
          visible: ['h1:has-text("Ready"):visible']
        }
      }),
      problem: 'hidden readiness'
    },
    {
      entry: fixtureEntry({ allowBrokenImages: [] }),
      problem: 'unapproved broken image'
    },
    {
      entry: fixtureEntry({
        allowBrokenImages: [
          { reason: 'Not actually broken.', selector: '#valid' },
          { reason: 'Deliberately broken fixture image.', selector: '#broken' }
        ]
      }),
      problem: 'stale broken-image exemption'
    },
    {
      entry: fixtureEntry({
        masks: [{ reason: 'Missing.', selector: '#missing' }]
      }),
      problem: 'mask selector'
    },
    {
      entry: fixtureEntry({
        masks: [{ reason: 'Hidden.', selector: '#loading' }]
      }),
      problem: 'visible mask'
    }
  ])('fails closed for $problem', async ({ entry, problem }) => {
    const { context, page } = await fixture();
    try {
      await expect(
        stabilizePage(page, entry, { timeoutMs: 150 })
      ).rejects.toThrow(problem);
    } finally {
      await context.close();
    }
  });

  it('fails a declared font that reaches the FontFace error state', async () => {
    const { context, page } = await fixture(`
      <style>@font-face { font-family: FailedFixture; src: url('https://fixture.test/missing.woff2'); }</style>
      <main><h1 id="ready" style="font-family: FailedFixture">Ready</h1></main>
    `);
    await context.route('https://fixture.test/missing.woff2', (route) =>
      route.abort()
    );
    try {
      await expect(
        stabilizePage(
          page,
          fixtureEntry({
            allowBrokenImages: [],
            masks: [],
            readiness: { visible: ['h1:has-text("Ready"):visible'] }
          }),
          { timeoutMs: 500 }
        )
      ).rejects.toThrow('declared font failed');
    } finally {
      await context.close();
    }
  });

  it('bounds font readiness with the per-case timeout', async () => {
    const context = await browser.newContext();
    await prepareCaptureContext(context);
    await context.route('https://fixture.test/never.woff2', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.fulfill({
        body: await readFile(fontFile),
        contentType: 'font/woff2',
        status: 200
      });
    });
    const page = await context.newPage();
    await page.setContent('<main><h1 id="ready">Ready</h1></main>');
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.textContent =
        "@font-face { font-family: NeverFixture; src: url('https://fixture.test/never.woff2'); }";
      document.head.append(style);
      const ready = document.querySelector<HTMLElement>('#ready');
      if (ready) ready.style.fontFamily = 'NeverFixture';
    });
    try {
      await expect(
        stabilizePage(
          page,
          fixtureEntry({
            allowBrokenImages: [],
            masks: [],
            readiness: { visible: ['h1:has-text("Ready"):visible'] }
          }),
          { timeoutMs: 100 }
        )
      ).rejects.toThrow('font readiness did not settle within 100ms');
    } finally {
      await context.close();
    }
  });

  it('rejects visible cross-origin frames for blocking candidates', async () => {
    const { context, page } = await fixture();
    try {
      await expect(
        stabilizePage(
          page,
          fixtureEntry({ baselinePolicy: { kind: 'blocking-candidate' } }),
          { timeoutMs: 1_000 }
        )
      ).rejects.toThrow('cross-origin iframe');
    } finally {
      await context.close();
    }
  });

  it('fails when async navigation changes the route during stabilization', async () => {
    const context = await browser.newContext();
    await prepareCaptureContext(context);
    await context.route('https://fixture.test/home', (route) =>
      route.fulfill({
        body: `<main><h1 hidden>Ready</h1></main><script>
          setTimeout(() => {
            history.replaceState({}, '', '/login');
            document.querySelector('h1').hidden = false;
          }, 40);
        </script>`,
        contentType: 'text/html'
      })
    );
    const page = await context.newPage();
    await page.goto('https://fixture.test/home');
    try {
      await expect(
        captureStablePage(
          page,
          fixtureEntry({ allowBrokenImages: [], masks: [] }),
          { assertNoMutations: () => undefined, diagnostics: [] },
          '/tmp/unused.png',
          500
        )
      ).rejects.toThrow('pathname changed from /home to /login');
    } finally {
      await context.close();
    }
  });

  it('rechecks pathname and mutation diagnostics after screenshot', async () => {
    const context = await browser.newContext();
    await prepareCaptureContext(context);
    await context.route('https://fixture.test/home', (route) =>
      route.fulfill({
        body: '<main><h1>Ready</h1></main>',
        contentType: 'text/html'
      })
    );
    const page = await context.newPage();
    await page.goto('https://fixture.test/home');
    const originalScreenshot = page.screenshot.bind(page);
    page.screenshot = async (options) => {
      const screenshot = await originalScreenshot(options);
      await page.evaluate(() => history.replaceState({}, '', '/after-shot'));
      return screenshot;
    };
    const screenshotPath = path.join(
      os.tmpdir(),
      `cag-after-shot-${process.pid}.png`
    );
    let guardChecks = 0;
    try {
      await expect(
        captureStablePage(
          page,
          fixtureEntry({ allowBrokenImages: [], masks: [] }),
          {
            assertNoMutations: () => {
              guardChecks += 1;
            },
            diagnostics: []
          },
          screenshotPath,
          500
        )
      ).rejects.toThrow('pathname changed from /home to /after-shot');
      expect(guardChecks).toBe(2);
    } finally {
      await rm(screenshotPath, { force: true });
      await context.close();
    }
  });

  it('uses navigated child-frame URLs and inherited blank/srcdoc origins', async () => {
    const context = await browser.newContext();
    await prepareCaptureContext(context);
    await context.route('https://fixture.test/page', (route) =>
      route.fulfill({
        body: `<main><h1>Ready</h1>
          <iframe src="/redirect?token=private"></iframe>
          <iframe></iframe>
          <iframe srcdoc="<p>inline</p>"></iframe>
        </main>`,
        contentType: 'text/html'
      })
    );
    await context.route(
      'https://fixture.test/redirect?token=private',
      (route) =>
        route.fulfill({
          body: '<script>location.replace("https://frame.test/final")</script>',
          contentType: 'text/html'
        })
    );
    await context.route('https://frame.test/final', (route) =>
      route.fulfill({ body: '<p>cross origin</p>', contentType: 'text/html' })
    );
    const page = await context.newPage();
    await page.goto('https://fixture.test/page');
    try {
      await expect
        .poll(() => page.frames().map((frame) => frame.url()))
        .toContain('https://frame.test/final');
      const stabilized = await stabilizePage(
        page,
        fixtureEntry({ allowBrokenImages: [], masks: [] })
      );
      expect(stabilized.result.frames).toEqual([
        expect.objectContaining({
          crossOrigin: true,
          declaredSrc: 'https://fixture.test/redirect',
          src: 'https://frame.test/final'
        }),
        expect.objectContaining({ crossOrigin: false, src: 'about:blank' }),
        expect.objectContaining({ crossOrigin: false, src: 'about:srcdoc' })
      ]);
    } finally {
      await context.close();
    }
  });

  it('bounds the final animation-frame settle', async () => {
    const { context, page } = await fixture();
    await page.evaluate(() => {
      window.requestAnimationFrame = () => 0;
    });
    try {
      await expect(
        stabilizePage(page, fixtureEntry(), { timeoutMs: 100 })
      ).rejects.toThrow('animation-frame settle did not complete within 100ms');
    } finally {
      await context.close();
    }
  });
});

describe('capture request policy', () => {
  it.each([
    ['https://www.google-analytics.com/g/collect', 'POST', 'silent-block'],
    [
      'https://firestore.googleapis.com/google.firestore.v1.Firestore/Write/channel',
      'POST',
      'mutation-block'
    ],
    [
      'https://firestore.googleapis.com/v1/projects/cag/databases/(default)/documents:commit',
      'POST',
      'mutation-block'
    ],
    [
      'https://firestore.googleapis.com/v1/projects/cag/databases/(default)/documents/accounts?documentId=new',
      'POST',
      'mutation-block'
    ],
    [
      'https://firestore.googleapis.com/v1/projects/cag/databases/(default)/documents/accounts/one',
      'PATCH',
      'mutation-block'
    ],
    [
      'https://firestore.googleapis.com/v1/projects/cag/databases/(default)/documents/accounts/one',
      'DELETE',
      'mutation-block'
    ],
    [
      'https://firebasestorage.googleapis.com/v0/b/bucket/o?uploadType=media',
      'POST',
      'mutation-block'
    ],
    [
      'https://api.littlegreenlight.com/api/v1/constituents',
      'POST',
      'mutation-block'
    ],
    [
      'https://firestore.googleapis.com/google.firestore.v1.Firestore/Listen/channel',
      'POST',
      'allow'
    ],
    [
      'https://firestore.googleapis.com/v1/projects/cag/databases/(default)/documents:runQuery',
      'POST',
      'allow'
    ],
    [
      'https://firestore.googleapis.com/v1/projects/cag/databases/(default)/documents:batchGet',
      'POST',
      'allow'
    ],
    ['https://securetoken.googleapis.com/v1/token', 'POST', 'allow'],
    ['https://fixture.test/page', 'GET', 'allow']
  ] as const)('classifies %s %s as %s', (url, method, expected) => {
    expect(classifyCaptureRequest({ method, url })).toBe(expected);
  });

  it('aborts a routed REST mutation while allowing a routed query POST', async () => {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    await context.route('https://firestore.googleapis.com/**', (route) =>
      route.fulfill({
        body: '{}',
        headers: { 'access-control-allow-origin': '*' },
        status: 200
      })
    );
    const guard = await prepareCaptureContext(context);
    const page = await context.newPage();
    try {
      await expect(
        page.evaluate(() =>
          fetch(
            'https://firestore.googleapis.com/v1/projects/cag/databases/(default)/documents/accounts/one',
            { method: 'DELETE' }
          )
        )
      ).rejects.toThrow();
      await expect(
        page.evaluate(() =>
          fetch(
            'https://firestore.googleapis.com/v1/projects/cag/databases/(default)/documents:runQuery',
            { method: 'POST' }
          ).then((response) => response.status)
        )
      ).resolves.toBe(200);
      expect(() => guard.assertNoMutations()).toThrow('known mutation');
    } finally {
      await context.close();
      await browser.close();
    }
  });
});
