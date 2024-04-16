import React from 'react';
import { IndividualProfileDataFullInit } from '../../components/SignUp/Individual/types';

type TalentMatchCardProps = {
  profile: IndividualProfileDataFullInit;
};

export const TalentMatchCard = ({ profile }: TalentMatchCardProps) => {
  return (
    <div>
      <p>TalentMatchCard: {profile.account_id}</p>
    </div>
  );
};
