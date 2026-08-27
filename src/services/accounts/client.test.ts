import type { AccountData, AccountDto, Unsubscribe } from './types';

const firebaseMocks = vi.hoisted(() => ({
  accountsRef: { path: 'accounts' },
  profilesRef: { path: 'profiles' },
  addDoc: vi.fn(),
  collection: vi.fn(),
  doc: vi.fn(),
  firestore: { type: 'firestore' },
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  getFirebaseClient: vi.fn(),
  limit: vi.fn(),
  onSnapshot: vi.fn(),
  or: vi.fn(),
  query: vi.fn(),
  updateDoc: vi.fn(),
  where: vi.fn()
}));

vi.mock('../../lib/firebase/client', () => ({
  getFirebaseClient: firebaseMocks.getFirebaseClient
}));

vi.mock('firebase/firestore', () => ({
  addDoc: firebaseMocks.addDoc,
  collection: firebaseMocks.collection,
  doc: firebaseMocks.doc,
  getDoc: firebaseMocks.getDoc,
  getDocs: firebaseMocks.getDocs,
  limit: firebaseMocks.limit,
  onSnapshot: firebaseMocks.onSnapshot,
  or: firebaseMocks.or,
  query: firebaseMocks.query,
  updateDoc: firebaseMocks.updateDoc,
  where: firebaseMocks.where
}));

const account = {
  email: 'jane@example.com',
  first_name: 'Jane',
  last_name: 'Doe',
  type: 'individual',
  uid: 'auth-jane'
} as const;

const existingSnapshot = <TData extends AccountData>(
  id: string,
  data: TData
) => ({
  data: () => data,
  exists: () => true,
  id
});

const missingSnapshot = (id: string) => ({
  data: vi.fn(),
  exists: () => false,
  id
});

const loadClient = () => import('./client');

