import { act, renderHook, waitFor } from '@testing-library/react';
import type { User } from 'firebase/auth';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { findAccountByUid } from '../services/accounts/client';
import { findProfileByUid } from '../services/profiles/client';
import useProfileData from './useProfileData';

vi.mock('../services/accounts/client', () => ({
  findAccountByUid: vi.fn()
}));

vi.mock('../services/profiles/client', () => ({
  findProfileByUid: vi.fn()
}));

const mockFindAccountByUid = vi.mocked(findAccountByUid);
const mockFindProfileByUid = vi.mocked(findProfileByUid);
const emptyDocument = { id: null, data: null };
const user = (uid: string) => ({ uid }) as User;

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
};

describe('useProfileData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFindAccountByUid.mockResolvedValue(null);
    mockFindProfileByUid.mockResolvedValue(null);
  });

  it('returns empty documents without reading when there is no user', () => {
    const { result } = renderHook(() => useProfileData(null));

    expect(result.current.account).toEqual(emptyDocument);
    expect(result.current.profile).toEqual(emptyDocument);
    expect(mockFindAccountByUid).not.toHaveBeenCalled();
    expect(mockFindProfileByUid).not.toHaveBeenCalled();
  });

  it('starts the account and profile reads in parallel and stores their DTOs', async () => {
    const accountResult =
      deferred<Awaited<ReturnType<typeof findAccountByUid>>>();
    const profileResult =
      deferred<Awaited<ReturnType<typeof findProfileByUid>>>();
    mockFindAccountByUid.mockReturnValue(accountResult.promise);
    mockFindProfileByUid.mockReturnValue(profileResult.promise);

    const { result } = renderHook(() => useProfileData(user('user-1')));

    expect(mockFindAccountByUid).toHaveBeenCalledWith('user-1');
    expect(mockFindProfileByUid).toHaveBeenCalledWith('user-1');
    expect(result.current.account).toEqual(emptyDocument);
    expect(result.current.profile).toEqual(emptyDocument);

    const account = {
      id: 'account-1',
      data: { uid: 'user-1', type: 'individual' as const }
    };
    const profile = {
      id: 'profile-1',
      data: { uid: 'user-1', account_id: 'account-1' }
    };

    await act(async () => {
      accountResult.resolve(account);
      profileResult.resolve(profile);
    });

    expect(result.current.account).toEqual(account);
    expect(result.current.profile).toEqual(profile);
  });

  it('leaves each missing document empty', async () => {
    mockFindAccountByUid.mockResolvedValue({
      id: 'account-1',
      data: { uid: 'user-1', type: 'company' }
    });

    const { result } = renderHook(() => useProfileData(user('user-1')));

    await waitFor(() => expect(result.current.account.id).toBe('account-1'));
    expect(result.current.profile).toEqual(emptyDocument);
  });

  it('clears both documents when the user logs out', async () => {
    mockFindAccountByUid.mockResolvedValue({
      id: 'account-1',
      data: { uid: 'user-1', type: 'individual' }
    });
    mockFindProfileByUid.mockResolvedValue({
      id: 'profile-1',
      data: { uid: 'user-1', account_id: 'account-1' }
    });

    const { result, rerender } = renderHook(
      ({ currentUser }) => useProfileData(currentUser),
      { initialProps: { currentUser: user('user-1') as User | null } }
    );
    await waitFor(() => expect(result.current.profile.id).toBe('profile-1'));

    rerender({ currentUser: null });

    expect(result.current.account).toEqual(emptyDocument);
    expect(result.current.profile).toEqual(emptyDocument);
  });

  it('does not let a slow prior user overwrite a newer user', async () => {
    const oldAccount = deferred<Awaited<ReturnType<typeof findAccountByUid>>>();
    const oldProfile = deferred<Awaited<ReturnType<typeof findProfileByUid>>>();
    mockFindAccountByUid.mockImplementation((uid) =>
      uid === 'old-user'
        ? oldAccount.promise
        : Promise.resolve({
            id: 'new-account',
            data: { uid, type: 'individual' }
          })
    );
    mockFindProfileByUid.mockImplementation((uid) =>
      uid === 'old-user'
        ? oldProfile.promise
        : Promise.resolve({
            id: 'new-profile',
            data: { uid, account_id: 'new-account' }
          })
    );

    const { result, rerender } = renderHook(
      ({ currentUser }) => useProfileData(currentUser),
      { initialProps: { currentUser: user('old-user') } }
    );

    rerender({ currentUser: user('new-user') });
    await waitFor(() => expect(result.current.profile.id).toBe('new-profile'));

    await act(async () => {
      oldAccount.resolve({
        id: 'old-account',
        data: { uid: 'old-user', type: 'company' }
      });
      oldProfile.resolve({
        id: 'old-profile',
        data: { uid: 'old-user', account_id: 'old-account' }
      });
    });

    expect(result.current.account.id).toBe('new-account');
    expect(result.current.profile.id).toBe('new-profile');
  });

  it('does not publish a slow result after unmount', async () => {
    const accountResult =
      deferred<Awaited<ReturnType<typeof findAccountByUid>>>();
    const profileResult =
      deferred<Awaited<ReturnType<typeof findProfileByUid>>>();
    mockFindAccountByUid.mockReturnValue(accountResult.promise);
    mockFindProfileByUid.mockReturnValue(profileResult.promise);
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const { unmount } = renderHook(() => useProfileData(user('user-1')));
    unmount();

    await act(async () => {
      accountResult.resolve(null);
      profileResult.resolve(null);
    });

    expect(consoleError).not.toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
