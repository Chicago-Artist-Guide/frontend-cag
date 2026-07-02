import { doc, getDocs, updateDoc } from 'firebase/firestore';
import { getProductionsForAccount, setProductionAdminHidden } from './api';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn((_store: unknown, name: string) => ({ id: name })),
  doc: vi.fn((_store: unknown, _col: string, id: string) => ({ id })),
  getDocs: vi.fn(),
  query: vi.fn((ref: unknown, ...clauses: unknown[]) => ({ ref, clauses })),
  updateDoc: vi.fn(),
  where: vi.fn((field: string, op: string, value: unknown) => ({
    field,
    op,
    value
  }))
}));

const mockGetDocs = vi.mocked(getDocs);
const mockDoc = vi.mocked(doc);
const mockUpdateDoc = vi.mocked(updateDoc);

describe('getProductionsForAccount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns [] immediately when accountId is empty, without querying', async () => {
    const result = await getProductionsForAccount({} as never, '');
    expect(result).toEqual([]);
    expect(mockGetDocs).not.toHaveBeenCalled();
  });

  it('uses the real Firestore document ID, not the production_id field, when they differ', async () => {
    // Regression: found live in dev where 32 of 59 productions under one
    // account had a production_id field pointing at a document that
    // doesn't exist -- using the field as the write target for the admin
    // visibility toggle silently failed with a permission error instead
    // of "not found".
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'real-doc-id-abc',
          data: () => ({
            production_id: 'stale-fake-id-that-does-not-exist',
            production_name: 'Test Show'
          })
        }
      ]
    } as never);

    const result = await getProductionsForAccount({} as never, 'acct-1');

    expect(result).toHaveLength(1);
    expect(result[0].production_id).toBe('real-doc-id-abc');
  });

  it('uses the real Firestore document ID even when the production_id field is an empty string', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'real-doc-id-xyz',
          data: () => ({
            production_id: '',
            production_name: 'Another Show'
          })
        }
      ]
    } as never);

    const result = await getProductionsForAccount({} as never, 'acct-1');

    expect(result[0].production_id).toBe('real-doc-id-xyz');
  });

  it('uses the real Firestore document ID even when it happens to match the field (regression, no-op case)', async () => {
    mockGetDocs.mockResolvedValueOnce({
      docs: [
        {
          id: 'matching-id',
          data: () => ({
            production_id: 'matching-id',
            production_name: 'Clean Show'
          })
        }
      ]
    } as never);

    const result = await getProductionsForAccount({} as never, 'acct-1');

    expect(result[0].production_id).toBe('matching-id');
  });
});

describe('setProductionAdminHidden', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('builds the doc reference from the exact ID passed in', async () => {
    await setProductionAdminHidden({} as never, 'real-doc-id-abc', true);

    expect(mockDoc).toHaveBeenCalledWith({}, 'productions', 'real-doc-id-abc');
    expect(mockUpdateDoc).toHaveBeenCalledWith(
      { id: 'real-doc-id-abc' },
      { admin_hidden: true }
    );
  });
});
