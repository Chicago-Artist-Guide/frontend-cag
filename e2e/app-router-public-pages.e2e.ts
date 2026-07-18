import { expect, test } from '@playwright/test';

const publicPageMarkers = [
  { marker: 'ABOUT US', path: '/about-us' },
  { marker: 'Donate to Support Chicago Artists', path: '/donate' },
  { marker: 'FREQUENTLY ASKED QUESTIONS', path: '/faq' },
  { marker: 'Discover your next', path: '/home' },
  { marker: 'PRIVACY POLICY', path: '/privacy-policy' },
  { marker: 'TERMS OF SERVICE', path: '/terms-of-service' },
  { marker: 'THEATRE RESOURCES', path: '/theatre-resources' }
] as const;

test.describe('public App Router initial HTML', () => {
  for (const { marker, path } of publicPageMarkers) {
    test(`${path} includes its unique content before hydration`, async ({
      request
    }) => {
      const response = await request.get(path);
      const initialHtml = await response.text();

      expect(response.status()).toBe(200);
      expect(initialHtml).toContain(marker);
      expect(initialHtml).not.toContain('legacy-app');
    });
  }
});
