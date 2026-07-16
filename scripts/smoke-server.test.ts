import { smokeServer } from './smoke-server.mjs';

const jsonResponse = (body: unknown, init?: ResponseInit) =>
  Response.json(body, init);

const healthyFetch = vi.fn(async (input: string | URL | Request) => {
  const pathname = new URL(input.toString()).pathname;

  if (pathname === '/api/health/live') {
    return jsonResponse({ status: 'ok' });
  }
  if (pathname === '/api/health/ready') {
    return jsonResponse({ status: 'ready' });
  }

  return new Response('<!doctype html><html><body>app</body></html>', {
    headers: { 'Content-Type': 'text/html' }
  });
});

describe('smokeServer', () => {
  beforeEach(() => {
    healthyFetch.mockClear();
  });

  it('accepts healthy endpoints and an HTML app shell', async () => {
    await expect(
      smokeServer({ baseUrl: 'http://example.test', fetchImpl: healthyFetch })
    ).resolves.toBeUndefined();

    expect(healthyFetch).toHaveBeenCalledTimes(3);
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

    expect(fetchImpl).toHaveBeenCalledTimes(4);
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
});
