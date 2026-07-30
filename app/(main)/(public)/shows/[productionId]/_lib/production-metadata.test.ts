import { describe, expect, it } from 'vitest';
import type { Production } from '../../../../../../src/components/Profile/Company/types';
import { buildProductionMetadata } from './production-metadata';

const baseProduction: Production = {
  account_id: 'acc-1',
  location: 'Chicago, IL',
  production_id: 'prod-1',
  production_name: 'Hamlet'
};

describe('buildProductionMetadata', () => {
  it('titles the page with the production name', () => {
    const metadata = buildProductionMetadata(baseProduction);

    expect(metadata.title).toBe('Hamlet | Chicago Artist Guide');
  });

  it('falls back to a generic description when the production has none', () => {
    const metadata = buildProductionMetadata(baseProduction);

    expect(metadata.description).toBe(
      'Discover casting opportunities in Chicago theatre on Chicago Artist Guide.'
    );
  });

  it('uses the production description when present', () => {
    const metadata = buildProductionMetadata({
      ...baseProduction,
      description: 'A tragedy in Denmark.'
    });

    expect(metadata.description).toBe('A tragedy in Denmark.');
  });

  it('truncates long descriptions for the OG card', () => {
    const longDescription = 'a'.repeat(250);

    const metadata = buildProductionMetadata({
      ...baseProduction,
      description: longDescription
    });

    expect(metadata.description?.length).toBeLessThanOrEqual(200);
    expect(metadata.description?.endsWith('…')).toBe(true);
  });

  it('omits the OG image when there is no production image', () => {
    const metadata = buildProductionMetadata(baseProduction);

    expect(metadata.openGraph?.images).toBeUndefined();
  });

  it('uses the production image as the OG image when present', () => {
    const metadata = buildProductionMetadata({
      ...baseProduction,
      production_image_url: 'https://example.com/poster.jpg'
    });

    expect(metadata.openGraph?.images).toEqual([
      { url: 'https://example.com/poster.jpg' }
    ]);
  });

  it('mirrors the title and description into openGraph', () => {
    const metadata = buildProductionMetadata(baseProduction);

    expect(metadata.openGraph?.title).toBe(metadata.title);
    expect(metadata.openGraph?.description).toBe(metadata.description);
  });
});
