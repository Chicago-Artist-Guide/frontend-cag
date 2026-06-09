import React, { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
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

export const TalentMatchList = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const { account } = useUserContext();
  const { loading, matches, production, roles, currentRoleId, filters } =
    useMatches();
  const [profiles, setProfiles] = useState<ProfileAndName[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const theaterAccountId = account?.ref?.id || '';
  const productionId = production?.production_id || '';
  const roleId = currentRoleId || '';
  const selectedStatuses = filters.matchStatus || [];

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
    if (!selectedStatuses.includes('favorite')) return true;
    return favorites[profile.account_id || ''] || false;
  });

  if (loading || cardsLoading) return <p>Loading...</p>;
  if (!filteredProfiles.length) return <p>No matches found</p>;

  const getCurrentRole = roles?.find((r) => r.role_id === currentRoleId);

  return (
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
  );
};
