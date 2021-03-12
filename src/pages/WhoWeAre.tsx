import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
//import Team from '../components/WhoWeAre/Team';
import Departments from '../components/WhoWeAre/Departments';
//import SVGLayer from '../components/SVGLayer';
//import greenBlob from '../images/green_blob.svg';
//import WAWDance from '../images/waw_dance.svg';
import styled from 'styled-components';
//import Fayfer from '../images/who-we-are/fayfer-matt.jpg';
//import Geis from '../images/who-we-are/geis-leah.jpg';
//import Mccoy from '../images/who-we-are/mccoy-kayswanna.jpg';
//import Schutz from '../images/who-we-are/schutz-anna.png';
//import Voghel from '../images/who-we-are/voghel-alison.png';
//import Jewell from '../images/who-we-are/jewell-alexander.jpg';
//import Nicholson from '../images/who-we-are/nicholson-cody.jpg';
//import Zacks from '../images/who-we-are/zacks-steven.png';
//import Accordion from 'react-bootstrap/Accordion';
//import Card from 'react-bootstrap/Card';

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

      {/*
      <Row>
        <Col lg={7}>
          <Title>WHO WE ARE</Title>
          <div className="mt-5">
            <TitleThree>BOARD OF DIRECTORS</TitleThree>
            <p>President | Anna Schutz (she/her)</p>
            <p>Secretary | Leah Geis (she/her)</p>
            <p>Treasurer | Matt Fayfer (he/him)</p>
            <p>Member | Hallie Gordon (she/her)</p>
          </div>
          <div className="mt-5 mb-5">
            <TitleThree>ADVISORY BOARD</TitleThree>
            <p>Luciana Mendez Gonzalez (any)</p>
            <p>Zev Steinrock (he/him)</p>
          </div>
        </Col>
        <Col lg={5}>
          <SVGLayer blob={greenBlob} dancer={WAWDance} />
        </Col>
      </Row>
      <Row>
        <Col lg={7}>
          <TitleThree>THE TEAM</TitleThree>
        </Col>
      </Row>
      <Row>
        {team.map(who => (
          <Col key={who.id} md={3}>
            <Team
              image={who.image}
              name={who.name}
              pronoun={who.pronoun}
              subtitle={who.subtitle}
            />
          </Col>
        ))}
      </Row>
      <Row className="margin-team">
        <Col lg={7}>
          <TitleThree>DEVELOPERS</TitleThree>
          <p>Austin Oie (he/him)</p>
          <p>Pedro Rebollar (he/him)</p>
          <p>Kaitlyn Salemi (she/her)</p>
          <p>Morgan Volland (she/her)</p>
          <p>James Wilson (he/him)</p>
        </Col>
      </Row>
      <Row className="margin-team">
        <Col lg={6}>
          <TitleThree>JOIN US</TitleThree>
          <p>
            We are still growing and looking for people to join our team. Email{' '}
            <a href="mailto:contact@chicagoartistguide.org">
              <span className="orangeText">contact@chicagoartistguide.org</span>
            </a>{' '}
            for more information.
          </p>
        </Col>
      </Row>
      <Title>Vision</Title>
      <Tagline>Theatre made by anyone, for everyone.</Tagline>
      <Title>Mission</Title>
      <Tagline>
        We provide a centralized place for Chicago theatre companies, individual
        artists, and communities to come together. We remove common obstacles
        with time and money-saving resources so artists can focus on what’s most
        important: making art.
      </Tagline>
      <Title className="margin-team">Values</Title>
      <Row>
        <Col lg={6}>
          <TitleThree>ACCESSIBILITY</TitleThree>
          <p>
            We provide easily accessible resources to empower those in
            marginalized groups to advocate for themselves. By leveraging online
            technologies, we eliminate geographical barriers so that more
            artists can connect to work across the city.
          </p>
          <TitleThree>CONTINUED LEARNING</TitleThree>
          <p>
            We are committed to bettering ourselves, our services, and our
            industry. We are open to feedback to stay current in our practices.
          </p>
          <TitleThree>INCLUSION</TitleThree>
          <p>
            We are committed to bettering ourselves, our services, and our
            industry. We are open to feedback to stay current in our practices.
          </p>
        </Col>
        <Col>
          <TitleThree>SAFETY</TitleThree>
          <p>
            Your safety and the privacy of your data are of the utmost
            importance to us. We are committed to following, and (where we’re
            able) exceeding industry standards and best practices with regard to
            safeguarding your information.
          </p>
          <ul>
            <li>
              <p>
                CAG is committed to full transparency with regard to what data
                we collect from you, why we are collecting it, and, most
                importantly, what will and will not be displayed publicly for on
                your profile or elsewhere on our site.
              </p>
            </li>
            <li>
              <p>
                CAG will never share your information without your explicit,
                affirmative consent.
              </p>
            </li>
            <li>
              <p>CAG will never sell your data to a third party.</p>
            </li>
          </ul>
        </Col>
      </Row>
            */}
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
