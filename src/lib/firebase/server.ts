import { getApp, getApps, initializeApp } from 'firebase/app';
import type { FirebaseApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import type { Firestore } from 'firebase/firestore';
import { firebaseClientConfig } from '../../config/publicEnv';

// Server-side Firestore for PUBLIC collection reads only.
//
// `productions` and `events` are `allow read: if true` in firestore.rules, so
// Server Components can read them with the same public web config the browser
// uses — no service account, no Firebase Admin SDK, no credentials in the
// container. This is deliberate: it keeps the "no service-account credentials"
// decision from the migration design intact while still giving us real SSR on
// the public pages.
//
// Do NOT use this for any collection that requires auth (accounts, profiles,
// threads, messages, admin_users). There is no request identity here, so those
// reads would be denied by rules — and if they ever weren't, that would be a
// data leak. Authenticated data stays in the browser behind
// `src/lib/firebase/client.ts` until server sessions exist.
//
// A named app keeps this instance separate from the browser's `[DEFAULT]` app
// so the two never share connection state.
const SERVER_APP_NAME = 'cag-server';

let serverFirestore: Firestore | null = null;

export const getServerFirestore = (): Firestore => {
  if (typeof window !== 'undefined') {
    throw new Error(
      'getServerFirestore is server-only; use getFirebaseClient in the browser'
    );
  }

  if (serverFirestore) {
    return serverFirestore;
  }

  const app: FirebaseApp = getApps().some(
    ({ name }) => name === SERVER_APP_NAME
  )
    ? getApp(SERVER_APP_NAME)
    : initializeApp(firebaseClientConfig, SERVER_APP_NAME);

  serverFirestore = getFirestore(app);

  return serverFirestore;
};
