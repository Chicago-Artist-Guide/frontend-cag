import React from 'react';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import PageContainer from '../components/layout/PageContainer';
import { Title } from '../components/layout/Titles';

const Messages = () => {
  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <Title>Messages</Title>
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Messages;