describe('account client service', () => {
  beforeEach(() => {
    vi.resetModules();

    for (const mock of Object.values(firebaseMocks)) {
      if (typeof mock === 'function' && 'mockReset' in mock) {
        mock.mockReset();
      }
    }

    firebaseMocks.getFirebaseClient.mockReturnValue({
      firestore: firebaseMocks.firestore
    });
    firebaseMocks.collection.mockImplementation((_db, name) =>
      name === 'profiles' ? firebaseMocks.profilesRef : firebaseMocks.accountsRef
    );
    firebaseMocks.doc.mockImplementation((_accountsRef, accountId) => ({
      accountId,
      path: `accounts/${accountId}`
    }));
    firebaseMocks.where.mockImplementation((field, operator, value) => ({
      field,
      operator,
      value
    }));
    firebaseMocks.limit.mockImplementation((count) => ({ count }));
    firebaseMocks.or.mockImplementation((...clauses) => ({ or: clauses }));
    firebaseMocks.query.mockImplementation((accountsRef, ...constraints) => ({
      accountsRef,
      constraints
    }));
  });

  it('exports the unsubscribe contract from the public types module', () => {
    expectTypeOf<Unsubscribe>().toEqualTypeOf<() => void>();
  });

  it('performs no Firebase work when the module is imported', async () => {
    await loadClient();

    expect(firebaseMocks.getFirebaseClient).not.toHaveBeenCalled();
    expect(firebaseMocks.collection).not.toHaveBeenCalled();
    expect(firebaseMocks.doc).not.toHaveBeenCalled();
    expect(firebaseMocks.query).not.toHaveBeenCalled();
  });

  describe('getAccountById', () => {
    it('maps an existing account document to a DTO', async () => {
      firebaseMocks.getDoc.mockResolvedValue(
        existingSnapshot('account-1', account)
      );
      const { getAccountById } = await loadClient();

      const result = await getAccountById<typeof account>('account-1');

      expect(result).toEqual({ data: account, id: 'account-1' });
      expect(firebaseMocks.getFirebaseClient).toHaveBeenCalledOnce();
      expect(firebaseMocks.collection).toHaveBeenCalledWith(
        firebaseMocks.firestore,
        'accounts'
      );
      expect(firebaseMocks.doc).toHaveBeenCalledWith(
        firebaseMocks.accountsRef,
        'account-1'
      );
    });

    it('maps a missing account document to null', async () => {
      firebaseMocks.getDoc.mockResolvedValue(missingSnapshot('missing'));
      const { getAccountById } = await loadClient();

      await expect(getAccountById('missing')).resolves.toBeNull();
    });

    it('propagates direct-read failures', async () => {
      const failure = new Error('direct read failed');
      firebaseMocks.getDoc.mockRejectedValue(failure);
      const { getAccountById } = await loadClient();

      await expect(getAccountById('account-1')).rejects.toBe(failure);
    });
  });

  describe('findAccountByUid', () => {
    it('queries by UID with an exact one-document limit and maps the first DTO', async () => {
      const snapshot = existingSnapshot('account-1', account);
      firebaseMocks.getDocs.mockResolvedValue({
        docs: [snapshot],
        empty: false
      });
      const { findAccountByUid } = await loadClient();

      const result = await findAccountByUid<typeof account>('auth-jane');

      expect(result).toEqual({ data: account, id: 'account-1' });
      expect(firebaseMocks.where).toHaveBeenCalledOnce();
      expect(firebaseMocks.where).toHaveBeenCalledWith(
        'uid',
        '==',
        'auth-jane'
      );
      expect(firebaseMocks.limit).toHaveBeenCalledOnce();
      expect(firebaseMocks.limit).toHaveBeenCalledWith(1);
      expect(firebaseMocks.query).toHaveBeenCalledWith(
        firebaseMocks.accountsRef,
        { field: 'uid', operator: '==', value: 'auth-jane' },
        { count: 1 }
      );
    });

    it('maps an empty UID query to null', async () => {
      firebaseMocks.getDocs.mockResolvedValue({ docs: [], empty: true });
      const { findAccountByUid } = await loadClient();

      await expect(findAccountByUid('missing')).resolves.toBeNull();
    });

    it('propagates UID-query failures', async () => {
      const failure = new Error('query failed');
      firebaseMocks.getDocs.mockRejectedValue(failure);
      const { findAccountByUid } = await loadClient();

      await expect(findAccountByUid('auth-jane')).rejects.toBe(failure);
    });
  });

  describe('getAccountByIdOrUid', () => {
    it('returns a direct-ID match without issuing a UID query', async () => {
      firebaseMocks.getDoc.mockResolvedValue(
        existingSnapshot('account-1', account)
      );
      const { getAccountByIdOrUid } = await loadClient();

      await expect(getAccountByIdOrUid('account-1')).resolves.toEqual({
        data: account,
        id: 'account-1'
      });
      expect(firebaseMocks.getDocs).not.toHaveBeenCalled();
      expect(firebaseMocks.query).not.toHaveBeenCalled();
    });

    it('falls back to the UID query only after a missing direct-ID read', async () => {
      const uidSnapshot = existingSnapshot('account-1', account);
      firebaseMocks.getDoc.mockResolvedValue(missingSnapshot('auth-jane'));
      firebaseMocks.getDocs.mockResolvedValue({
        docs: [uidSnapshot],
        empty: false
      });
      const { getAccountByIdOrUid } = await loadClient();

      await expect(getAccountByIdOrUid('auth-jane')).resolves.toEqual({
        data: account,
        id: 'account-1'
      });
      expect(firebaseMocks.getDoc).toHaveBeenCalledOnce();
      expect(firebaseMocks.getDocs).toHaveBeenCalledOnce();
    });

    it('propagates a rejected direct-ID read without issuing a UID query', async () => {
      const failure = new Error('permission denied');
      firebaseMocks.getDoc.mockRejectedValue(failure);
      const { getAccountByIdOrUid } = await loadClient();

      await expect(getAccountByIdOrUid('auth-jane')).rejects.toBe(failure);
      expect(firebaseMocks.getDocs).not.toHaveBeenCalled();
      expect(firebaseMocks.query).not.toHaveBeenCalled();
    });
  });

  describe('writes', () => {
    it('creates with the exact input payload and returns it without rereading', async () => {
      const sentinel = Object.freeze({ type: 'server-timestamp' });
      const data = Object.freeze({
        ...account,
        created_at: sentinel
      });
      firebaseMocks.addDoc.mockResolvedValue({ id: 'new-account' });
      const { createAccount } = await loadClient();

      const result = await createAccount(data);

      expect(result).toEqual({ data, id: 'new-account' });
      expect(result.data).toBe(data);
      expect(firebaseMocks.addDoc).toHaveBeenCalledWith(
        firebaseMocks.accountsRef,
        data
      );
      expect(firebaseMocks.addDoc.mock.calls[0][1]).toBe(data);
      expect(firebaseMocks.getDoc).not.toHaveBeenCalled();
    });

    it('updates with the exact patch payload and does not mutate sentinels', async () => {
      const sentinel = Object.freeze({ type: 'delete-field' });
      const patch = Object.freeze({ updated_at: sentinel });
      firebaseMocks.updateDoc.mockResolvedValue(undefined);
      const { updateAccount } = await loadClient();

      await expect(updateAccount('account-1', patch)).resolves.toBeUndefined();
      expect(firebaseMocks.updateDoc).toHaveBeenCalledWith(
        { accountId: 'account-1', path: 'accounts/account-1' },
        patch
      );
      expect(firebaseMocks.updateDoc.mock.calls[0][1]).toBe(patch);
    });

    it('propagates write failures', async () => {
      const createFailure = new Error('create failed');
      const updateFailure = new Error('update failed');
      firebaseMocks.addDoc.mockRejectedValue(createFailure);
      firebaseMocks.updateDoc.mockRejectedValue(updateFailure);
      const { createAccount, updateAccount } = await loadClient();

      await expect(createAccount(account)).rejects.toBe(createFailure);
      await expect(updateAccount('account-1', {})).rejects.toBe(updateFailure);
    });
  });

  describe('subscribeToAccount', () => {
    it('maps existing and deleted snapshots and returns the exact unsubscribe', async () => {
      const unsubscribe = vi.fn();
      firebaseMocks.onSnapshot.mockReturnValue(unsubscribe);
      const onChange =
        vi.fn<(value: AccountDto<typeof account> | null) => void>();
      const onError = vi.fn();
      const { subscribeToAccount } = await loadClient();

      const result = subscribeToAccount<typeof account>(
        'account-1',
        onChange,
        onError
      );
      const [, next] = firebaseMocks.onSnapshot.mock.calls[0];
      next(existingSnapshot('account-1', account));
      next(missingSnapshot('account-1'));

      expect(onChange).toHaveBeenNthCalledWith(1, {
        data: account,
        id: 'account-1'
      });
      expect(onChange).toHaveBeenNthCalledWith(2, null);
      expect(result).toBe(unsubscribe);
    });

    it('forwards subscription errors unchanged', async () => {
      const failure = new Error('listen failed');
      const onError = vi.fn();
      firebaseMocks.onSnapshot.mockReturnValue(vi.fn());
      const { subscribeToAccount } = await loadClient();

      subscribeToAccount('account-1', vi.fn(), onError);
      const [, , error] = firebaseMocks.onSnapshot.mock.calls[0];
      error(failure);

      expect(onError).toHaveBeenCalledWith(failure);
    });

    it('supports subscriptions without an error callback', async () => {
      firebaseMocks.onSnapshot.mockReturnValue(vi.fn());
      const { subscribeToAccount } = await loadClient();

      expect(() => subscribeToAccount('account-1', vi.fn())).not.toThrow();
    });
  });

  describe('display names', () => {
    it('returns a full individual name only when both names are present', async () => {
      firebaseMocks.getDoc.mockResolvedValue(
        existingSnapshot('account-1', account)
      );
      const { getAccountDisplayName } = await loadClient();

      await expect(getAccountDisplayName('account-1')).resolves.toBe(
        'Jane Doe'
      );
    });

    it.each([
      [{ ...account, first_name: '' }, 'account-1'],
      [{ ...account, last_name: undefined }, 'auth-jane']
    ])(
      'falls back for partial or empty names',
      async (partialAccount, input) => {
        firebaseMocks.getDoc.mockResolvedValue(
          existingSnapshot('account-1', partialAccount)
        );
        const { getAccountDisplayName } = await loadClient();

        await expect(getAccountDisplayName(input)).resolves.toBe(
          `User ${input}`
        );
      }
    );

    it('returns Profile N/A when the account is missing', async () => {
      firebaseMocks.getDoc.mockResolvedValue(missingSnapshot('missing'));
      firebaseMocks.getDocs.mockResolvedValue({ docs: [], empty: true });
      const { getAccountDisplayName } = await loadClient();

      await expect(getAccountDisplayName('missing')).resolves.toBe(
        'Profile N/A'
      );
    });

    it('propagates account lookup failures', async () => {
      const failure = new Error('lookup failed');
      firebaseMocks.getDoc.mockRejectedValue(failure);
      const { getAccountDisplayName } = await loadClient();

      await expect(getAccountDisplayName('account-1')).rejects.toBe(failure);
    });

    it('looks theaters up by doc id and returns their theater name when no profile exists', async () => {
      firebaseMocks.getDoc.mockResolvedValue(
        existingSnapshot('company-account', {
          theater_name: 'The Lookingglass',
          type: 'company',
          uid: 'auth-company'
        })
      );
      firebaseMocks.getDocs.mockResolvedValue({ docs: [], empty: true });
      const { getTheaterDisplayNameByUid } = await loadClient();

      await expect(
        getTheaterDisplayNameByUid('company-account')
      ).resolves.toBe('The Lookingglass');
      expect(firebaseMocks.getDoc).toHaveBeenCalledOnce();
    });

    it('prefers the profile theatre_name over the account theater_name', async () => {
      firebaseMocks.getDoc.mockResolvedValue(
        existingSnapshot('company-account', {
          theater_name: 'Account Name',
          type: 'company',
          uid: 'auth-company'
        })
      );
      firebaseMocks.getDocs.mockImplementation(async (builtQuery) =>
        builtQuery.accountsRef === firebaseMocks.profilesRef
          ? {
              docs: [
                existingSnapshot('profile-1', {
                  theatre_name: 'Goodman Theatre'
                })
              ],
              empty: false
            }
          : { docs: [], empty: true }
      );
      const { getTheaterDisplayNameByUid } = await loadClient();

      await expect(
        getTheaterDisplayNameByUid('company-account')
      ).resolves.toBe('Goodman Theatre');
    });

    it('falls back to a uid query when the account doc id does not exist', async () => {
      firebaseMocks.getDoc.mockResolvedValue(missingSnapshot('auth-company'));
      firebaseMocks.getDocs.mockImplementation(async (builtQuery) =>
        builtQuery.accountsRef === firebaseMocks.profilesRef
          ? { docs: [], empty: true }
          : {
              docs: [
                existingSnapshot('company-account', {
                  theater_name: 'Chicago Shakespeare',
                  type: 'company',
                  uid: 'auth-company'
                })
              ],
              empty: false
            }
      );
      const { getTheaterDisplayNameByUid } = await loadClient();

      await expect(getTheaterDisplayNameByUid('auth-company')).resolves.toBe(
        'Chicago Shakespeare'
      );
    });

    it('returns Theatre N/A when a found theater has no theater name', async () => {
      firebaseMocks.getDoc.mockResolvedValue(
        existingSnapshot('company-account', {
          type: 'company',
          uid: 'auth-company'
        })
      );
      firebaseMocks.getDocs.mockResolvedValue({ docs: [], empty: true });
      const { getTheaterDisplayNameByUid } = await loadClient();

      await expect(
        getTheaterDisplayNameByUid('company-account')
      ).resolves.toBe('Theatre N/A');
    });

    it('returns Theatre N/A when neither the account nor profile resolve', async () => {
      firebaseMocks.getDoc.mockResolvedValue(missingSnapshot('missing'));
      firebaseMocks.getDocs.mockResolvedValue({ docs: [], empty: true });
      const { getTheaterDisplayNameByUid } = await loadClient();

      await expect(getTheaterDisplayNameByUid('missing')).resolves.toBe(
        'Theatre N/A'
      );
    });

    it('propagates theater lookup failures', async () => {
      const failure = new Error('theater lookup failed');
      firebaseMocks.getDoc.mockRejectedValue(failure);
      firebaseMocks.getDocs.mockResolvedValue({ docs: [], empty: true });
      const { getTheaterDisplayNameByUid } = await loadClient();

      await expect(getTheaterDisplayNameByUid('auth-company')).rejects.toBe(
        failure
      );
    });
  });
});
