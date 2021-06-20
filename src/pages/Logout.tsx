import React, { useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import Cookies from 'js-cookie';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import { Title } from '../components/layout/Titles';

const Logout = () => {
  useEffect(() => {
    Cookies.remove('session');
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
