import React, { useEffect, useState } from 'react';
import { getNameForAccount } from '../../components/Profile/shared/api';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { useMatches } from '../../context/MatchContext';
import { getTheaterTalentMatch } from './api';
import { ProfileAndName, TalentMatchCard } from './TalentMatchCard';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

export const TalentMatchList = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const { loading, matches, production, roles, currentRoleId } = useMatches();
  const [profiles, setProfiles] = useState<ProfileAndName[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const fetchFullNames = async () => {
    const profilesWithNames = await Promise.all(
      matches.map(async (m) => {
        const fullName = await getNameForAccount(
          firebaseFirestore,
          m.account_id
        );
        const findMatch = await getTheaterTalentMatch(
          firebaseFirestore,
          production?.production_id || '',
          currentRoleId || '',
          m.account_id,
          'theater' // initiated by theater
        );

        return {
          ...m,
          fullName,
          matchStatus: findMatch ? findMatch.status : null
        };
      })
    );

    setProfiles(profilesWithNames);
    setCardsLoading(false);
  };

  const fetchFavorites = async () => {
    if (!production?.production_id || !currentRoleId) return;

    const favoritesRef = doc(
      firebaseFirestore,
      'favorites',
      `${production.production_id}_${currentRoleId}`
    );
    const favoritesDoc = await getDoc(favoritesRef);
    if (favoritesDoc.exists()) {
      setFavorites(new Set(favoritesDoc.data().profileIds || []));
    }
  };

  const toggleFavorite = async (profileId: string) => {
    if (!production?.production_id || !currentRoleId) return;

    const favoritesRef = doc(
      firebaseFirestore,
      'favorites',
      `${production.production_id}_${currentRoleId}`
    );

    const newFavorites = new Set(favorites);
    if (newFavorites.has(profileId)) {
      newFavorites.delete(profileId);
    } else {
      newFavorites.add(profileId);
    }

    if (newFavorites.size === 0) {
      await deleteDoc(favoritesRef);
    } else {
      await setDoc(favoritesRef, {
        profileIds: Array.from(newFavorites)
      });
    }

    setFavorites(newFavorites);
  };

  useEffect(() => {
    fetchFullNames();
    fetchFavorites();
  }, [firebaseFirestore, matches, production?.production_id, currentRoleId]);

  if (loading || cardsLoading) return <p>Loading...</p>;
  if (!profiles.length) return <p>No matches found</p>;

  const getCurrentRole = roles?.find((r) => r.role_id === currentRoleId);

  const filteredProfiles = showFavoritesOnly
    ? profiles.filter((profile) => favorites.has(profile.uid))
    : profiles;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setShowFavoritesOnly(false)}
          className={`rounded-full px-4 py-2 ${
            !showFavoritesOnly
              ? 'bg-mint text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Show All
        </button>
        <button
          onClick={() => setShowFavoritesOnly(true)}
          className={`flex items-center gap-2 rounded-full px-4 py-2 ${
            showFavoritesOnly
              ? 'bg-mint text-white'
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="size-5"
          >
            <path
              fillRule="evenodd"
              d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
              clipRule="evenodd"
            />
          </svg>
          Favorites
        </button>
      </div>
      {filteredProfiles.map((profile) => (
        <TalentMatchCard
          key={`${profile.uid}-TalentMatchCard`}
          profile={profile}
          productionId={production?.production_id || ''}
          productionName={production?.production_name || '(Production N/A)'}
          roleId={currentRoleId || ''}
          roleName={getCurrentRole?.role_name || '(Role N/A)'}
          fetchFullNames={fetchFullNames}
          favorited={favorites.has(profile.uid)}
          onFavoriteToggle={toggleFavorite}
        />
      ))}
    </div>
  );
};
