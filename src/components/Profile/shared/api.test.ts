import { getDoc, getDocs } from 'firebase/firestore';
import { getTheaterNameForAccount } from './api';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_db, collectionName, id) => ({ collectionName, id })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  collection: vi.fn((_db, name) => ({ name })),
  query: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  or: vi.fn()
}));

const mockGetDoc = vi.mocked(getDoc);
const mockGetDocs = vi.mocked(getDocs);

const emptySnapshot = { empty: true, docs: [] };

describe('getTheaterNameForAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('uses theater_name from the account document when looked up by doc id', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ theater_name: 'Steppenwolf' })
    } as never);
    mockGetDocs.mockResolvedValue(emptySnapshot as never);

    await expect(
      getTheaterNameForAccount({} as never, 'account-doc-id')
    ).resolves.toBe('Steppenwolf');
  });

  it('prefers profile theatre_name over account.theater_name', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => true,
      data: () => ({ theater_name: 'Account Name' })
    } as never);
    mockGetDocs.mockResolvedValue({
      empty: false,
      docs: [{ data: () => ({ theatre_name: 'Goodman Theatre' }) }]
    } as never);

    await expect(
      getTheaterNameForAccount({} as never, 'account-doc-id')
    ).resolves.toBe('Goodman Theatre');
  });

  it('falls back to a uid query when the account doc id does not exist', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => false
    } as never);
    mockGetDocs
      .mockResolvedValueOnce({
        empty: false,
        docs: [{ data: () => ({ theater_name: 'Chicago Shakespeare' }) }]
      } as never)
      .mockResolvedValueOnce(emptySnapshot as never);

    await expect(
      getTheaterNameForAccount({} as never, 'auth-uid')
    ).resolves.toBe('Chicago Shakespeare');
  });

  it('returns Theatre N/A when neither the account nor profile can be resolved', async () => {
    mockGetDoc.mockResolvedValue({
      exists: () => false
    } as never);
    mockGetDocs.mockResolvedValue(emptySnapshot as never);

    await expect(
      getTheaterNameForAccount({} as never, 'missing')
    ).resolves.toBe('Theatre N/A');
  });
});
