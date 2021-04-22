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
import { colors } from '../../theme/styleVars';

const Team = (props: any) => {
  const { affiliation, bio, id, image, linkedin, name, pronouns, role } = props;

  return (
    <MarginTeam key={id}>
      <Accordion defaultActiveKey="0">
        <PersonCard>
          <TopRow className="align-items-center justify-content-center">
            <Col md={5} xs={5}>
              <PersonImg fluid src={image} />
            </Col>
            <Col md={7} style={{ padding: 0 }} xs={7}>
              <Card.Body style={{ padding: 0 }}>
                <PersonName>{name}</PersonName>
                <PersonPronouns>{pronouns}</PersonPronouns>
                <PersonRole>{role}</PersonRole>
                {linkedin != null && (
                  <Nav.Link
                    href={`https://www.linkedin.com/in/${linkedin}`}
                    style={{ padding: 0 }}
                    target="_blank"
                  >
                    <BioLogo src={LinkedinLogo} />
                  </Nav.Link>
                )}
                {bio != null && (
                  <Accordion.Toggle className="button" eventKey={id}>
                    View Bio
                  </Accordion.Toggle>
                )}
              </Card.Body>
            </Col>
          </TopRow>
          <Accordion.Collapse eventKey={id}>
            <BottomRow>
              <BioCol>
                <BioText className="caption">
                  <b>{affiliation != null && affiliation + '\n\n'}</b>
                  {name} ({pronouns}) - {bio}
                </BioText>
              </BioCol>
            </BottomRow>
          </Accordion.Collapse>
        </PersonCard>
      </Accordion>
    </MarginTeam>
  );
};

const PersonCard = styled(Card)`
  border: none;
  border-radius: 5px;
  box-shadow: 5px 5px 5px ${colors.lightGrey};
  width: 22rem;

  .button {
    background: ${colors.lightestGrey};
    border: none;
    border-radius: 20px;
    box-shadow: 2px 2px 5px ${colors.lightGrey};
    padding: 10px 15px;

    &:hover {
      background: ${colors.lightGrey};
      box-shadow: inset 1px 1px 2px ${colors.darkGrey};
    }
  }

  ${media.smaller`
    width: auto;
  `}
`;

const TopRow = styled(Row)`
  height: 9rem;
  margin: 2px;
`;

const BottomRow = styled(Row)`
  height: 11rem;
  margin: 2px;
`;

const PersonImg = styled(Image)`
  border-radius: 5px;
`;

const MarginTeam = styled.div`
  margin-bottom: 10px;
  margin-top: 10px;
`;

const PersonName = styled.h5`
  font-size: 14px;
  font-weight: 700;
  line-height: 16px;
  margin: 0;
  padding: 0;
  text-transform: uppercase;
`;

const PersonPronouns = styled.p`
  color: ${colors.darkGrey};
  font-size: 14px;
  line-height: 16px;
  margin: 0;
  padding: 0;
`;

const PersonRole = styled.h5`
  color: ${colors.darkGrey};
  font-size: 13px;
  line-height: 15px;
  margin: 0;
  padding: 0;
`;

const BioLogo = styled(Image)`
  height: 25px;
  margin-bottom: 5px;
  width: 25px;

  ${media.sm`
    height: 20px;
    width: 20px;
  `}
`;

const BioCol = styled(Col)`
  height: auto;
`;

const BioText = styled.p`
  font-size: 13px;
  height: 11rem;
  line-height: 17px;
  overflow-x: hidden;
  overflow-y: auto;
  white-space: pre-wrap;

  ::-webkit-scrollbar {
    width: 10px;
  }

  ::-webkit-scrollbar-track {
    background: ${colors.lightGrey};
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb {
    background: ${colors.peach};
    border-radius: 10px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${colors.scrollOrange};
  }
`;
export default Team;
