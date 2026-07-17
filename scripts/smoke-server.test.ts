import { smokeServer } from './smoke-server.mjs';

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  Response.json(body, init);

const htmlResponse = (body: string) =>
  new Response(`<!doctype html><html><body>${body}</body></html>`, {
    headers: { 'Content-Type': 'text/html' }
  });

const staticPath = '/_next/static/chunks/app/home/page.js';
const publicAssetPaths = [
  '/images/cagLogo1.svg',
  '/images/donate/stage_bow.png'
] as const;

const healthyResponse = async (input: string | URL | Request) => {
  const pathname = new URL(input.toString()).pathname;

  if (pathname === '/api/health/live') {
    return jsonResponse({ status: 'ok' });
  }
  if (pathname === '/api/health/ready') {
    return jsonResponse({ status: 'ready' });
  }
  if (pathname === '/home') {
    return htmlResponse(`<script src="${staticPath}"></script>`);
  }
  if (pathname === '/about-us') {
    return htmlResponse('about');
  }
  if (pathname === staticPath) {
    return new Response('asset');
  }
  if (pathname === publicAssetPaths[0]) {
    return new Response('<svg></svg>', {
      headers: { 'Content-Type': 'image/svg+xml' }
    });
  }
  if (pathname === publicAssetPaths[1]) {
    return new Response('png', {
      headers: { 'Content-Type': 'image/png' }
    });
  }

  return new Response('not found', {
    status: 404,
    statusText: 'Not Found'
  });
};

const healthyFetch = vi.fn<typeof fetch>(healthyResponse);

