import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';

const headerMocks = vi.hoisted(() => ({
  getUnreadThreadCount: vi.fn(),
  useAdminAuth: vi.fn(),
  useUserContext: vi.fn()
}));

vi.mock('../../services/messages/client', () => ({
  getUnreadThreadCount: headerMocks.getUnreadThreadCount
}));

vi.mock('../../context/UserContext', () => ({
  useUserContext: headerMocks.useUserContext
}));

vi.mock('../../hooks/useAdminAuth', () => ({
  useAdminAuth: headerMocks.useAdminAuth
}));

import Header from './Header';

interface Deferred<T> {
  promise: Promise<T>;
  resolve: (value: T) => void;
}

const deferred = <T,>(): Deferred<T> => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
};

const routerFuture = {
  v7_relativeSplatPath: true,
  v7_startTransition: true
} as const;

const individualUserState = (accountId = 'account-1') => ({
  account: {
    data: { type: 'individual' },
    id: accountId
  },
  currentUser: { uid: 'auth-user' },
  profile: { id: 'profile-1' }
});

const HeaderWithNavigation = () => {
  const navigate = useNavigate();

  return (
    <>
      <button type="button" onClick={() => navigate('/about-us')}>
        Change route
      </button>
      <Header />
    </>
  );
};

describe('Header unread-interest badge', () => {
  let userState = individualUserState();

  beforeEach(() => {
    userState = individualUserState();
    headerMocks.getUnreadThreadCount.mockReset();
    headerMocks.useAdminAuth.mockReset();
    headerMocks.useUserContext.mockReset();
    headerMocks.useAdminAuth.mockReturnValue({
      adminRole: null,
      isAdmin: false
    });
    headerMocks.useUserContext.mockImplementation(() => userState);
  });

  it('loads on mount and path changes and renders only positive unread counts', async () => {
    headerMocks.getUnreadThreadCount
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4);
    render(
      <MemoryRouter future={routerFuture} initialEntries={['/']}>
        <HeaderWithNavigation />
      </MemoryRouter>
    );

    expect(screen.getByRole('img', { name: 'CAG Logo' })).toHaveAttribute(
      'src',
      '/images/cagLogo1.svg'
    );
    expect(await screen.findByLabelText('3 unread messages')).toHaveTextContent(
      '3'
    );
    expect(headerMocks.getUnreadThreadCount).toHaveBeenCalledWith(
      'account-1',
      'individual'
    );

    fireEvent.click(screen.getByRole('button', { name: 'Change route' }));

    await waitFor(() => {
      expect(headerMocks.getUnreadThreadCount).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByLabelText('4 unread messages')).toHaveTextContent(
      '4'
    );
  });

  it('resets the badge without querying for company or missing accounts', async () => {
    headerMocks.getUnreadThreadCount.mockResolvedValue(5);
    const view = render(
      <MemoryRouter future={routerFuture}>
        <Header />
      </MemoryRouter>
    );
    expect(
      await screen.findByLabelText('5 unread messages')
    ).toBeInTheDocument();

    userState = {
      ...individualUserState(),
      account: { data: { type: 'company' }, id: 'company-1' }
    };
    view.rerender(
      <MemoryRouter future={routerFuture}>
        <Header />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(
        screen.queryByLabelText(/unread messages/)
      ).not.toBeInTheDocument();
    });
    expect(headerMocks.getUnreadThreadCount).toHaveBeenCalledOnce();

    userState = individualUserState('');
    view.rerender(
      <MemoryRouter future={routerFuture}>
        <Header />
      </MemoryRouter>
    );

    expect(screen.queryByLabelText(/unread messages/)).not.toBeInTheDocument();
    expect(headerMocks.getUnreadThreadCount).toHaveBeenCalledOnce();
  });

  it('ignores stale unread results after the account changes', async () => {
    const firstRequest = deferred<number>();
    headerMocks.getUnreadThreadCount
      .mockReturnValueOnce(firstRequest.promise)
      .mockResolvedValueOnce(2);
    const view = render(
      <MemoryRouter future={routerFuture}>
        <Header />
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(headerMocks.getUnreadThreadCount).toHaveBeenCalledWith(
        'account-1',
        'individual'
      );
    });

    userState = individualUserState('account-2');
    view.rerender(
      <MemoryRouter future={routerFuture}>
        <Header />
      </MemoryRouter>
    );
    expect(
      await screen.findByLabelText('2 unread messages')
    ).toBeInTheDocument();

    await act(async () => {
      firstRequest.resolve(9);
      await firstRequest.promise;
    });

    expect(
      screen.queryByLabelText('9 unread messages')
    ).not.toBeInTheDocument();
    expect(screen.getByLabelText('2 unread messages')).toBeInTheDocument();
  });
});
