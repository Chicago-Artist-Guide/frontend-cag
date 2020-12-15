import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Team from '../components/WhoWeAre/Team';
import SVGLayer from '../components/SVGLayer';
import greenBlob from '../images/green_blob.svg';
import WAWDance from '../images/waw_dance.svg';
import Fayfer from '../images/who-we-are/fayfer-matt.jpg';
import Geis from '../images/who-we-are/geis-leah.jpg';
import Mccoy from '../images/who-we-are/mccoy-kayswanna.jpg';
import Schutz from '../images/who-we-are/schutz-anna.png';
import Voghel from '../images/who-we-are/voghel-alison.png';
import Zacks from '../images/who-we-are/zacks-steven.png';

const WhoWeAre = () => {
  const team = [
    {
      id: 1,
      name: 'ANNA SCHUTZ (SHE/HER)',
      subtitle: 'Founder + Exective Director',
      image: Schutz
    },
    {
      id: 2,
      name: 'MATT FAYFER (HE/HIM)',
      subtitle: 'Managing Director',
      image: Fayfer
    },
    {
      id: 3,
      name: 'LEAH GEIS (SHE/HER)',
      subtitle: 'Development Director',
      image: Geis
    },
    {
      id: 4,
      name: 'KAYSWANNA KEI MCCOY (SHE/HER)',
      subtitle: 'Research Director',
      image: Mccoy
    },
    {
      id: 5,
      name: 'STEVEN ZACKS (HE/HIM)',
      subtitle: 'Head of Product',
      image: Zacks
    },
    {
      id: 6,
      name: 'ALISON VOGHEL (SHE/HER)',
      subtitle: 'UIUX/Desginer',
      image: Voghel
    }
  ];

  return (
    <Container className="margin-container">
      {/*Hero Section*/}
      <Row>
        <Col lg={7}>
          <h1 className="title">WHO WE ARE</h1>
          <div className="mt-5">
            <h3 className="subtitle">BOARD OF DIRECTORS</h3>
            <br />
            <p>President | Anna Schutz (she/her)</p>
            <p>Secretary | Leah Geis (she/her)</p>
            <p>Treasurer | Matt Fayfer (he/him)</p>
          </div>
        </Col>
        <Col lg={5}>
          <SVGLayer blob={greenBlob} dancer={WAWDance} />
        </Col>
      </Row>
      <h3 className="subtitle margin-top">THE TEAM</h3>
      <Row>
        {team.map(who => (
          <Col key={who.id} md={4}>
            <Team image={who.image} name={who.name} subtitle={who.subtitle} />
          </Col>
        ))}
      </Row>
      <Row className="margin-team">
        <Col lg={6}>
          <h3 className="subtitle">JOIN US</h3>
          <p>
            We are still growing and looking for people to join our team. Email{" "}
            <span id="email">chicagoartistguide@gmail.com</span> for more
            information.
          </p>
        </Col>
        <Col lg={6}>
          <h3 className="subtitle">SPECIAL THANKS</h3>
          <p>
            Nicole Brennan, Samantha Dzirko, Joey Harbert, Charlie Sheets,
            Luciana Mendez Gonzalez
          </p>
        </Col>
      </Row>
      <h1 className="title">Vision</h1>
      <h2 className="tagline">Theatre made by anyone, for everyone</h2>
      <h1 className="title">Mission</h1>
      <h2 className="tagline">
        We provide a centralized place for Chicago theatre companies, individual
        artists, and communities to come together. We remove common obstacles
        with time and money-saving resources so artists can focus on what’s most
        important: making art.
      </h2>
      <h1 className="title margin-team">Values</h1>
      <Row>
        <Col lg={6}>
          <h3 className="subtitle">ACCESSIBILITY</h3>
          <p>
            We provide easily accessible resources to empower those in
            marginalized groups to advocate for themselves. By leveraging online
            technologies, we eliminate geographical barriers so that more
            artists can connect to work across the city.
          </p>
          <h3 className="subtitle">CONTINUED LEARNING</h3>
          <p>
            We are committed to bettering ourselves, our services, and our
            industry. We are open to feedback to stay current in our practices.
          </p>
          <h3 className="subtitle">INCLUSION</h3>
          <p>
            We are committed to bettering ourselves, our services, and our
            industry. We are open to feedback to stay current in our practices.
          </p>
        </Col>
        <Col>
          <h3 className="subtitle">SAFETY</h3>
          <p>
            Your safety and the privacy of your data are of the utmost
            importance to us. We are committed to following, and (where we’re
            able) exceeding industry standards and best practices with regard to
            safeguarding your information. - CAG is committed to full
            transparency with regard to what data we collect from you, why we
            are collecting it, and, most importantly, what will and will not be
            displayed publicly for on your profile or elsewhere on our site. -
            CAG will never share your information without your explicit,
            affirmative consent -CAG will never sell your data to a third party
          </p>
        </Col>
      </Row>
    </Container>
  );
};

export default WhoWeAre;