describe('smokeServer', () => {
  beforeEach(() => {
    healthyFetch.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('checks health, nested HTML routes, and a referenced static asset', async () => {
    await expect(
      smokeServer({ baseUrl: 'http://example.test', fetchImpl: healthyFetch })
    ).resolves.toBeUndefined();

    expect(
      healthyFetch.mock.calls.map(
        ([input]) => new URL(input.toString()).pathname
      )
    ).toEqual([
      '/api/health/live',
      '/api/health/ready',
      '/home',
      '/about-us',
      staticPath,
      ...publicAssetPaths
    ]);
  });

  it('passes the default request timeout signal as fetch options', async () => {
    const signal = new AbortController().signal;
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(signal);

    await smokeServer({
      baseUrl: 'http://example.test',
      fetchImpl: healthyFetch
    });

    expect(timeout).toHaveBeenCalledTimes(7);
    expect(timeout).toHaveBeenCalledWith(5000);
    healthyFetch.mock.calls.forEach(([, init]) => {
      expect(init).toEqual({ signal });
    });
  });

  it('uses a configured request timeout for every fetch', async () => {
    const signal = new AbortController().signal;
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(signal);

    await smokeServer({
      baseUrl: 'http://example.test',
      fetchImpl: healthyFetch,
      requestTimeoutMs: 1234
    });

    expect(timeout).toHaveBeenCalledTimes(7);
    expect(timeout).toHaveBeenCalledWith(1234);
  });

  it('stops retries when an external verification signal is aborted', async () => {
    const controller = new AbortController();
    let requestStarted: (() => void) | undefined;
    const started = new Promise<void>((resolve) => {
      requestStarted = resolve;
    });
    const fetchImpl = vi.fn<typeof fetch>(
      async (_input, init) =>
        new Promise<Response>((_resolve, reject) => {
          requestStarted?.();
          init?.signal?.addEventListener(
            'abort',
            () => reject(init.signal?.reason),
            { once: true }
          );
        })
    );

    const verification = smokeServer({
      attempts: 20,
      baseUrl: 'http://example.test',
      delayMs: 0,
      fetchImpl,
      requestTimeoutMs: 1,
      signal: controller.signal
    });
    await started;
    controller.abort(new Error('verification interrupted'));

    await expect(verification).rejects.toThrow('verification interrupted');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('keeps cancellation active while a response body is being read', async () => {
    const controller = new AbortController();
    let headersReturned: (() => void) | undefined;
    const returned = new Promise<void>((resolve) => {
      headersReturned = resolve;
    });
    const fetchImpl = vi.fn<typeof fetch>(async (_input, init) => {
      const requestSignal = init?.signal;
      const body = new ReadableStream({
        start(streamController) {
          requestSignal?.addEventListener(
            'abort',
            () => streamController.error(requestSignal.reason),
            { once: true }
          );
        }
      });
      headersReturned?.();
      return new Response(body, {
        headers: { 'Content-Type': 'application/json' }
      });
    });

    const verification = smokeServer({
      attempts: 1,
      baseUrl: 'http://example.test',
      fetchImpl,
      requestTimeoutMs: 5000,
      signal: controller.signal
    });
    await returned;
    controller.abort(new Error('body read interrupted'));

    await expect(verification).rejects.toThrow('body read interrupted');
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it('retries bounded connection failures', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockRejectedValueOnce(new Error('connection refused'))
      .mockImplementation(healthyFetch);

    await smokeServer({
      attempts: 2,
      baseUrl: 'http://example.test',
      delayMs: 0,
      fetchImpl
    });

    expect(fetchImpl).toHaveBeenCalledTimes(8);
  });

  it('rejects a non-success response with its route and status', async () => {
    const fetchImpl = vi.fn<typeof fetch>().mockResolvedValue(
      new Response('unavailable', {
        status: 503,
        statusText: 'Service Unavailable'
      })
    );

    await expect(
      smokeServer({ baseUrl: 'http://example.test', fetchImpl })
    ).rejects.toThrow('/api/health/live returned 503 Service Unavailable');
  });

  it('rejects an invalid health payload', async () => {
    const fetchImpl = vi
      .fn<typeof fetch>()
      .mockResolvedValue(jsonResponse({ status: 'wrong' }));

    await expect(
      smokeServer({ baseUrl: 'http://example.test', fetchImpl })
    ).rejects.toThrow(
      '/api/health/live returned status "wrong"; expected "ok"'
    );
  });

  it('identifies a failing nested application route', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (input) => {
      const pathname = new URL(input.toString()).pathname;

      if (pathname === '/about-us') {
        return new Response('missing', {
          status: 404,
          statusText: 'Not Found'
        });
      }

      return healthyResponse(input);
    });

    await expect(
      smokeServer({ baseUrl: 'http://example.test', fetchImpl })
    ).rejects.toThrow('/about-us returned 404 Not Found');
  });

  it('identifies a failing referenced static asset', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (input) => {
      const pathname = new URL(input.toString()).pathname;

      if (pathname === staticPath) {
        return new Response('missing', {
          status: 404,
          statusText: 'Not Found'
        });
      }

      return healthyResponse(input);
    });

    await expect(
      smokeServer({ baseUrl: 'http://example.test', fetchImpl })
    ).rejects.toThrow(`${staticPath} returned 404 Not Found`);
  });

  it('identifies a failing migrated public image', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (input) => {
      const pathname = new URL(input.toString()).pathname;

      if (pathname === publicAssetPaths[1]) {
        return new Response('missing', {
          status: 404,
          statusText: 'Not Found'
        });
      }

      return healthyResponse(input);
    });

    await expect(
      smokeServer({ baseUrl: 'http://example.test', fetchImpl })
    ).rejects.toThrow(`${publicAssetPaths[1]} returned 404 Not Found`);
  });

  it('rejects a home shell without a root-relative static reference', async () => {
    const fetchImpl = vi.fn<typeof fetch>(async (input) => {
      const pathname = new URL(input.toString()).pathname;

      if (pathname === '/home') {
        return htmlResponse('app without assets');
      }

      return healthyResponse(input);
    });

    await expect(
      smokeServer({ baseUrl: 'http://example.test', fetchImpl })
    ).rejects.toThrow(
      '/home did not reference a root-relative /_next/static/ asset'
    );
  });
});
