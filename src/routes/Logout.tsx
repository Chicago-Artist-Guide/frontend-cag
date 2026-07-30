import { signOut } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { Navigate } from 'react-router-dom';
import PageContainer from '../components/layout/PageContainer';
import { Title } from '../components/layout/Titles';
import { useFirebaseContext } from '../context/FirebaseContext';
import { useUserContext } from '../context/UserContext';

const Logout = () => {
  const { firebaseAuth } = useFirebaseContext();
  const { setAccount, setProfile } = useUserContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    signOut(firebaseAuth)
      .then(() => {
        setAccount({ id: null, data: null });
        setProfile({ id: null, data: null });
      })
      .catch((err) => {
        console.log('Sign out error', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageContainer>
      <Row>
        <Col lg="8">
          <Title>Logging out...</Title>
          {!loading && <Navigate to="/login" replace />}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Logout;
