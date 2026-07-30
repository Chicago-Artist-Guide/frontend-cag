import type { Unsubscribe } from '../accounts/types';
import type { ProfileData, ProfileDto, ProfilePatch } from './types';

const firebaseMocks = vi.hoisted(() => ({
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
  profilesRef: { path: 'profiles' },
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

const profile = {
  account_id: 'account-1',
  primary_contact_email: 'jane@example.com',
  ref: { legitimate: true },
  theatre_name: 'Lookingglass Theatre',
  uid: 'auth-jane'
} as const;

const existingSnapshot = <TData extends ProfileData>(
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

describe('profile client service', () => {
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
    firebaseMocks.collection.mockReturnValue(firebaseMocks.profilesRef);
    firebaseMocks.doc.mockImplementation((_profilesRef, profileId) => ({
      path: `profiles/${profileId}`,
      profileId
    }));
    firebaseMocks.where.mockImplementation((field, operator, value) => ({
      field,
      operator,
      value
    }));
    firebaseMocks.limit.mockImplementation((count) => ({ count }));
    firebaseMocks.or.mockImplementation((...constraints) => ({
      constraints,
      type: 'or'
    }));
    firebaseMocks.query.mockImplementation((profilesRef, ...constraints) => ({
      constraints,
      profilesRef
    }));
  });

  it('publishes the requested DTO and patch contracts without Firebase types', () => {
    expectTypeOf<ProfileData>().toMatchTypeOf<{
      account_id: string;
      primary_contact_email?: string;
      profile_image_url?: string;
      theatre_name?: string;
      uid: string;
    }>();
    expectTypeOf<ProfileDto>().toMatchTypeOf<{
      data: ProfileData;
      id: string;
    }>();
    expectTypeOf<ProfilePatch>().toMatchTypeOf<
      Partial<ProfileData> & Record<string, unknown>
    >();
    expectTypeOf<Unsubscribe>().toEqualTypeOf<() => void>();
  });

  it('performs no Firebase work when the module is imported', async () => {
    await loadClient();

    expect(firebaseMocks.getFirebaseClient).not.toHaveBeenCalled();
    expect(firebaseMocks.collection).not.toHaveBeenCalled();
    expect(firebaseMocks.doc).not.toHaveBeenCalled();
    expect(firebaseMocks.query).not.toHaveBeenCalled();
  });

  describe('getProfileById', () => {
    it('maps an existing document to exactly the DTO envelope and preserves data.ref', async () => {
      firebaseMocks.getDoc.mockResolvedValue(
        existingSnapshot('profile-1', profile)
      );
      const { getProfileById } = await loadClient();

      const result = await getProfileById<typeof profile>('profile-1');

      expect(result).toEqual({ data: profile, id: 'profile-1' });
      if (!result) {
        throw new Error('Expected an existing profile DTO');
      }
      expect(Object.keys(result)).toEqual(['data', 'id']);
      expect(result.data.ref).toBe(profile.ref);
      expect(firebaseMocks.collection).toHaveBeenCalledWith(
        firebaseMocks.firestore,
        'profiles'
      );
      expect(firebaseMocks.doc).toHaveBeenCalledWith(
        firebaseMocks.profilesRef,
        'profile-1'
      );
    });

    it('maps a missing document to null and propagates read failures', async () => {
      firebaseMocks.getDoc.mockResolvedValueOnce(missingSnapshot('missing'));
      const { getProfileById } = await loadClient();

      await expect(getProfileById('missing')).resolves.toBeNull();

      const failure = new Error('direct read failed');
      firebaseMocks.getDoc.mockRejectedValueOnce(failure);
      await expect(getProfileById('profile-1')).rejects.toBe(failure);
    });
  });

  describe.each([
    ['findProfileByUid', 'uid', 'auth-jane'],
    ['findProfileByAccountId', 'account_id', 'account-1']
  ] as const)('%s', (exportName, field, value) => {
    it(`queries ${field} by equality with limit one and maps the first result`, async () => {
      firebaseMocks.getDocs.mockResolvedValue({
        docs: [existingSnapshot('profile-1', profile)]
      });
      const client = await loadClient();

      const result = await client[exportName]<typeof profile>(value);

      expect(result).toEqual({ data: profile, id: 'profile-1' });
      expect(firebaseMocks.where).toHaveBeenCalledWith(field, '==', value);
      expect(firebaseMocks.limit).toHaveBeenCalledWith(1);
      expect(firebaseMocks.query).toHaveBeenCalledWith(
        firebaseMocks.profilesRef,
        { field, operator: '==', value },
        { count: 1 }
      );
    });

    it('maps an empty query to null and propagates failures', async () => {
      firebaseMocks.getDocs.mockResolvedValueOnce({ docs: [] });
      const client = await loadClient();

      await expect(client[exportName](value)).resolves.toBeNull();

      const failure = new Error('query failed');
      firebaseMocks.getDocs.mockRejectedValueOnce(failure);
      await expect(client[exportName](value)).rejects.toBe(failure);
    });
  });

  describe('findProfileByUidOrAccountId', () => {
    it('uses one OR query across UID and account ID with limit one', async () => {
      firebaseMocks.getDocs.mockResolvedValue({
        docs: [existingSnapshot('profile-1', profile)]
      });
      const { findProfileByUidOrAccountId } = await loadClient();

      await expect(
        findProfileByUidOrAccountId<typeof profile>('shared-value')
      ).resolves.toEqual({ data: profile, id: 'profile-1' });

      const uidConstraint = {
        field: 'uid',
        operator: '==',
        value: 'shared-value'
      };
      const accountConstraint = {
        field: 'account_id',
        operator: '==',
        value: 'shared-value'
      };
      expect(firebaseMocks.or).toHaveBeenCalledOnce();
      expect(firebaseMocks.or).toHaveBeenCalledWith(
        uidConstraint,
        accountConstraint
      );
      expect(firebaseMocks.query).toHaveBeenCalledOnce();
      expect(firebaseMocks.query).toHaveBeenCalledWith(
        firebaseMocks.profilesRef,
        { constraints: [uidConstraint, accountConstraint], type: 'or' },
        { count: 1 }
      );
      expect(firebaseMocks.getDocs).toHaveBeenCalledOnce();
      expect(firebaseMocks.getDoc).not.toHaveBeenCalled();
    });

    it('maps an empty combined query to null and propagates failures', async () => {
      firebaseMocks.getDocs.mockResolvedValueOnce({ docs: [] });
      const { findProfileByUidOrAccountId } = await loadClient();

      await expect(findProfileByUidOrAccountId('missing')).resolves.toBeNull();

      const failure = new Error('combined query failed');
      firebaseMocks.getDocs.mockRejectedValueOnce(failure);
      await expect(findProfileByUidOrAccountId('value')).rejects.toBe(failure);
    });
  });

  describe('writes', () => {
    it('creates with the exact payload and returns it without rereading', async () => {
      const sentinel = Object.freeze({ type: 'server-timestamp' });
      const data = Object.freeze({ ...profile, created_at: sentinel });
      firebaseMocks.addDoc.mockResolvedValue({ id: 'new-profile' });
      const { createProfile } = await loadClient();

      const result = await createProfile(data);

      expect(result).toEqual({ data, id: 'new-profile' });
      expect(result.data).toBe(data);
      expect(firebaseMocks.addDoc).toHaveBeenCalledWith(
        firebaseMocks.profilesRef,
        data
      );
      expect(firebaseMocks.addDoc.mock.calls[0][1]).toBe(data);
      expect(firebaseMocks.getDoc).not.toHaveBeenCalled();
    });

    it('updates with the exact patch without mutation', async () => {
      const sentinel = Object.freeze({ type: 'delete-field' });
      const patch = Object.freeze({ updated_at: sentinel });
      firebaseMocks.updateDoc.mockResolvedValue(undefined);
      const { updateProfile } = await loadClient();

      await expect(updateProfile('profile-1', patch)).resolves.toBeUndefined();
      expect(firebaseMocks.updateDoc).toHaveBeenCalledWith(
        { path: 'profiles/profile-1', profileId: 'profile-1' },
        patch
      );
      expect(firebaseMocks.updateDoc.mock.calls[0][1]).toBe(patch);
    });

    it('propagates create and update failures', async () => {
      const createFailure = new Error('create failed');
      const updateFailure = new Error('update failed');
      firebaseMocks.addDoc.mockRejectedValue(createFailure);
      firebaseMocks.updateDoc.mockRejectedValue(updateFailure);
      const { createProfile, updateProfile } = await loadClient();

      await expect(createProfile(profile)).rejects.toBe(createFailure);
      await expect(updateProfile('profile-1', {})).rejects.toBe(updateFailure);
    });
  });

  describe('subscribeToProfile', () => {
    it('maps existing and deleted snapshots and returns the exact unsubscribe', async () => {
      const unsubscribe = vi.fn();
      const onChange =
        vi.fn<(value: ProfileDto<typeof profile> | null) => void>();
      const onError = vi.fn();
      firebaseMocks.onSnapshot.mockReturnValue(unsubscribe);
      const { subscribeToProfile } = await loadClient();

      const result = subscribeToProfile<typeof profile>(
        'profile-1',
        onChange,
        onError
      );
      const [, next] = firebaseMocks.onSnapshot.mock.calls[0];
      next(existingSnapshot('profile-1', profile));
      next(missingSnapshot('profile-1'));

      expect(onChange).toHaveBeenNthCalledWith(1, {
        data: profile,
        id: 'profile-1'
      });
      expect(onChange).toHaveBeenNthCalledWith(2, null);
      expect(result).toBe(unsubscribe);
    });

    it('forwards errors unchanged and supports omitting the error callback', async () => {
      const failure = new Error('listen failed');
      const onError = vi.fn();
      firebaseMocks.onSnapshot.mockReturnValue(vi.fn());
      const { subscribeToProfile } = await loadClient();

      subscribeToProfile('profile-1', vi.fn(), onError);
      const [, , error] = firebaseMocks.onSnapshot.mock.calls[0];
      error(failure);
      expect(onError).toHaveBeenCalledWith(failure);

      firebaseMocks.onSnapshot.mockClear();
      expect(() => subscribeToProfile('profile-1', vi.fn())).not.toThrow();
      expect(firebaseMocks.onSnapshot.mock.calls[0]).toHaveLength(2);
    });
  });
});
