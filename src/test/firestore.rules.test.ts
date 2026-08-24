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
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
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
const asUser = (uid: string) => testEnv.authenticatedContext(uid).firestore();

describe('accounts collection', () => {
  // DEV-496 originally opened company accounts to public read so the unauth
  // /roles page could resolve theatre names. That leaked the `email` field
  // (set during company signup). The page now omits theatre attribution
  // entirely; both individual and company accounts stay auth-gated.
  it('unauthenticated user CANNOT read a company account (no email leak)', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'company-1'), {
        uid: 'company-1',
        type: 'company',
        email: 'company@example.com',
        theater_name: 'Acme Theatre'
      });
    });

    await assertFails(getDoc(doc(unauth(), 'accounts', 'company-1')));
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

  it("non-owner CANNOT update someone else's account", async () => {
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

  it("user CANNOT create a production with someone else's account_id", async () => {
    await assertFails(
      setDoc(doc(asUser('attacker'), 'productions', 'prod-evil'), {
        production_id: 'prod-evil',
        account_id: 'company-1'
      })
    );
  });

  it("non-owner CANNOT update someone else's production", async () => {
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

    await assertFails(getDoc(doc(unauth(), 'profiles', 'profile-individual')));
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

  it("non-owner CANNOT update someone else's profile", async () => {
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

describe('threads collection', () => {
  // Thread docs store theater_account_id / talent_account_id as
  // DocumentReferences into `accounts` (see Messages/api.ts
  // createMessageThread) — account doc IDs are auto-generated and
  // distinct from the owning user's auth uid, so these seeds mirror that
  // by giving the account doc a different ID than its `uid` field.
  const seedAccountsAndThread = () =>
    seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'theater-acct-doc'), {
        uid: 'theater-auth-uid',
        type: 'company'
      });
      await setDoc(doc(db, 'accounts', 'talent-acct-doc'), {
        uid: 'talent-auth-uid',
        type: 'individual'
      });
      await setDoc(doc(db, 'threads', 'thread-1'), {
        theater_account_id: doc(db, 'accounts', 'theater-acct-doc'),
        talent_account_id: doc(db, 'accounts', 'talent-acct-doc'),
        theater_status: 'new',
        talent_status: 'new',
        last_message: { content: 'hello' }
      });
    });

  it('theater participant CAN update an existing thread (regression for the participants/created_by bug)', async () => {
    await seedAccountsAndThread();

    await assertSucceeds(
      updateDoc(doc(asUser('theater-auth-uid'), 'threads', 'thread-1'), {
        last_message: { content: 'updated' }
      })
    );
  });

  it('talent participant CAN update an existing thread', async () => {
    await seedAccountsAndThread();

    await assertSucceeds(
      updateDoc(doc(asUser('talent-auth-uid'), 'threads', 'thread-1'), {
        talent_status: 'read'
      })
    );
  });

  it('non-participant CANNOT read or update a thread', async () => {
    await seedAccountsAndThread();

    await assertFails(getDoc(doc(asUser('attacker'), 'threads', 'thread-1')));
    await assertFails(
      updateDoc(doc(asUser('attacker'), 'threads', 'thread-1'), {
        last_message: { content: 'hacked' }
      })
    );
  });

  it('a participant CAN create a new thread referencing both accounts', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'theater-acct-doc'), {
        uid: 'theater-auth-uid',
        type: 'company'
      });
      await setDoc(doc(db, 'accounts', 'talent-acct-doc'), {
        uid: 'talent-auth-uid',
        type: 'individual'
      });
    });

    const db = asUser('theater-auth-uid');
    await assertSucceeds(
      setDoc(doc(db, 'threads', 'thread-new'), {
        theater_account_id: doc(db, 'accounts', 'theater-acct-doc'),
        talent_account_id: doc(db, 'accounts', 'talent-acct-doc'),
        theater_status: 'new',
        talent_status: 'new'
      })
    );
  });

  it('a non-participant CANNOT create a thread for two other accounts', async () => {
    await seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'theater-acct-doc'), {
        uid: 'theater-auth-uid',
        type: 'company'
      });
      await setDoc(doc(db, 'accounts', 'talent-acct-doc'), {
        uid: 'talent-auth-uid',
        type: 'individual'
      });
    });

    const db = asUser('attacker');
    await assertFails(
      setDoc(doc(db, 'threads', 'thread-evil'), {
        theater_account_id: doc(db, 'accounts', 'theater-acct-doc'),
        talent_account_id: doc(db, 'accounts', 'talent-acct-doc')
      })
    );
  });
});

