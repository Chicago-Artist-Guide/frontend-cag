import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import Departments from '../components/WhoWeAre/Departments';

const WhoWeAre = () => {
  return (
    <PageContainer>
      <Row>
        <Col>
          <h1>THE TEAM</h1>
          <Departments />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default WhoWeAre;
