import React from 'react';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { MatchesFilterBar } from './MatchesFilterBar';
import { MatchesList } from './MatchesList';

export const MatchesPageContainer = () => {
  return (
    <Container>
      <Row>
        <Col lg={4}>
          <MatchesFilterBar />
        </Col>
        <Col lg={8}>
          <MatchesList />
        </Col>
      </Row>
    </Container>
  );
};
