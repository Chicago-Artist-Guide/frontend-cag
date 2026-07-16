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
}

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
    lglApiKey: valueOrEmpty(environment.NEXT_PUBLIC_LGL_API_KEY)
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
  NODE_ENV: process.env.NODE_ENV
});

export const firebaseClientConfig = publicConfig.firebase;
export const isDevelopment = publicConfig.isDevelopment;
