import React, { useEffect, useState } from 'react';
import { useMatches } from '../../context/MatchContext';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { getMatchName } from '../../utils/firebaseUtils';
import { IndividualProfileDataFullInit } from '../../components/SignUp/Individual/types';
import { TalentMatchCard } from './TalentMatchCard';

type ProfileAndName = IndividualProfileDataFullInit & { fullName: string };

export const TalentMatchList = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const { matches } = useMatches();
  const [profiles, setProfiles] = useState<ProfileAndName[]>([]);

  useEffect(() => {
    const fetchFullNames = async () => {
      const profilesWithNames = await Promise.all(
        matches.map(async (m) => {
          const fullName = await getMatchName(firebaseFirestore, m.account_id);
          return { ...m, fullName };
        })
      );

      setProfiles(profilesWithNames);
    };

    fetchFullNames();
  }, [firebaseFirestore, matches]);

  return (
    <div>
      {profiles.map((profile) => (
        <TalentMatchCard
          key={`${profile.uid}-TalentMatchCard`}
          fullName={profile.fullName}
          profile={profile}
        />
      ))}
    </div>
  );
};
