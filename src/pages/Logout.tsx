import { signOut } from 'firebase/auth';
import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useFirebaseContext } from '../context/FirebaseContext';
import PageContainer from '../components/layout/PageContainer';
import { Title } from '../components/layout/Titles';
import { useProfileContext } from '../context/ProfileContext';

const Logout = () => {
  const { firebaseAuth } = useFirebaseContext();
  const {
    setAccountRef,
    setAccountData,
    setProfileRef,
    setProfileData
  } = useProfileContext();

  useEffect(() => {
    signOut(firebaseAuth)
      .then(() => {
        setAccountRef(null);
        setAccountData(null);
        setProfileRef(null);
        setProfileData(null);
      })
      .catch(err => {
        console.log('Sign out error', err);
      });
  }, []);

  return (
    <PageContainer>
      <Row>
        <Col lg="8">
          <Title>Logging out...</Title>
          <Redirect to="/login" />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Logout;
