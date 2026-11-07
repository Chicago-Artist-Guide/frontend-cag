import { createPublicConfig } from './publicEnv';

describe('createPublicConfig', () => {
  it('maps public values and derives Firebase hostnames', () => {
    const config = createPublicConfig({
      NEXT_PUBLIC_FIREBASE_API_KEY: 'api-key',
      NEXT_PUBLIC_FIREBASE_APP_ID: 'app-id',
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'measurement-id',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'cag-staging',
      NEXT_PUBLIC_FIREBASE_SENDER_ID: 'sender-id',
      NEXT_PUBLIC_LGL_API_KEY: 'lgl-key',
      NEXT_PUBLIC_SITE_URL: 'https://staging.chicagoartistguide.org',
      NEXT_PUBLIC_ZEFFY_DONATION_URL: 'https://www.zeffy.com/en-US/example',
      NODE_ENV: 'development'
    });

    expect(config).toEqual({
      firebase: {
        apiKey: 'api-key',
        appId: 'app-id',
        authDomain: 'cag-staging.firebaseapp.com',
        measurementId: 'measurement-id',
        messagingSenderId: 'sender-id',
        projectId: 'cag-staging',
        storageBucket: 'cag-staging.appspot.com'
      },
      isDevelopment: true,
      lglApiKey: 'lgl-key',
      siteUrl: 'https://staging.chicagoartistguide.org',
      zeffyDonationUrl: 'https://www.zeffy.com/en-US/example'
    });
  });

  it('uses empty strings when public configuration is absent', () => {
    const config = createPublicConfig({ NODE_ENV: 'test' });

    expect(config.firebase).toEqual({
      apiKey: '',
      appId: '',
      authDomain: '',
      measurementId: '',
      messagingSenderId: '',
      projectId: '',
      storageBucket: ''
    });
    expect(config.lglApiKey).toBe('');
  });

  it('falls back to the production origin when NEXT_PUBLIC_SITE_URL is unset', () => {
    const config = createPublicConfig({ NODE_ENV: 'test' });

    expect(config.siteUrl).toBe('https://www.chicagoartistguide.org');
  });

  it('falls back to the current Zeffy campaign when NEXT_PUBLIC_ZEFFY_DONATION_URL is unset', () => {
    const config = createPublicConfig({ NODE_ENV: 'test' });

    expect(config.zeffyDonationUrl).toBe(
      'https://www.zeffy.com/en-US/donation-form/2026-cag-end-of-year-fundraiser'
    );
  });

  it('disables development-only behavior in production', () => {
    const config = createPublicConfig({ NODE_ENV: 'production' });

    expect(config.isDevelopment).toBe(false);
  });
});
