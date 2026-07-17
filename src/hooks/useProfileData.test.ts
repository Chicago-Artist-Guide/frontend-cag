import { act, renderHook } from '@testing-library/react';
import { DocumentReference, Firestore } from 'firebase/firestore';
import useProfileData from './useProfileData';

const firestore = {} as Firestore;
const accountRef = { id: 'account-1' } as DocumentReference;
const profileRef = { id: 'profile-1' } as DocumentReference;

describe('useProfileData document setters', () => {
  it('sets each document reference and ID atomically', () => {
    const { result } = renderHook(() => useProfileData(null, firestore));

    act(() => {
      result.current.setAccountRef(accountRef);
      result.current.setProfileRef(profileRef);
    });

    expect(result.current.account).toEqual({
      id: 'account-1',
      ref: accountRef,
      data: null
    });
    expect(result.current.profile).toEqual({
      id: 'profile-1',
      ref: profileRef,
      data: null
    });
  });

  it('clears each document ID when its reference is cleared', () => {
    const { result } = renderHook(() => useProfileData(null, firestore));

    act(() => {
      result.current.setAccountRef(accountRef);
      result.current.setProfileRef(profileRef);
    });
    act(() => {
      result.current.setAccountRef(null);
      result.current.setProfileRef(null);
    });

    expect(result.current.account).toEqual({
      id: null,
      ref: null,
      data: null
    });
    expect(result.current.profile).toEqual({
      id: null,
      ref: null,
      data: null
    });
  });
});
