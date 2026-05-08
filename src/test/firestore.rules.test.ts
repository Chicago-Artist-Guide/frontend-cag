// @vitest-environment node
//
// Firestore security rules tests. These run against the firestore emulator
// (started by `npm run test:rules`) — they will not run under the default
// `npm run test` (excluded in vite.config.ts) because they require the
// emulator + Java.
//
// Coverage focus:
// - The DEV-496 rules change (productions public-read, accounts public-read
//   only when type == 'company') with explicit deny tests for the cases
//   that would leak data if regressed.
// - Regression tests for collections we did NOT change (auth users still
//   read profiles, owners still write their own productions, etc.).

import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import * as fs from 'node:fs';
import * as path from 'node:path';

const PROJECT_ID = 'cag-rules-tests';
const RULES_PATH = path.resolve(__dirname, '../../firestore.rules');

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: fs.readFileSync(RULES_PATH, 'utf8'),
      host: '127.0.0.1',
      port: 8080
    }
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

// Seed helpers run with rules disabled so we can stage data without
// being blocked by the rules under test. The emulator-context Firestore
// is technically a v9 Lite Firestore; `any` keeps the surface usable
// without dragging Lite types into every helper signature.
type AnyFirestore = ReturnType<
  ReturnType<typeof testEnv.authenticatedContext>['firestore']
>;

const seed = (work: (db: AnyFirestore) => Promise<void>) =>
  testEnv.withSecurityRulesDisabled((ctx) => work(ctx.firestore()));

const unauth = () => testEnv.unauthenticatedContext().firestore();
const asUser = (uid: string) =>
  testEnv.authenticatedContext(uid).firestore();

describe('accounts collection', () => {
  it('unauthenticated user CAN read a company account (DEV-496)', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'company-1'), {
        uid: 'company-1',
        type: 'company',
        theater_name: 'Acme Theatre'
      });
    });

    await assertSucceeds(getDoc(doc(unauth(), 'accounts', 'company-1')));
  });

  it('unauthenticated user CANNOT read an individual account (privacy)', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'individual-1'), {
        uid: 'individual-1',
        type: 'individual',
        email: 'private@example.com'
      });
    });

    await assertFails(getDoc(doc(unauth(), 'accounts', 'individual-1')));
  });

  it('unauthenticated user CANNOT read an account without an explicit type', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'no-type'), { uid: 'no-type' });
    });

    await assertFails(getDoc(doc(unauth(), 'accounts', 'no-type')));
  });

  it('authenticated user CAN read any account (regression)', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'individual-1'), {
        uid: 'individual-1',
        type: 'individual'
      });
      await setDoc(doc(db, 'accounts', 'company-1'), {
        uid: 'company-1',
        type: 'company'
      });
    });

    const db = asUser('viewer');
    await assertSucceeds(getDoc(doc(db, 'accounts', 'individual-1')));
    await assertSucceeds(getDoc(doc(db, 'accounts', 'company-1')));
  });

  it('owner CAN update their own account', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'owner-1'), {
        uid: 'owner-1',
        type: 'individual',
        first_name: 'Old'
      });
    });

    await assertSucceeds(
      updateDoc(doc(asUser('owner-1'), 'accounts', 'owner-1'), {
        first_name: 'New'
      })
    );
  });

  it('owner CANNOT change their account type (prevents privacy escalation)', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'owner-1'), {
        uid: 'owner-1',
        type: 'individual',
        email: 'private@example.com'
      });
    });

    // The whole point of the type-spoof check: an individual account turning
    // itself into a 'company' would become world-readable, leaking email and
    // any other personal fields.
    await assertFails(
      updateDoc(doc(asUser('owner-1'), 'accounts', 'owner-1'), {
        type: 'company'
      })
    );
  });

  it('admin CANNOT change account type either', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'owner-1'), {
        uid: 'owner-1',
        type: 'individual'
      });
      await setDoc(doc(db, 'admin_users', 'admin-1'), { role: 'admin' });
    });

    await assertFails(
      updateDoc(doc(asUser('admin-1'), 'accounts', 'owner-1'), {
        type: 'company'
      })
    );
  });

  it('non-owner CANNOT update someone else\'s account', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'owner-1'), {
        uid: 'owner-1',
        type: 'individual'
      });
    });

    await assertFails(
      updateDoc(doc(asUser('attacker'), 'accounts', 'owner-1'), {
        first_name: 'Hacked'
      })
    );
  });
});

