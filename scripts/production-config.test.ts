import * as productionConfig from './production-config.mjs';
const { validateProductionConfiguration } = productionConfig;

const configuration = {
  CERTIFICATE_ARN:
    'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012',
  NEXT_PUBLIC_SITE_URL: 'https://www.chicagoartistguide.org'
};

describe('production configuration', () => {
  it.each([undefined, ''])(
    'permits a pre-switch deployment without a certificate (%s)',
    (certificate) => {
      expect(
        validateProductionConfiguration({
          ...configuration,
          CERTIFICATE_ARN: certificate
        }).hostname
      ).toBe('www.chicagoartistguide.org');
    }
  );

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

  it.each(['arn:aws:iam::123456789012:role/example', 'certificate/example'])(
    'rejects a malformed certificate %s',
    (arn) => {
      expect(() =>
        validateProductionConfiguration({
          ...configuration,
          CERTIFICATE_ARN: arn
        })
      ).toThrow(/ACM certificate ARN/);
    }
  );
});

describe('production browser destination', () => {
  const alb = 'cag-load-123.us-east-1.elb.amazonaws.com';
  it('uses the new ALB over HTTP when the certificate is absent', () => {
    expect(typeof productionConfig.resolveProductionBrowserOrigin).toBe(
      'function'
    );
    expect(
      productionConfig.resolveProductionBrowserOrigin({
        ...configuration,
        ALB_DNS: alb,
        CERTIFICATE_ARN: ''
      }).origin
    ).toBe(`http://${alb}`);
  });
  it('uses managed prod HTTPS while retaining www as the canonical site', () => {
    expect(
      productionConfig.resolveProductionBrowserOrigin({
        ...configuration,
        ALB_DNS: alb,
        CERTIFICATE_ARN: '',
        APPLICATION_URL: 'https://prod.chicagoartistguide.org'
      }).origin
    ).toBe('https://prod.chicagoartistguide.org');
  });
  it('rejects a staging URL passed to production acceptance', () => {
    expect(() =>
      productionConfig.resolveProductionBrowserOrigin({
        ...configuration,
        ALB_DNS: alb,
        APPLICATION_URL: 'https://staging.chicagoartistguide.org'
      })
    ).toThrow();
  });
  it('uses the public HTTPS origin when a certificate is configured', () => {
    expect(typeof productionConfig.resolveProductionBrowserOrigin).toBe(
      'function'
    );
    expect(
      productionConfig.resolveProductionBrowserOrigin({
        ...configuration,
        ALB_DNS: alb
      }).origin
    ).toBe(configuration.NEXT_PUBLIC_SITE_URL);
  });
  it.each([
    'evil.test',
    'www.chicagoartistguide.org',
    'http://cag-load-123.us-east-1.elb.amazonaws.com',
    `${alb}/path`
  ])('rejects a non-ALB browser destination %s', (hostname) => {
    expect(typeof productionConfig.resolveProductionBrowserOrigin).toBe(
      'function'
    );
    expect(() =>
      productionConfig.resolveProductionBrowserOrigin({
        ...configuration,
        ALB_DNS: hostname,
        CERTIFICATE_ARN: ''
      })
    ).toThrow(/ALB hostname/);
  });
});
