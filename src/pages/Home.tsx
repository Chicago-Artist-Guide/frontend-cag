import React from 'react';
import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import Nav from 'react-bootstrap/Nav';
import { Link } from 'react-router-dom';
import { colors } from '../theme/styleVars';
import PageContainer from '../components/layout/PageContainer';
import { Tagline, Title } from '../components/layout/Titles';

const Home = () => {
  return (
    <>
      <PageContainer>
        <Row>
          <Col lg={8}>
            <Title>CHICAGO ARTIST GUIDE</Title>
            <Tagline>Diversifying theater one connection at a time.</Tagline>
            <StartButton>
              <Nav.Link as={Link} to="/login">
                GET STARTED
              </Nav.Link>
            </StartButton>
          </Col>
        </Row>
        <Row></Row>
      </PageContainer>
    </>
  );
};

const StartButton = styled(Button)`
  height: 40px;
  width: 151px;
  display: flex;
  background: ${colors.slate};
  font: inherit;
  border: 0px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;

  .nav-link {
    color: #fff;
    flex-shrink: 0;
  }
`;

export default Home;
