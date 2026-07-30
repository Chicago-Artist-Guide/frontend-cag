const firebaseMocks = vi.hoisted(() => ({
  collection: vi.fn(),
  eventsRef: { path: 'events' },
  firestore: { type: 'server-firestore' },
  getDocs: vi.fn(),
  getServerFirestore: vi.fn()
}));

vi.mock('../../lib/firebase/server', () => ({
  getServerFirestore: firebaseMocks.getServerFirestore
}));

vi.mock('firebase/firestore', () => ({
  collection: firebaseMocks.collection,
  getDocs: firebaseMocks.getDocs
}));

const docSnapshot = (id: string, data: Record<string, unknown> | undefined) => ({
  data: () => data,
  id
});

const loadServer = () => import('./server');

describe('events server service', () => {
  beforeEach(() => {
    vi.resetModules();
    for (const mock of Object.values(firebaseMocks)) {
      if (typeof mock === 'function' && 'mockReset' in mock) {
        mock.mockReset();
      }
    }
    firebaseMocks.getServerFirestore.mockReturnValue(firebaseMocks.firestore);
    firebaseMocks.collection.mockReturnValue(firebaseMocks.eventsRef);
  });

  it('reads the events collection with no where/orderBy constraints', async () => {
    firebaseMocks.getDocs.mockResolvedValue({ docs: [] });
    const { listEvents } = await loadServer();

    await listEvents();

    expect(firebaseMocks.collection).toHaveBeenCalledWith(
      firebaseMocks.firestore,
      'events'
    );
    expect(firebaseMocks.getDocs).toHaveBeenCalledWith(firebaseMocks.eventsRef);
  });

  it('normalizes documents, using the snapshot id over any id field in the data', async () => {
    firebaseMocks.getDocs.mockResolvedValue({
      docs: [
        docSnapshot('doc-1', {
          date: '2026-06-01',
          id: 'stale-id',
          name: 'Community Mixer',
          status: 'published'
        })
      ]
    });
    const { listEvents } = await loadServer();

    const events = await listEvents();

    expect(events).toEqual([
      {
        date: '2026-06-01',
        id: 'doc-1',
        name: 'Community Mixer',
        status: 'published'
      }
    ]);
  });

  it('returns every document regardless of status — filtering happens in eventFilters', async () => {
    firebaseMocks.getDocs.mockResolvedValue({
      docs: [
        docSnapshot('draft-event', { name: 'Draft', status: 'draft' }),
        docSnapshot('published-event', { name: 'Live', status: 'published' })
      ]
    });
    const { listEvents } = await loadServer();

    const events = await listEvents();

    expect(events).toHaveLength(2);
  });

  it('propagates read failures', async () => {
    const failure = new Error('read failed');
    firebaseMocks.getDocs.mockRejectedValue(failure);
    const { listEvents } = await loadServer();

    await expect(listEvents()).rejects.toBe(failure);
  });
});
