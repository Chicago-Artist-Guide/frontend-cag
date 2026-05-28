import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import clsx from 'clsx';
import { getNameForAccount } from '../../components/Profile/shared/api';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { useMatches } from '../../context/MatchContext';
import { useUserContext } from '../../context/UserContext';
import {
  getTheaterTalentFavorite,
  getTheaterTalentMatch,
  setTheaterTalentFavorite
} from './api';
import { getTheaterCardMatchStatus } from './matchStatus';
import { ProfileAndName, TalentMatchCard } from './TalentMatchCard';
import { FilterFavoritesType } from './types';

export const TalentMatchList = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const { account } = useUserContext();
  const { loading, matches, production, roles, currentRoleId } = useMatches();
  const [profiles, setProfiles] = useState<ProfileAndName[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<FilterFavoritesType>('all');

  const theaterAccountId = account?.ref?.id || '';
  const productionId = production?.production_id || '';
  const roleId = currentRoleId || '';

  const fetchFavoriteStatus = async (talentAccountId: string) => {
    if (!theaterAccountId || !productionId || !roleId) return;

    try {
      const isFavorite = await getTheaterTalentFavorite(
        firebaseFirestore,
        theaterAccountId,
        talentAccountId,
        productionId,
        roleId
      );
      setFavorites((prev) => ({
        ...prev,
        [talentAccountId]: isFavorite
      }));
    } catch (error) {
      console.error('Error fetching favorite status:', error);
      setFavorites((prev) => ({
        ...prev,
        [talentAccountId]: false
      }));
    }
  };

  const toggleFavorite = async (talentAccountId: string) => {
    if (!theaterAccountId || !productionId || !roleId) return;

    try {
      const newStatus = !favorites[talentAccountId];
      await setTheaterTalentFavorite(
        firebaseFirestore,
        theaterAccountId,
        talentAccountId,
        productionId,
        roleId,
        newStatus
      );
      setFavorites((prev) => ({
        ...prev,
        [talentAccountId]: newStatus
      }));
    } catch (error) {
      console.error('Error updating favorite status:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to update favorite status. Please try again.',
        icon: 'error',
        confirmButtonText: 'Ok'
      });
    }
  };

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
          m.account_id
        );

        // Fetch favorite status for each profile
        if (m.account_id) {
          fetchFavoriteStatus(m.account_id);
        }

        return {
          ...m,
          fullName,
          matchStatus: getTheaterCardMatchStatus(findMatch)
        };
      })
    );

    setProfiles(profilesWithNames);
    setCardsLoading(false);
  };

  useEffect(() => {
    fetchFullNames();
  }, [firebaseFirestore, matches]);

  const filteredProfiles = profiles.filter((profile) => {
    if (filter === 'all') return true;
    return favorites[profile.account_id || ''] || false;
  });

  if (loading || cardsLoading) return <p>Loading...</p>;
  if (!profiles.length) return <p>No matches found</p>;

  const getCurrentRole = roles?.find((r) => r.role_id === currentRoleId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 border-b border-stone-200 pb-4 sm:flex-row sm:items-center sm:gap-4">
        <span className="font-montserrat text-base font-semibold sm:text-lg">
          Show:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilter('all')}
            className={clsx(
              'rounded-full px-4 py-2 font-montserrat text-sm font-semibold transition-colors',
              {
                'bg-banana': filter === 'all',
                'bg-stone-100 text-stone-600 hover:bg-stone-200':
                  filter !== 'all'
              }
            )}
          >
            All Matches
          </button>
          <button
            onClick={() => setFilter('favorites')}
            className={clsx(
              'rounded-full px-4 py-2 font-montserrat text-sm font-semibold transition-colors',
              {
                'bg-banana': filter === 'favorites',
                'bg-stone-100 text-stone-600 hover:bg-stone-200':
                  filter !== 'favorites'
              }
            )}
          >
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="size-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                  clipRule="evenodd"
                />
              </svg>
              Favorites
            </div>
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        {filteredProfiles.map((profile) => (
          <TalentMatchCard
            key={`${profile.uid}-TalentMatchCard`}
            profile={profile}
            productionId={production?.production_id || ''}
            productionName={production?.production_name || '(Production N/A)'}
            roleId={currentRoleId || ''}
            roleName={getCurrentRole?.role_name || '(Role N/A)'}
            fetchFullNames={fetchFullNames}
            isFavorited={favorites[profile.account_id || ''] || false}
            onToggleFavorite={async () => {
              if (profile.account_id) {
                await toggleFavorite(profile.account_id);
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};
