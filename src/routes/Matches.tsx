import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PageContainer } from '../components/layout';
import { Title } from '../components/layout/Titles';
import { MatchesPageContainer } from '../components/Matches/MatchesPageContainer';
import { useFirebaseContext } from '../context/FirebaseContext';
import { MatchProvider } from '../context/MatchContext';
import { RoleMatchProvider } from '../context/RoleMatchContext';
import { useUserContext } from '../context/UserContext';

const Matches = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const { productionId, roleId } = useParams();
  const { account } = useUserContext();
  const [accountType, setAccountType] = useState(null);

  useEffect(() => {
    const accountData = account?.data;

    if (accountData) {
      setAccountType(accountData.type);
    }
  }, [account]);

  const InsideMatchPage = () => (
    <PageContainer>
      <div className="-mx-4 flex flex-wrap">
        <div className="w-full px-2 sm:px-4">
          <Title>Matches</Title>
          <MatchesPageContainer />
        </div>
      </div>
    </PageContainer>
  );

  return accountType === 'individual' ? (
    <RoleMatchProvider firestore={firebaseFirestore}>
      <InsideMatchPage />
    </RoleMatchProvider>
  ) : (
    <MatchProvider
      productionId={productionId ?? ''}
      roleIdParam={roleId ?? ''}
      firestore={firebaseFirestore}
    >
      <InsideMatchPage />
    </MatchProvider>
  );
};

export default Matches;
