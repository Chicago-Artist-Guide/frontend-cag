import React from 'react';
import styled from 'styled-components';
import Image from 'react-bootstrap/Image';
import Card from 'react-bootstrap/Card';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';
import LinkedinLogo from '../../images/icons-footer/social_linkedin.png';
import Nav from 'react-bootstrap/Nav';
import { media } from 'styled-bootstrap-grid';

const Team = (props: any) => {
  const { bio, id, image, linkedin, name, pronoun, role } = props;

  return (
    <MarginTeam key={id}>
      <Accordion defaultActiveKey="0">
        <PersonCard>
          <Row>
            <Col md={5}>
              <PersonImg src={image} variant="top" />
            </Col>
            <Col md={7}>
              <Card.Body style={{ padding: 0 }}>
                <PersonName>{name}</PersonName>
                <PersonPronouns>{pronoun}</PersonPronouns>
                <PersonRole>{role}</PersonRole>
                {linkedin != null && (
                  <Nav.Link
                    href={`https://www.linkedin.com/in/${linkedin}`}
                    style={{ padding: 0 }}
                    target="_blank"
                  >
                    <FooterLogo src={LinkedinLogo} />
                  </Nav.Link>
                )}
                <Accordion.Toggle eventKey={id}>View Bio</Accordion.Toggle>
              </Card.Body>
            </Col>
          </Row>
          <Accordion.Collapse eventKey={id}>
            <Row>
              <Col>
                <p>{bio}</p>
              </Col>
            </Row>
          </Accordion.Collapse>
        </PersonCard>
      </Accordion>
    </MarginTeam>
  );
};

const PersonCard = styled(Card)`
  border-radius: 5px;
  width: 20rem;
`;

const PersonImg = styled(Card.Img)`
  border-radius: 5px;
`;

const MarginTeam = styled.div`
  margin-top: 10px;
  margin-bottom: 10px;
`;

const PersonName = styled.h5`
  font-weight: 700;
  text-transform: uppercase;
  padding: 0;
  margin: 0;
`;

const PersonPronouns = styled.p`
  margin: 0;
`;

const PersonRole = styled.h5`
  margin: 0;
`;

const FooterLogo = styled(Image)`
  height: 30px;
  width: 30px;
  padding: 0;

  ${media.sm`
    height: 25px;
    width: 25px;
  `}
`;
export default Team;
