const firebaseMocks = vi.hoisted(() => ({
  accountRef: { path: 'accounts/account-1' },
  collection: vi.fn(),
  doc: vi.fn(),
  firestore: { type: 'firestore' },
  getDocs: vi.fn(),
  getFirebaseClient: vi.fn(),
  query: vi.fn(),
  threadsRef: { path: 'threads' },
  where: vi.fn()
}));

vi.mock('../../lib/firebase/client', () => ({
  getFirebaseClient: firebaseMocks.getFirebaseClient
}));

vi.mock('firebase/firestore', () => ({
  collection: firebaseMocks.collection,
  doc: firebaseMocks.doc,
  getDocs: firebaseMocks.getDocs,
  query: firebaseMocks.query,
  where: firebaseMocks.where
}));

const loadClient = () => import('./client');

describe('messages client service', () => {
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
    firebaseMocks.collection.mockReturnValue(firebaseMocks.threadsRef);
    firebaseMocks.doc.mockReturnValue(firebaseMocks.accountRef);
    firebaseMocks.where.mockImplementation((field, operator, value) => ({
      field,
      operator,
      value
    }));
    firebaseMocks.query.mockImplementation((threadsRef, ...constraints) => ({
      constraints,
      threadsRef
    }));
  });

  it('performs no Firebase work when the module is imported', async () => {
    await loadClient();

    expect(firebaseMocks.getFirebaseClient).not.toHaveBeenCalled();
    expect(firebaseMocks.collection).not.toHaveBeenCalled();
    expect(firebaseMocks.doc).not.toHaveBeenCalled();
  });

  it('returns zero for an empty account ID without acquiring Firebase', async () => {
    const { getUnreadThreadCount } = await loadClient();

    await expect(getUnreadThreadCount('', 'individual')).resolves.toBe(0);
    expect(firebaseMocks.getFirebaseClient).not.toHaveBeenCalled();
    expect(firebaseMocks.collection).not.toHaveBeenCalled();
    expect(firebaseMocks.doc).not.toHaveBeenCalled();
    expect(firebaseMocks.getDocs).not.toHaveBeenCalled();
  });

  it('queries talent unread threads for an individual and returns snapshot.size', async () => {
    firebaseMocks.getDocs.mockResolvedValue({ size: 3 });
    const { getUnreadThreadCount } = await loadClient();

    await expect(getUnreadThreadCount('account-1', 'individual')).resolves.toBe(
      3
    );
    expect(firebaseMocks.getFirebaseClient).toHaveBeenCalledOnce();
    expect(firebaseMocks.doc).toHaveBeenCalledWith(
      firebaseMocks.firestore,
      'accounts',
      'account-1'
    );
    expect(firebaseMocks.collection).toHaveBeenCalledWith(
      firebaseMocks.firestore,
      'threads'
    );
    expect(firebaseMocks.where).toHaveBeenNthCalledWith(
      1,
      'talent_account_id',
      '==',
      firebaseMocks.accountRef
    );
    expect(firebaseMocks.where).toHaveBeenNthCalledWith(
      2,
      'talent_status',
      '==',
      'new'
    );
    expect(firebaseMocks.query).toHaveBeenCalledWith(
      firebaseMocks.threadsRef,
      {
        field: 'talent_account_id',
        operator: '==',
        value: firebaseMocks.accountRef
      },
      { field: 'talent_status', operator: '==', value: 'new' }
    );
    expect(firebaseMocks.getDocs).toHaveBeenCalledWith({
      constraints: [
        {
          field: 'talent_account_id',
          operator: '==',
          value: firebaseMocks.accountRef
        },
        { field: 'talent_status', operator: '==', value: 'new' }
      ],
      threadsRef: firebaseMocks.threadsRef
    });
  });

  it('queries theater unread threads for a company and returns snapshot.size', async () => {
    firebaseMocks.getDocs.mockResolvedValue({ size: 2 });
    const { getUnreadThreadCount } = await loadClient();

    await expect(getUnreadThreadCount('account-1', 'company')).resolves.toBe(2);
    expect(firebaseMocks.doc).toHaveBeenCalledWith(
      firebaseMocks.firestore,
      'accounts',
      'account-1'
    );
    expect(firebaseMocks.where).toHaveBeenNthCalledWith(
      1,
      'theater_account_id',
      '==',
      firebaseMocks.accountRef
    );
    expect(firebaseMocks.where).toHaveBeenNthCalledWith(
      2,
      'theater_status',
      '==',
      'new'
    );
    expect(firebaseMocks.query).toHaveBeenCalledWith(
      firebaseMocks.threadsRef,
      {
        field: 'theater_account_id',
        operator: '==',
        value: firebaseMocks.accountRef
      },
      { field: 'theater_status', operator: '==', value: 'new' }
    );
    expect(firebaseMocks.getDocs).toHaveBeenCalledWith({
      constraints: [
        {
          field: 'theater_account_id',
          operator: '==',
          value: firebaseMocks.accountRef
        },
        { field: 'theater_status', operator: '==', value: 'new' }
      ],
      threadsRef: firebaseMocks.threadsRef
    });
  });
});
