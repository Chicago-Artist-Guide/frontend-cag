import React, { useEffect, useState } from 'react';
import { useMatches } from '../../context/MatchContext';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { getMatchName, getTheaterTalentMatch } from '../../utils/firebaseUtils';
import { IndividualProfileDataFullInit } from '../../components/SignUp/Individual/types';
import { TalentMatchCard } from './TalentMatchCard';

type ProfileAndName = IndividualProfileDataFullInit & {
  fullName: string;
  matchStatus: boolean | null;
};

export const TalentMatchList = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const { loading, matches, production, currentRoleId } = useMatches();
  const [profiles, setProfiles] = useState<ProfileAndName[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);

  // TODO: check if an existing match status exists in theater_talent_matches
  useEffect(() => {
    const fetchFullNames = async () => {
      const profilesWithNames = await Promise.all(
        matches.map(async (m) => {
          const fullName = await getMatchName(firebaseFirestore, m.account_id);
          const findMatch = await getTheaterTalentMatch(
            firebaseFirestore,
            production?.production_id || '',
            currentRoleId || '',
            m.account_id
          );
          const matchStatus = findMatch ? findMatch.status : null;
          return { ...m, fullName, matchStatus };
        })
      );

      setProfiles(profilesWithNames);
      setCardsLoading(false);
    };

    fetchFullNames();
  }, [firebaseFirestore, matches]);

  return (
    <div>
      {loading || cardsLoading ? (
        <p>Loading...</p>
      ) : (
        <>
          {!profiles.length ? (
            <p>No matches found</p>
          ) : (
            <>
              {profiles.map((profile: ProfileAndName) => {
                const { fullName, matchStatus, ...restProfile } = profile;

                return (
                  <TalentMatchCard
                    key={`${profile.uid}-TalentMatchCard`}
                    fullName={fullName}
                    matchStatus={matchStatus}
                    profile={restProfile}
                    productionId={production?.production_id || ''}
                    roleId={currentRoleId || ''}
                  />
                );
              })}
            </>
          )}
        </>
      )}
    </div>
  );
};
