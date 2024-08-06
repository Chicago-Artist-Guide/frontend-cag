import React from 'react';
import { useParams } from 'react-router-dom';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useFirebaseContext } from '../context/FirebaseContext';
import { MatchProvider } from '../context/MatchContext';
import PageContainer from '../components/layout/PageContainer';
import { Title } from '../components/layout/Titles';
import { MatchesPageContainer } from '../components/Matches/MatchesPageContainer';

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
        <Row>
          <Col lg={12}>
            <Title>Matches</Title>
            <MatchesPageContainer />
          </Col>
        </Row>
      </PageContainer>
    </MatchProvider>
  );
};

export default Matches;
