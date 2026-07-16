import { smokeServer } from './smoke-server.mjs';

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  Response.json(body, init);

const htmlResponse = (body: string) =>
  new Response(`<!doctype html><html><body>${body}</body></html>`, {
    headers: { 'Content-Type': 'text/html' }
  });

const staticPath = '/_next/static/chunks/app/home/page.js';

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
      staticPath
    ]);
  });

  it('passes the default request timeout signal as fetch options', async () => {
    const signal = new AbortController().signal;
    const timeout = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(signal);

    await smokeServer({
      baseUrl: 'http://example.test',
      fetchImpl: healthyFetch
    });

    expect(timeout).toHaveBeenCalledTimes(5);
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

    expect(timeout).toHaveBeenCalledTimes(5);
    expect(timeout).toHaveBeenCalledWith(1234);
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

    expect(fetchImpl).toHaveBeenCalledTimes(6);
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