describe('productions collection', () => {
  it('unauthenticated user CAN read a production (DEV-496)', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'productions', 'prod-1'), {
        production_id: 'prod-1',
        production_name: 'Hamlet',
        account_id: 'company-1',
        status: 'Casting'
      });
    });

    await assertSucceeds(getDoc(doc(unauth(), 'productions', 'prod-1')));
  });

  it('authenticated user CAN read a production (regression)', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'productions', 'prod-1'), {
        production_id: 'prod-1',
        account_id: 'company-1'
      });
    });

    await assertSucceeds(
      getDoc(doc(asUser('any-user'), 'productions', 'prod-1'))
    );
  });

  it('owner CAN create a production with their own account_id', async () => {
    await assertSucceeds(
      setDoc(doc(asUser('company-1'), 'productions', 'prod-new'), {
        production_id: 'prod-new',
        production_name: 'New Show',
        account_id: 'company-1'
      })
    );
  });

  it('user CANNOT create a production with someone else\'s account_id', async () => {
    await assertFails(
      setDoc(doc(asUser('attacker'), 'productions', 'prod-evil'), {
        production_id: 'prod-evil',
        account_id: 'company-1'
      })
    );
  });

  it('non-owner CANNOT update someone else\'s production', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'productions', 'prod-1'), {
        production_id: 'prod-1',
        account_id: 'company-1'
      });
    });

    await assertFails(
      updateDoc(doc(asUser('attacker'), 'productions', 'prod-1'), {
        production_name: 'Hacked'
      })
    );
  });

  it('unauthenticated user CANNOT write a production', async () => {
    await assertFails(
      setDoc(doc(unauth(), 'productions', 'prod-anon'), {
        production_id: 'prod-anon',
        account_id: 'anyone'
      })
    );
  });
});

describe('profiles collection (must stay auth-gated)', () => {
  it('unauthenticated user CANNOT read any profile', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'profiles', 'profile-individual'), {
        uid: 'individual-1',
        first_name: 'Jane',
        gender_identity: 'private',
        ethnicities: ['private']
      });
      await setDoc(doc(db, 'profiles', 'profile-company'), {
        uid: 'company-1',
        theatre_name: 'Acme'
      });
    });

    await assertFails(
      getDoc(doc(unauth(), 'profiles', 'profile-individual'))
    );
    // Even company profiles stay auth-gated — rules cannot cheaply
    // distinguish company profiles from individual ones.
    await assertFails(getDoc(doc(unauth(), 'profiles', 'profile-company')));
  });

  it('authenticated user CAN read profiles (regression — talent matching)', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'profiles', 'profile-1'), {
        uid: 'individual-1',
        first_name: 'Jane'
      });
    });

    await assertSucceeds(
      getDoc(doc(asUser('viewer'), 'profiles', 'profile-1'))
    );
  });

  it('owner CAN update their own profile', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'profiles', 'profile-1'), {
        uid: 'owner-1',
        first_name: 'Old'
      });
    });

    await assertSucceeds(
      updateDoc(doc(asUser('owner-1'), 'profiles', 'profile-1'), {
        first_name: 'New'
      })
    );
  });

  it('non-owner CANNOT update someone else\'s profile', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'profiles', 'profile-1'), {
        uid: 'owner-1'
      });
    });

    await assertFails(
      updateDoc(doc(asUser('attacker'), 'profiles', 'profile-1'), {
        first_name: 'Hacked'
      })
    );
  });
});

describe('events collection (regression — was already public)', () => {
  it('unauthenticated user CAN read events', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'events', 'event-1'), {
        title: 'Public Event'
      });
    });

    await assertSucceeds(getDoc(doc(unauth(), 'events', 'event-1')));
  });
});

describe('default deny', () => {
  it('unauthenticated user CANNOT read an unmapped collection', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'random_secret_collection', 'doc-1'), {
        secret: 'value'
      });
    });

    await assertFails(
      getDoc(doc(unauth(), 'random_secret_collection', 'doc-1'))
    );
  });

  it('authenticated user CANNOT read an unmapped collection', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'random_secret_collection', 'doc-1'), {
        secret: 'value'
      });
    });

    await assertFails(
      getDoc(doc(asUser('any-user'), 'random_secret_collection', 'doc-1'))
    );
  });
});
