import { describe, expect, it } from 'vitest';

import {
  createPlaywrightConfig,
  readPlaywrightServerMode
} from './playwright.config';

describe('Playwright server mode', () => {
  it('defaults to the self-hosting managed mode', () => {
    expect(readPlaywrightServerMode(undefined)).toBe('managed');
  });

  it('accepts only the exact managed and external modes', () => {
    expect(readPlaywrightServerMode('managed')).toBe('managed');
    expect(readPlaywrightServerMode('external')).toBe('external');
    expect(() => readPlaywrightServerMode('EXTERNAL')).toThrow(
      'Unsupported CAG_PLAYWRIGHT_SERVER_MODE: EXTERNAL'
    );
  });

  it('keeps ordinary E2E self-hosting with a fresh production build', () => {
    const config = createPlaywrightConfig('managed');

    expect(config.use?.baseURL).toBe('http://127.0.0.1:3100');
    expect(config.webServer).toMatchObject({
      command:
        'npm run build && npm run start -- --hostname 127.0.0.1 --port 3100',
      reuseExistingServer: false,
      url: 'http://127.0.0.1:3100/api/health/ready'
    });
  });

  it('uses the prebuilt external server without a webServer owner', () => {
    const config = createPlaywrightConfig('external');

    expect(config.use?.baseURL).toBe('http://127.0.0.1:3100');
    expect(config).not.toHaveProperty('webServer');
  });
});
