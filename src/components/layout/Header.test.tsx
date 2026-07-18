import { readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor
} from '@testing-library/react';

const headerMocks = vi.hoisted(() => ({
  getUnreadThreadCount: vi.fn(),
  nextLinkDefaultPrevented: [] as boolean[],
  pathname: '/home',
  reloadDocument: vi.fn(),
  useAdminAuth: vi.fn(),
  usePathname: vi.fn(),
  useUserContext: vi.fn()
}));

vi.mock('next/link', () => ({
  default: ({ children, onClick, ...props }: React.ComponentProps<'a'>) => (
    <a
      {...props}
      onClick={(event) => {
        onClick?.(event);
        headerMocks.nextLinkDefaultPrevented.push(event.defaultPrevented);
        event.preventDefault();
      }}
    >
      {children}
    </a>
  )
}));
vi.mock('next/navigation', () => ({
  usePathname: headerMocks.usePathname
}));
vi.mock('../../utils/navigation', () => ({
  reloadDocument: headerMocks.reloadDocument
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

const anonymousUserState = () => ({
  account: null,
  currentUser: null,
  profile: { id: null }
});

const individualUserState = (accountId = 'account-1') => ({
  account: {
    data: { type: 'individual' },
    id: accountId
  },
  currentUser: { uid: 'auth-user' },
  profile: { id: 'profile-1' }
});

const hrefFor = (name: string) =>
  screen.getByRole('link', { exact: true, name }).getAttribute('href');

describe('Header Next navigation boundary', () => {
  let userState:
    | ReturnType<typeof anonymousUserState>
    | ReturnType<typeof individualUserState>;

  beforeEach(() => {
    userState = anonymousUserState();
    headerMocks.getUnreadThreadCount.mockReset();
    headerMocks.nextLinkDefaultPrevented.length = 0;
    headerMocks.pathname = '/home';
    headerMocks.reloadDocument.mockReset();
    headerMocks.useAdminAuth.mockReset();
    headerMocks.usePathname.mockReset();
    headerMocks.useUserContext.mockReset();
    headerMocks.useAdminAuth.mockReturnValue({
      adminRole: null,
      isAdmin: false
    });
    headerMocks.usePathname.mockImplementation(() => headerMocks.pathname);
    headerMocks.useUserContext.mockImplementation(() => userState);
  });

  it('renders every anonymous internal destination as an accessible href', () => {
    render(<Header />);

    expect(screen.getByRole('img', { name: 'CAG Logo' })).toHaveAttribute(
      'src',
      '/images/cagLogo1.svg'
    );
    expect(hrefFor('CAG Logo')).toBe('/');
    expect(hrefFor('HOME')).toBe('/');
    expect(hrefFor('ABOUT US')).toBe('/about-us');
    expect(hrefFor('DONATE')).toBe('/donate');
    expect(hrefFor('GET INVOLVED')).toBe('/get-involved');
    expect(hrefFor('EVENTS')).toBe('/events');
    expect(hrefFor('SIGN UP')).toBe('/sign-up');
    expect(hrefFor('LOGIN')).toBe('/login');
    expect(screen.queryByRole('link', { name: 'PROFILE' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'ADMIN' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'LOGOUT' })).toBeNull();
  });

  it('preserves profile and logout visibility for authenticated users', () => {
    userState = individualUserState();
    headerMocks.getUnreadThreadCount.mockResolvedValue(0);
    render(<Header />);

    expect(hrefFor('PROFILE')).toBe('/profile');
    expect(hrefFor('LOGOUT')).toBe('/logout');
    expect(screen.queryByRole('link', { name: 'SIGN UP' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'LOGIN' })).toBeNull();
  });

  it('preserves the admin link without inventing authenticated visibility', () => {
    headerMocks.useAdminAuth.mockReturnValue({
      adminRole: 'admin',
      isAdmin: true
    });
    render(<Header />);

    expect(hrefFor('ADMIN')).toBe('/admin');
    expect(hrefFor('SIGN UP')).toBe('/sign-up');
    expect(hrefFor('LOGIN')).toBe('/login');
    expect(screen.queryByRole('link', { name: 'PROFILE' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'LOGOUT' })).toBeNull();
  });

  it('hard reloads only a same-page signup click and prevents double navigation', () => {
    headerMocks.pathname = '/sign-up';
    const view = render(<Header />);

    expect(fireEvent.click(screen.getByRole('link', { name: 'SIGN UP' }))).toBe(
      false
    );
    expect(headerMocks.reloadDocument).toHaveBeenCalledOnce();
    expect(headerMocks.reloadDocument).toHaveBeenCalledWith(window.location);
    expect(headerMocks.nextLinkDefaultPrevented.at(-1)).toBe(true);

    headerMocks.pathname = '/home';
    view.rerender(<Header />);
    fireEvent.click(screen.getByRole('link', { name: 'SIGN UP' }));
    expect(headerMocks.nextLinkDefaultPrevented.at(-1)).toBe(false);
    expect(headerMocks.reloadDocument).toHaveBeenCalledOnce();
  });

  it('lets every ordinary internal Next Link perform client navigation', () => {
    render(<Header />);
    const links = [
      ['CAG Logo', '/'],
      ['HOME', '/'],
      ['ABOUT US', '/about-us'],
      ['DONATE', '/donate'],
      ['GET INVOLVED', '/get-involved'],
      ['EVENTS', '/events'],
      ['SIGN UP', '/sign-up'],
      ['LOGIN', '/login']
    ] as const;

    for (const [name] of links) {
      fireEvent.click(screen.getByRole('link', { exact: true, name }));
    }

    expect(headerMocks.nextLinkDefaultPrevented).toEqual(
      links.map(() => false)
    );
  });

  it('closes the mobile menu on outside clicks and pathname changes', () => {
    const view = render(<Header />);
    const toggle = screen.getByRole('button');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    fireEvent.mouseDown(document.body);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    headerMocks.pathname = '/about-us';
    view.rerender(<Header />);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('contains no React Router navigation or refresh workaround', () => {
    const source = readFileSync(
      path.resolve(process.cwd(), 'src/components/layout/Header.tsx'),
      'utf8'
    );

    expect(source).not.toMatch(
      /react-router|useLocation|useNavigate|router\.refresh|\bnavigate\s*\(/u
    );
    expect(source).not.toMatch(/navigateLegacyDocument/u);
    expect(source).toMatch(/usePathname/u);
    expect(source).toMatch(/reloadDocument\(window\.location\)/u);
  });
});

describe('Header unread-interest badge', () => {
  let userState = individualUserState();

  beforeEach(() => {
    userState = individualUserState();
    headerMocks.getUnreadThreadCount.mockReset();
    headerMocks.nextLinkDefaultPrevented.length = 0;
    headerMocks.pathname = '/home';
    headerMocks.reloadDocument.mockReset();
    headerMocks.useAdminAuth.mockReset();
    headerMocks.usePathname.mockReset();
    headerMocks.useUserContext.mockReset();
    headerMocks.useAdminAuth.mockReturnValue({
      adminRole: null,
      isAdmin: false
    });
    headerMocks.usePathname.mockImplementation(() => headerMocks.pathname);
    headerMocks.useUserContext.mockImplementation(() => userState);
  });

  it('loads on mount and primitive pathname changes and renders positive counts', async () => {
    headerMocks.getUnreadThreadCount
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(4);
    const view = render(<Header />);

    expect(await screen.findByLabelText('3 unread messages')).toHaveTextContent(
      '3'
    );
    expect(headerMocks.getUnreadThreadCount).toHaveBeenCalledWith(
      'account-1',
      'individual'
    );

    headerMocks.pathname = '/about-us';
    view.rerender(<Header />);

    await waitFor(() => {
      expect(headerMocks.getUnreadThreadCount).toHaveBeenCalledTimes(2);
    });
    expect(await screen.findByLabelText('4 unread messages')).toHaveTextContent(
      '4'
    );
  });

  it('resets without querying for failed, company, or missing accounts', async () => {
    headerMocks.getUnreadThreadCount.mockResolvedValueOnce(5);
    const view = render(<Header />);
    expect(
      await screen.findByLabelText('5 unread messages')
    ).toBeInTheDocument();

    headerMocks.getUnreadThreadCount.mockRejectedValueOnce(
      new Error('offline')
    );
    headerMocks.pathname = '/profile/messages';
    view.rerender(<Header />);
    await waitFor(() => {
      expect(screen.queryByLabelText(/unread messages/)).toBeNull();
    });

    userState = {
      ...individualUserState(),
      account: { data: { type: 'company' }, id: 'company-1' }
    };
    view.rerender(<Header />);
    expect(screen.queryByLabelText(/unread messages/)).toBeNull();

    userState = individualUserState('');
    view.rerender(<Header />);
    expect(screen.queryByLabelText(/unread messages/)).toBeNull();
    expect(headerMocks.getUnreadThreadCount).toHaveBeenCalledTimes(2);
  });

  it('ignores stale unread results after the account changes', async () => {
    const firstRequest = deferred<number>();
    headerMocks.getUnreadThreadCount
      .mockReturnValueOnce(firstRequest.promise)
      .mockResolvedValueOnce(2);
    const view = render(<Header />);
    await waitFor(() => {
      expect(headerMocks.getUnreadThreadCount).toHaveBeenCalledWith(
        'account-1',
        'individual'
      );
    });

    userState = individualUserState('account-2');
    view.rerender(<Header />);
    expect(
      await screen.findByLabelText('2 unread messages')
    ).toBeInTheDocument();

    await act(async () => {
      firstRequest.resolve(9);
      await firstRequest.promise;
    });

    expect(screen.queryByLabelText('9 unread messages')).toBeNull();
    expect(screen.getByLabelText('2 unread messages')).toBeInTheDocument();
  });
});
