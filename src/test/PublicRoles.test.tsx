import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FirebaseContext } from '../context/FirebaseContext';
import PublicRoles from '../routes/PublicRoles';
import { fetchPublicOpenRoles } from '../components/PublicShows/api';

// Mock the API at the boundary so the route doesn't hit Firestore.
vi.mock('../components/PublicShows/api', async () => {
  const actual = await vi.importActual<
    typeof import('../components/PublicShows/api')
  >('../components/PublicShows/api');
  return {
    ...actual,
    fetchPublicOpenRoles: vi.fn()
  };
});

const mockFetch = vi.mocked(fetchPublicOpenRoles);

const renderRoute = () => {
  const firebaseValue = {
    firebaseApp: null,
    firebaseAnalytics: null,
    firebaseAuth: null,
    firebaseFirestore: {} as never,
    firebaseStorage: null
  } as never;

  return render(
    <FirebaseContext.Provider value={firebaseValue}>
      <MemoryRouter initialEntries={['/roles']}>
        <PublicRoles />
      </MemoryRouter>
    </FirebaseContext.Provider>
  );
};

const sampleRoles = [
  {
    role_id: 'r1',
    role_name: 'Lead Actor',
    type: 'On-Stage' as const,
    role_status: 'Open' as const,
    description: 'A leading role',
    production_id: 'p1',
    production_name: 'Hamlet',
    account_id: 'a1'
  },
  {
    role_id: 'r2',
    role_name: 'Stage Manager',
    type: 'Off-Stage' as const,
    role_status: 'Open' as const,
    production_id: 'p2',
    production_name: 'Macbeth',
    account_id: 'a2'
  }
];

describe('PublicRoles route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders role cards when roles are present', async () => {
    mockFetch.mockResolvedValueOnce(sampleRoles as never);

    renderRoute();

    expect(await screen.findByText('Lead Actor')).toBeInTheDocument();
    expect(screen.getByText('Stage Manager')).toBeInTheDocument();
    expect(screen.getByText('Hamlet')).toBeInTheDocument();
    expect(screen.getByText('Macbeth')).toBeInTheDocument();
    // Theatre attribution is intentionally absent on the unauth surface;
    // see the comment in PublicShows/api.ts about the email leak.
    expect(screen.queryByText('Steppenwolf')).not.toBeInTheDocument();
    expect(screen.queryByText('Goodman')).not.toBeInTheDocument();
    expect(screen.getByTestId('public-roles-list')).toBeInTheDocument();
  });

  it('shows a distinct error state when the fetch rejects (not the empty state)', async () => {
    // Suppress the expected console.error from the load() catch so the
    // test output stays clean.
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValueOnce(new Error('firestore unavailable'));

    renderRoute();

    expect(
      await screen.findByTestId('public-roles-error')
    ).toBeInTheDocument();
    // Empty-state copy must NOT show — that would be misleading on a real
    // network/rules failure.
    expect(
      screen.queryByTestId('public-roles-empty-state')
    ).not.toBeInTheDocument();

    errSpy.mockRestore();
  });

  it('shows the empty-system null state when no roles are returned', async () => {
    mockFetch.mockResolvedValueOnce([]);

    renderRoute();

    expect(
      await screen.findByTestId('public-roles-empty-state')
    ).toBeInTheDocument();
    expect(screen.getByText(/No open roles right now/i)).toBeInTheDocument();
    // Sign-up CTA is embedded in the empty state.
    const signUpLinks = screen.getAllByRole('link', { name: /sign up/i });
    expect(signUpLinks.length).toBeGreaterThan(0);
    expect(signUpLinks[0]).toHaveAttribute('href', '/sign-up');
  });

  it('shows the no-results null state when filters match nothing', async () => {
    mockFetch.mockResolvedValueOnce(sampleRoles as never);

    renderRoute();

    // Wait for initial render of the list before filtering.
    await screen.findByText('Lead Actor');

    const search = screen.getByLabelText(/Search roles by name or production/i);
    fireEvent.change(search, { target: { value: 'zzznoresults' } });

    expect(
      await screen.findByTestId('public-roles-no-results')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/No matches for these filters/i)
    ).toBeInTheDocument();

    // Clearing filters should restore the list.
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }));

    await waitFor(() => {
      expect(screen.getByText('Lead Actor')).toBeInTheDocument();
    });
  });

  it('top sign-up CTA links to /sign-up and /login when roles exist', async () => {
    mockFetch.mockResolvedValueOnce(sampleRoles as never);

    renderRoute();

    await screen.findByText('Lead Actor');

    const cta = screen.getByTestId('public-roles-signup-cta');
    expect(cta).toBeInTheDocument();

    const signUpLink = screen.getAllByRole('link', { name: /sign up/i })[0];
    expect(signUpLink).toHaveAttribute('href', '/sign-up');

    const loginLink = screen.getAllByRole('link', { name: /log in/i })[0];
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('filters by stage type', async () => {
    mockFetch.mockResolvedValueOnce(sampleRoles as never);

    renderRoute();

    await screen.findByText('Lead Actor');

    const stageSelect = screen.getByLabelText(/Filter by stage type/i);
    fireEvent.change(stageSelect, { target: { value: 'Off-Stage' } });

    await waitFor(() => {
      expect(screen.queryByText('Lead Actor')).not.toBeInTheDocument();
    });
    expect(screen.getByText('Stage Manager')).toBeInTheDocument();
  });
});
