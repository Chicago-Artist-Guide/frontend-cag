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

// Stub uploader: one button reports a picked-but-not-uploaded photo, one the upload finishing.
vi.mock('../../shared/ImageUploadComponent', async () => {
  const { createElement, Fragment } = await import('react');
  return {
    default: ({
      onPendingChange
    }: {
      onPendingChange?: (p: boolean) => void;
    }) =>
      createElement(
        Fragment,
        null,
        createElement(
          'button',
          { onClick: () => onPendingChange?.(true), type: 'button' },
          'Pick photo'
        ),
        createElement(
          'button',
          { onClick: () => onPendingChange?.(false), type: 'button' },
          'Finish upload'
        )
      )
  };
});

const member = {
  affiliation: null,
  bio: 'is on the board.',
  id: 'm1',
  // Absolute same-origin URL, as Vite emits for bundled assets.
  image: `${window.location.origin}/assets/Board_Goins-abc123.jpg`,
  linkedin: 'joriejgoins',
  name: 'Jorie Goins',
  pronouns: 'she/her',
  role: 'President'
};

const kept = {
  ...member,
  id: 'm2',
  image: 'https://firebasestorage.googleapis.com/v0/b/demo/o/kept.jpg',
  name: 'Already Uploaded'
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
      data: () => ({ team: { board: [member, kept] }, vision: 'Live vision' })
    } as never);
    const user = userEvent.setup();
    renderPage();

    await user.click(
      (await screen.findAllByRole('button', { name: 'Edit' }))[0]
    );
    const role = screen.getByLabelText('Title / role');
    // paste, not type: per-key typing over 37 rendered cards is slow on CI
    await user.clear(role);
    await user.paste('Board Chair');
    await user.clear(screen.getByLabelText(/LinkedIn/));
    await user.paste('https://www.linkedin.com/in/jorie/');
    await user.click(screen.getByRole('button', { name: 'Done' }));
    const artistsTitle = screen.getAllByLabelText('Section title')[1];
    await user.clear(artistsTitle);
    await user.paste('ARTIST COUNCIL');
    await user.click(screen.getByRole('button', { name: 'Publish changes' }));

    await waitFor(() => expect(setDoc).toHaveBeenCalledTimes(1));
    const [ref, data] = vi.mocked(setDoc).mock.calls[0] as [any, any];
    expect(ref.path).toBe('site_content/about_us');
    expect(data.vision).toBe('Live vision');
    expect(data.updated_by).toBe('admin-1');
    expect(data.titles).toMatchObject({
      artists: 'ARTIST COUNCIL',
      board: 'BOARD OF DIRECTORS'
    });
    expect(data.team.board).toEqual([
      {
        ...member,
        image: 'https://storage.example/copied.jpg',
        linkedin: 'jorie',
        role: 'Board Chair'
      },
      kept
    ]);
    // Default cards in the other sections carry bundled photos too.
    const images = Object.values(data.team).flatMap((members: any) =>
      members.map((m: any) => m.image)
    );
    expect(
      images.every((src) => src === null || src.startsWith('https:'))
    ).toBe(true);
    // Every bundled photo is copied; the Storage photo is left alone.
    expect(uploadBytes).toHaveBeenCalledTimes(
      images.filter(Boolean).length - 1
    );
    expect(fetch).toHaveBeenCalledWith(member.image);
    expect(fetch).not.toHaveBeenCalledWith(kept.image);
    expect(
      await screen.findByText(/Published\. The public About Us page/)
    ).toBeInTheDocument();
  }, 15000);

  it('keeps Done disabled while a picked photo is not uploaded', async () => {
    vi.mocked(getDoc).mockResolvedValue({ data: () => undefined } as never);
    const user = userEvent.setup();
    renderPage();

    await user.click(
      (await screen.findAllByRole('button', { name: 'Add person' }))[0]
    );
    await user.click(screen.getByLabelText('Name'));
    await user.paste('New Person');
    const done = screen.getByRole('button', { name: 'Done' });
    expect(done).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Pick photo' }));
    expect(done).toBeDisabled();
    expect(
      screen.getByText('Click Upload File to finish adding the photo.')
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Finish upload' }));
    expect(done).toBeEnabled();
  }, 15000);

  it('offers no editor when the live content cannot be loaded', async () => {
    vi.mocked(getDoc).mockRejectedValue(new Error('offline'));
    renderPage();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Could not load the About Us page content'
    );
    expect(screen.queryByRole('button', { name: /Publish/ })).toBeNull();
  });
});
