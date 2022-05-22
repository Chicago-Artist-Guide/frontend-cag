import { signOut } from 'firebase/auth';
import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { useFirebaseContext } from '../context/FirebaseContext';
import PageContainer from '../components/layout/PageContainer';
import { Title } from '../components/layout/Titles';

const Logout = () => {
  const { firebaseAuth } = useFirebaseContext();

  useEffect(() => {
    signOut(firebaseAuth)
      .then(() => {
        console.log('Sign out successful');
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
