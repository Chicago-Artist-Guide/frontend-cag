import React from 'react';
import { useParams } from 'react-router-dom';
import { useFirebaseContext } from '../context/FirebaseContext';
import { MatchProvider } from '../context/MatchContext';
import { Title } from '../components/layout/Titles';
import { MatchesPageContainer } from '../components/Matches/MatchesPageContainer';
import { PageContainer } from '../components/layout';

const Matches = () => {
  const { firebaseFirestore } = useFirebaseContext();
  const { productionId, roleId } = useParams();

  return (
    <MatchProvider
      productionId={productionId}
      roleIdParam={roleId}
      firestore={firebaseFirestore}
    >
      <PageContainer>
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <Title>Matches</Title>
            <MatchesPageContainer />
          </div>
        </div>
      </PageContainer>
    </MatchProvider>
  );
};

export default Matches;
