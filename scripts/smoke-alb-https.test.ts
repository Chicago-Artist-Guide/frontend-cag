import { createAlbHttpsFetch } from './smoke-alb-https.mjs';

const hostname = 'cag-load-123.us-east-1.elb.amazonaws.com';

describe('pre-DNS HTTPS transport', () => {
  it('rejects non-ALB destinations', () => {
    expect(() =>
      createAlbHttpsFetch('https://www.chicagoartistguide.org', 'evil.test')
    ).toThrow(/ALB hostname/);
  });

  it('rejects HTTP and credential-bearing origins', () => {
    expect(() => createAlbHttpsFetch('http://example.org', hostname)).toThrow(
      /HTTPS origin/
    );
    expect(() =>
      createAlbHttpsFetch('https://user:password@example.org', hostname)
    ).toThrow(/HTTPS origin/);
  });

  it('refuses requests to another origin that could hit old production', async () => {
    const fetch = createAlbHttpsFetch(
      'https://www.chicagoartistguide.org',
      hostname
    );
    await expect(
      fetch(new URL('https://chicagoartistguide.org/home'))
    ).rejects.toThrow(/origin/);
  });
});
