import { validateProductionConfiguration } from './production-config.mjs';

const configuration = {
  CERTIFICATE_ARN:
    'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012',
  NEXT_PUBLIC_SITE_URL: 'https://www.chicagoartistguide.org'
};

describe('production configuration', () => {
  it('accepts an ACM certificate and HTTPS origin', () => {
    expect(validateProductionConfiguration(configuration).hostname).toBe(
      'www.chicagoartistguide.org'
    );
  });

  it.each([
    '',
    'http://www.chicagoartistguide.org',
    'https://user:password@example.org',
    'https://example.org/path',
    'https://example.org?query=1',
    'https://example.org#fragment',
    'https://example.org:8443'
  ])('rejects an invalid public HTTPS origin %s', (origin) => {
    expect(() =>
      validateProductionConfiguration({
        ...configuration,
        NEXT_PUBLIC_SITE_URL: origin
      })
    ).toThrow(/HTTPS origin/);
  });

  it.each([
    '',
    'arn:aws:iam::123456789012:role/example',
    'certificate/example'
  ])('rejects a missing or malformed certificate %s', (arn) => {
    expect(() =>
      validateProductionConfiguration({
        ...configuration,
        CERTIFICATE_ARN: arn
      })
    ).toThrow(/ACM certificate ARN/);
  });
});
