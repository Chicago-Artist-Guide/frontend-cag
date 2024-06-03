import React from 'react';
import { IndividualProfileDataFullInit } from '../../components/SignUp/Individual/types';

type TalentMatchCardProps = {
  profile: IndividualProfileDataFullInit;
  fullName: string;
};

export const TalentMatchCard = ({
  profile,
  fullName
}: TalentMatchCardProps) => {
  return (
    <div>
      <h3>{fullName}</h3>
      <p>
        Ethnicity <strong>{profile.ethnicities?.join(', ') || 'N/A'}</strong>
        <br />
        Age Range <strong>{profile.age_ranges?.join('; ') || 'N/A'}</strong>
        <br />
        Gender <strong>{profile.gender_identity || 'N/A'}</strong>
        <br />
        Special Skills{' '}
        <strong>
          {profile.additional_skills_checkboxes?.join(', ')}{' '}
          {profile.additional_skills_manual?.join(', ')}
        </strong>
      </p>
    </div>
  );
};