describe('messages collection', () => {
  // Message docs store sender_id / recipient_id as DocumentReferences
  // into `accounts` (see Messages/api.ts createMessageThread), same
  // account-doc-id-vs-auth-uid distinction as threads above.
  const seedAccountsAndMessage = () =>
    seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'sender-acct-doc'), {
        uid: 'sender-auth-uid',
        type: 'company'
      });
      await setDoc(doc(db, 'accounts', 'recipient-acct-doc'), {
        uid: 'recipient-auth-uid',
        type: 'individual'
      });
      await setDoc(doc(db, 'messages', 'message-1'), {
        sender_id: doc(db, 'accounts', 'sender-acct-doc'),
        recipient_id: doc(db, 'accounts', 'recipient-acct-doc'),
        content: 'hi',
        status: 'new'
      });
    });

  it('sender CAN update an existing message (e.g. backfilling thread_id — regression for the sender_id/recipients bug)', async () => {
    await seedAccountsAndMessage();

    await assertSucceeds(
      updateDoc(doc(asUser('sender-auth-uid'), 'messages', 'message-1'), {
        thread_id: 'thread-1'
      })
    );
  });

  it('recipient CAN read and update an existing message', async () => {
    await seedAccountsAndMessage();

    await assertSucceeds(
      getDoc(doc(asUser('recipient-auth-uid'), 'messages', 'message-1'))
    );
    await assertSucceeds(
      updateDoc(doc(asUser('recipient-auth-uid'), 'messages', 'message-1'), {
        status: 'read'
      })
    );
  });

  it('non-participant CANNOT read or update a message', async () => {
    await seedAccountsAndMessage();

    await assertFails(getDoc(doc(asUser('attacker'), 'messages', 'message-1')));
    await assertFails(
      updateDoc(doc(asUser('attacker'), 'messages', 'message-1'), {
        status: 'read'
      })
    );
  });

  const seedThreadWithMessage = () =>
    seed(async (db) => {
      await setDoc(doc(db, 'accounts', 'theater-acct-doc'), {
        uid: 'theater-auth-uid',
        type: 'company'
      });
      await setDoc(doc(db, 'accounts', 'talent-acct-doc'), {
        uid: 'talent-auth-uid',
        type: 'individual'
      });
      await setDoc(doc(db, 'threads', 'thread-1'), {
        theater_account_id: doc(db, 'accounts', 'theater-acct-doc'),
        talent_account_id: doc(db, 'accounts', 'talent-acct-doc')
      });
      await setDoc(doc(db, 'messages', 'message-1'), {
        sender_id: doc(db, 'accounts', 'theater-acct-doc'),
        recipient_id: doc(db, 'accounts', 'talent-acct-doc'),
        thread_id: doc(db, 'threads', 'thread-1'),
        content: 'hi',
        status: 'new'
      });
    });

  it('theater participant CAN query messages by thread_id (needed to open a conversation)', async () => {
    await seedThreadWithMessage();

    const db = asUser('theater-auth-uid');
    await assertSucceeds(
      getDocs(
        query(
          collection(db, 'messages'),
          where('thread_id', '==', doc(db, 'threads', 'thread-1'))
        )
      )
    );
  });

  it('non-participant CANNOT query messages by thread_id', async () => {
    await seedThreadWithMessage();

    const db = asUser('attacker');
    await assertFails(
      getDocs(
        query(
          collection(db, 'messages'),
          where('thread_id', '==', doc(db, 'threads', 'thread-1'))
        )
      )
    );
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
