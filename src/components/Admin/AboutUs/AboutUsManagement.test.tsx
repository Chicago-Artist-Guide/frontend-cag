import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react';
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
    await user.paste('ARTIST COUNCIL 2026');
    await user.click(screen.getByRole('button', { name: 'Publish changes' }));

    await waitFor(() => expect(setDoc).toHaveBeenCalledTimes(1));
    const [ref, data] = vi.mocked(setDoc).mock.calls[0] as [any, any];
    expect(ref.path).toBe('site_content/about_us');
    expect(data.vision).toBe('Live vision');
    expect(data.updated_by).toBe('admin-1');
    expect(data.team).toBeUndefined();
    expect(data.sections[1].title).toBe('ARTIST COUNCIL 2026');
    expect(data.sections[0].members).toEqual([
      {
        ...member,
        image: 'https://storage.example/copied.jpg',
        linkedin: 'jorie',
        role: 'Board Chair'
      },
      kept
    ]);
    // Default cards in the other sections carry bundled photos too.
    const images = data.sections.flatMap((s: any) =>
      s.members.map((m: any) => m.image)
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

  it('adds, hides, reorders and removes sections', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      data: () => ({
        sections: [
          { hidden: false, id: 'a', members: [member], title: 'FIRST' },
          { hidden: false, id: 'b', members: [], title: 'SECOND' }
        ]
      })
    } as never);
    const user = userEvent.setup();
    renderPage();

    await user.click(
      await screen.findByRole('button', { name: 'Add section' })
    );
    const titles = () =>
      screen
        .getAllByLabelText('Section title')
        .map((i) => (i as HTMLInputElement).value);
    expect(titles()).toEqual(['FIRST', 'SECOND', 'NEW SECTION']);

    await user.click(screen.getAllByRole('button', { name: 'Up' })[2]);
    expect(titles()).toEqual(['FIRST', 'NEW SECTION', 'SECOND']);

    await user.click(screen.getAllByRole('button', { name: 'Hide' })[2]);
    expect(screen.getByText('Hidden on the public page')).toBeInTheDocument();

    // A section with people needs a second click to remove.
    await user.click(
      screen.getAllByRole('button', { name: 'Remove section' })[0]
    );
    expect(titles()).toHaveLength(3);
    await user.click(
      screen.getByRole('button', { name: 'Remove section and 1 person' })
    );
    await user.click(
      screen.getAllByRole('button', { name: 'Remove section' })[0]
    );
    expect(titles()).toEqual(['SECOND']);

    await user.click(screen.getByRole('button', { name: 'Publish changes' }));
    await waitFor(() => expect(setDoc).toHaveBeenCalledTimes(1));
    const [, data] = vi.mocked(setDoc).mock.calls[0] as [any, any];
    expect(data.sections).toEqual([
      { hidden: true, id: 'b', members: [], title: 'SECOND' }
    ]);
  }, 15000);

  it('moves a card to another section by drag and drop', async () => {
    vi.mocked(getDoc).mockResolvedValue({
      data: () => ({
        sections: [
          { hidden: false, id: 'a', members: [member, kept], title: 'FIRST' },
          { hidden: false, id: 'b', members: [], title: 'SECOND' }
        ]
      })
    } as never);
    renderPage();

    const first = await screen.findByRole('region', { name: 'FIRST' });
    const second = screen.getByRole('region', { name: 'SECOND' });
    const card = within(first)
      .getByText('Already Uploaded')
      .closest('[draggable="true"]') as HTMLElement;
    const dataTransfer = { setData: vi.fn() };
    fireEvent.dragStart(card, { dataTransfer });
    fireEvent.dragOver(second, { dataTransfer });
    fireEvent.drop(second, { dataTransfer });

    expect(within(second).getByText('Already Uploaded')).toBeInTheDocument();
    expect(within(first).queryByText('Already Uploaded')).toBeNull();
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
