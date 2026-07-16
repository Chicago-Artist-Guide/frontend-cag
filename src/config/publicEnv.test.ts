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
      lglApiKey: 'lgl-key'
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

  it('disables development-only behavior in production', () => {
    const config = createPublicConfig({ NODE_ENV: 'production' });

    expect(config.isDevelopment).toBe(false);
  });
});
