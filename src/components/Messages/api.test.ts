import { getDocs } from 'firebase/firestore';
import { getUnreadThreadCount } from './api';

vi.mock('firebase/firestore', () => ({
  addDoc: vi.fn(),
  collection: vi.fn((_store: unknown, name: string) => ({ id: name })),
  doc: vi.fn((_store: unknown, _col: string, id: string) => ({ id })),
  getDocs: vi.fn(),
  query: vi.fn((ref: unknown, ...clauses: unknown[]) => ({ ref, clauses })),
  updateDoc: vi.fn(),
  where: vi.fn((field: string, op: string, value: unknown) => ({
    field,
    op,
    value
  })),
  Timestamp: { now: vi.fn() }
}));

const mockGetDocs = vi.mocked(getDocs);

describe('getUnreadThreadCount', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 0 immediately when accountId is empty, without querying', async () => {
    const count = await getUnreadThreadCount({} as never, '', 'individual');
    expect(count).toBe(0);
    expect(mockGetDocs).not.toHaveBeenCalled();
  });

  it('queries talent_account_id / talent_status for an individual account and returns snapshot.size', async () => {
    mockGetDocs.mockResolvedValueOnce({ size: 3 } as never);

    const count = await getUnreadThreadCount(
      {} as never,
      'account-123',
      'individual'
    );

    expect(count).toBe(3);
    const { where } = await import('firebase/firestore');
    expect(vi.mocked(where)).toHaveBeenCalledWith(
      'talent_account_id',
      '==',
      { id: 'account-123' }
    );
    expect(vi.mocked(where)).toHaveBeenCalledWith('talent_status', '==', 'new');
  });

  it('queries theater_account_id / theater_status for a company account and returns snapshot.size', async () => {
    mockGetDocs.mockResolvedValueOnce({ size: 2 } as never);

    const count = await getUnreadThreadCount(
      {} as never,
      'account-456',
      'company'
    );

    expect(count).toBe(2);
    const { where } = await import('firebase/firestore');
    expect(vi.mocked(where)).toHaveBeenCalledWith(
      'theater_account_id',
      '==',
      { id: 'account-456' }
    );
    expect(vi.mocked(where)).toHaveBeenCalledWith(
      'theater_status',
      '==',
      'new'
    );
  });
});
