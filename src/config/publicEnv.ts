export type PublicEnvironment = Readonly<Record<string, string | undefined>>;

export interface PublicConfig {
  firebase: {
    apiKey: string;
    appId: string;
    authDomain: string;
    measurementId: string;
    messagingSenderId: string;
    projectId: string;
    storageBucket: string;
  };
  isDevelopment: boolean;
  lglApiKey: string;
  siteUrl: string;
  zeffyDonationUrl: string;
}

// Production origin, used as the fallback when NEXT_PUBLIC_SITE_URL is
// unset — matches the hardcoded OpenGraph image host in app/layout.tsx.
// Preview/staging environments override via the env var so sitemap.xml and
// robots.txt point at their own origin instead of production.
const DEFAULT_SITE_URL = 'https://www.chicagoartistguide.org';

// Current donation campaign, used as the fallback when
// NEXT_PUBLIC_ZEFFY_DONATION_URL is unset. Update the default here when the
// baked-in link becomes the sanctioned one; point environments at a new Zeffy
// form via the env var without a code change.
const DEFAULT_ZEFFY_DONATION_URL =
  'https://www.zeffy.com/en-US/donation-form/2026-cag-end-of-year-fundraiser';

const valueOrEmpty = (value: string | undefined) => value || '';

export const createPublicConfig = (
  environment: PublicEnvironment
): PublicConfig => {
  const projectId = valueOrEmpty(environment.NEXT_PUBLIC_FIREBASE_PROJECT_ID);

  return {
    firebase: {
      apiKey: valueOrEmpty(environment.NEXT_PUBLIC_FIREBASE_API_KEY),
      appId: valueOrEmpty(environment.NEXT_PUBLIC_FIREBASE_APP_ID),
      authDomain: projectId ? `${projectId}.firebaseapp.com` : '',
      measurementId: valueOrEmpty(
        environment.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
      ),
      messagingSenderId: valueOrEmpty(
        environment.NEXT_PUBLIC_FIREBASE_SENDER_ID
      ),
      projectId,
      storageBucket: projectId ? `${projectId}.appspot.com` : ''
    },
    isDevelopment: environment.NODE_ENV !== 'production',
    lglApiKey: valueOrEmpty(environment.NEXT_PUBLIC_LGL_API_KEY),
    siteUrl: environment.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL,
    zeffyDonationUrl:
      environment.NEXT_PUBLIC_ZEFFY_DONATION_URL || DEFAULT_ZEFFY_DONATION_URL
  };
};

export const publicConfig = createPublicConfig({
  NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  NEXT_PUBLIC_FIREBASE_APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  NEXT_PUBLIC_FIREBASE_SENDER_ID: process.env.NEXT_PUBLIC_FIREBASE_SENDER_ID,
  NEXT_PUBLIC_LGL_API_KEY: process.env.NEXT_PUBLIC_LGL_API_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_ZEFFY_DONATION_URL: process.env.NEXT_PUBLIC_ZEFFY_DONATION_URL,
  NODE_ENV: process.env.NODE_ENV
});

export const firebaseClientConfig = publicConfig.firebase;
export const isDevelopment = publicConfig.isDevelopment;
