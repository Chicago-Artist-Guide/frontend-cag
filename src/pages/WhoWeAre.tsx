import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import Departments from '../components/WhoWeAre/Departments';
import styled from 'styled-components';

const WhoWeAre = () => {
  return (
    <PageContainer>
      <Row>
        <Col>
          <h1>THE TEAM</h1>

          <BoardOfDirectors className="mt-5">
            <h2>BOARD OF DIRECTORS</h2>
            <p>President | Anna Schutz (she/her)</p>
            <p>Secretary | Rossana Quixito (she/her)</p>
            <p>Treasurer | Matt Fayfer (he/him)</p>
          </BoardOfDirectors>

          <Departments />
        </Col>
      </Row>
    </PageContainer>
  );
};

const BoardOfDirectors = styled.div`
  p {
    padding: 0;
    margin: 0;
  }
`;

export default WhoWeAre;
