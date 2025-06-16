import React, { useEffect, useState } from 'react';
import { getNameForAccount } from '../../components/Profile/shared/api';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { useMatches } from '../../context/MatchContext';
import { useUserContext } from '../../context/UserContext';
import { getTheaterTalentMatch } from './api';
import { ProfileAndName, TalentMatchCard } from './TalentMatchCard';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import Swal from 'sweetalert2';

export const TalentMatchList = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const { account } = useUserContext();
  const { loading, matches, production, roles, currentRoleId } = useMatches();
  const [profiles, setProfiles] = useState<ProfileAndName[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});

  const getFavoriteDocRef = (talentAccountId: string) => {
    if (!account?.ref?.id || !talentAccountId) return null;
    return doc(
      firebaseFirestore,
      'theater_talent_favorites',
      `${account.ref.id}_${talentAccountId}_${production?.production_id}_${currentRoleId}`
    );
  };

  const fetchFavoriteStatus = async (talentAccountId: string) => {
    const docRef = getFavoriteDocRef(talentAccountId);
    if (!docRef) return;

    try {
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setFavorites((prev) => ({
          ...prev,
          [talentAccountId]: docSnap.data().status
        }));
      } else {
        setFavorites((prev) => ({
          ...prev,
          [talentAccountId]: false
        }));
      }
    } catch (error) {
      console.error('Error fetching favorite status:', error);
      setFavorites((prev) => ({
        ...prev,
        [talentAccountId]: false
      }));
    }
  };

  const toggleFavorite = async (talentAccountId: string) => {
    const docRef = getFavoriteDocRef(talentAccountId);
    if (!docRef) return;

    try {
      const newStatus = !favorites[talentAccountId];
      await setDoc(docRef, {
        initiated_by: 'theatre',
        production_id: doc(
          firebaseFirestore,
          'productions',
          production?.production_id || ''
        ),
        role_id: currentRoleId,
        status: newStatus,
        talent_account_id: doc(firebaseFirestore, 'accounts', talentAccountId)
      });
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
          m.account_id,
          'theater' // initiated by theater
        );

        // Fetch favorite status for each profile
        if (m.account_id) {
          fetchFavoriteStatus(m.account_id);
        }

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

  useEffect(() => {
    fetchFullNames();
  }, [firebaseFirestore, matches]);

  if (loading || cardsLoading) return <p>Loading...</p>;
  if (!profiles.length) return <p>No matches found</p>;

  const getCurrentRole = roles?.find((r) => r.role_id === currentRoleId);

  return (
    <div className="flex flex-col gap-6">
      {profiles.map((profile) => (
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
