import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { getDoc, setDoc } from 'firebase/firestore';
import { uploadBytes } from 'firebase/storage';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useUserContext } from '../../../context/UserContext';
import AboutUsManagement from './AboutUsManagement';

vi.mock('firebase/firestore', () => ({
  doc: vi.fn((_store, ...segments) => ({ path: segments.join('/') })),
  getDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'server-time'),
  setDoc: vi.fn()
}));

vi.mock('firebase/storage', () => ({
  getDownloadURL: vi.fn(async () => 'https://storage.example/copied.jpg'),
  ref: vi.fn((_storage, path) => ({ path })),
  uploadBytes: vi.fn()
}));

vi.mock('../../../context/FirebaseContext', () => ({
  useFirebaseContext: vi.fn()
}));

vi.mock('../../../context/UserContext', () => ({
  useUserContext: vi.fn()
}));

vi.mock('../../../hooks/useAdminAuth', () => ({
  useAdminAuth: () => ({ adminRole: 'admin' })
}));

vi.mock('../../shared/ImageUploadComponent', () => ({
  default: () => null
}));

const member = {
  affiliation: null,
  bio: 'is on the board.',
  id: 'm1',
  image: '/images/who-we-are/board/Board_Goins.jpg',
  linkedin: 'joriejgoins',
  name: 'Jorie Goins',
  pronouns: 'she/her',
  role: 'President'
};

const renderPage = () =>
  render(
    <MemoryRouter>
      <AboutUsManagement />
    </MemoryRouter>
  );

describe('AboutUsManagement', () => {
  beforeEach(() => {
    vi.mocked(useFirebaseContext).mockReturnValue({
      firebaseFirestore: {},
      firebaseStorage: {}
    } as never);
    vi.mocked(useUserContext).mockReturnValue({
      currentUser: { uid: 'admin-1' }
    } as never);
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ blob: async () => new Blob(['x']), ok: true }))
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
  });

  it('publishes an edited card and copies bundled photos to Storage', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      data: () => ({ team: { board: [member] }, vision: 'Live vision' })
    } as never);
    const user = userEvent.setup();
    renderPage();

    await user.click(
      (await screen.findAllByRole('button', { name: 'Edit' }))[0]
    );
    const role = screen.getByLabelText('Title / role');
    await user.clear(role);
    await user.type(role, 'Board Chair');
    await user.type(
      screen.getByLabelText(/LinkedIn/),
      '{Control>}a{/Control}https://www.linkedin.com/in/jorie/'
    );
    await user.click(screen.getByRole('button', { name: 'Done' }));
    await user.click(screen.getByRole('button', { name: 'Publish changes' }));

    await waitFor(() => expect(setDoc).toHaveBeenCalledTimes(1));
    const [ref, data] = vi.mocked(setDoc).mock.calls[0] as [any, any];
    expect(ref.path).toBe('site_content/about_us');
    expect(data.vision).toBe('Live vision');
    expect(data.updated_by).toBe('admin-1');
    expect(data.team.board).toEqual([
      {
        ...member,
        image: 'https://storage.example/copied.jpg',
        linkedin: 'jorie',
        role: 'Board Chair'
      }
    ]);
    // Default cards in the other sections carry bundled photos too.
    const images = Object.values(data.team).flatMap((members: any) =>
      members.map((m: any) => m.image)
    );
    expect(
      images.every((src) => src === null || src.startsWith('https:'))
    ).toBe(true);
    expect(uploadBytes).toHaveBeenCalledTimes(images.filter(Boolean).length);
    expect(fetch).toHaveBeenCalledWith(member.image);
    expect(
      await screen.findByText(/Published\. The public About Us page/)
    ).toBeInTheDocument();
  });

  it('offers no editor when the live content cannot be loaded', async () => {
    vi.mocked(getDoc).mockRejectedValue(new Error('offline'));
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load the About Us page content'
    );
    expect(screen.queryByRole('button', { name: /Publish/ })).toBeNull();
  });
});
