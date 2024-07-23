import React from 'react';
import { useFirebaseContext } from '../../context/FirebaseContext';
import { createTheaterTalentMatch } from '../../utils/firebaseUtils';
import { IndividualProfileDataFullInit } from '../../components/SignUp/Individual/types';

type TalentMatchCardProps = {
  profile: IndividualProfileDataFullInit;
  fullName: string;
  productionId: string;
  roleId: string;
};

export const TalentMatchCard = ({
  profile,
  fullName,
  productionId,
  roleId
}: TalentMatchCardProps) => {
  const { firebaseFirestore } = useFirebaseContext();

  const createMatch = async (status: boolean) => {
    const talentAccountId = profile.account_id;

    await createTheaterTalentMatch(
      firebaseFirestore,
      productionId,
      roleId,
      talentAccountId,
      status
    );
  };

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
        Role Type: <strong>{profile.stage_role}</strong>
        <br />
        Special Skills{' '}
        <strong>
          {profile.additional_skills_checkboxes?.join(', ')}{' '}
          {profile.additional_skills_manual?.join(', ')}
        </strong>
      </p>
      <div>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            createMatch(true);
          }}
        >
          Approve
        </a>
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            createMatch(false);
          }}
        >
          Decline
        </a>
      </div>
    </div>
  );
};
