import { GET as getLiveness } from './live/route';
import { GET as getReadiness } from './ready/route';

describe('health routes', () => {
  it.each([
    ['liveness', getLiveness, { status: 'ok' }],
    ['readiness', getReadiness, { status: 'ready' }]
  ])('returns a deterministic %s response', async (_name, handler, body) => {
    const response = handler();

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('application/json');
    expect(response.headers.get('cache-control')).toBe('no-store');
    await expect(response.json()).resolves.toEqual(body);
  });
});
