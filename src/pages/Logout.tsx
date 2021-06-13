import React, { useEffect } from 'react';
import { createBrowserHistory } from 'history';
import Cookies from 'js-cookie';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import { Title } from '../components/layout/Titles';

const Logout = () => {
  const history = createBrowserHistory();

  useEffect(
    () => {
      Cookies.remove('session');
      history.push('/login');
    },
    [history]
  );

  return (
    <PageContainer>
      <Row>
        <Col lg="8">
          <Title>Logging out...</Title>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Logout;