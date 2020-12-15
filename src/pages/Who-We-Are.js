import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Green_blob from '../images/green_blob.svg';
import WAW_Dance from '../images/waw_dance.svg';
import Team from "../components/Who-We-Are/team.js";
import Fayfer from '../images/who-we-are/fayfer-matt.jpg';
import Geis from '../images/who-we-are/geis-leah.jpg';
import Mccoy from '../images/who-we-are/mccoy-kayswanna.jpg';
import Schutz from '../images/who-we-are/schutz-anna.png';
import Voghel from '../images/who-we-are/voghel-alison.png';
import Zacks from '../images/who-we-are/zacks-steven.png';
import Jewell from '../images/who-we-are/jewell-alexander.png';
import Nicholson from '../images/who-we-are/nicholson-cody.jpg';
import SVGLayer from "../components/svg-layer.js";

function WhoWeAre() {
const team = [
    {id:1,name:"ANNA SCHUTZ",pronoun:"SHE/HER",subtitle:"Exective Director",image:Schutz},
    {id:2,name:"MATT FAYFER",pronoun:"HE/HIM",subtitle:"Managing Director",image:Fayfer},
    {id:3,name:"KAYSWANNA KEI MCCOY",pronoun:"SHE/HER",subtitle:"Research Director",image:Mccoy},
    {id:4,name:"LEAH GEIS",pronoun:"SHE/HER",subtitle:"Communications Manager",image:Geis},
    {id:5,name:"STEVEN ZACKS",pronoun:"HE/HIM",subtitle:"Head of Platform",image:Zacks},
    {id:6,name:"ALISON VOGHEL",pronoun:"SHE/HER",subtitle:"UIUX/Desginer",image:Voghel},
    {id:7,name:"ALEX JEWELL",pronoun:"HE/HIM",subtitle:"Engineering Lead",image:Jewell},
    {id:8,name:"CODY NICHOLSON",pronoun:"HE/HIM",subtitle:"Engineering Lead",image:Nicholson},
]
  return (
      <Container className="margin-container">
        {/*Hero Section*/}
      <Row>
        <Col lg={7}>
        <h1 className="title">WHO WE ARE</h1>
        <div className="mt-5">
          <h3 className="subtitle">BOARD OF DIRECTORS</h3>
          <p>President | Anna Schutz (she/her)</p> 
          <p>Secretary | Leah Geis (she/her)</p>
          <p>Treasurer | Matt Fayfer (he/him)</p>
        </div>
        <div className="mt-5 mb-5">
          <h3 className="subtitle">ADVISORY BOARD</h3>
          <p>Luciana Mendez Gonzalez (any)</p> 
          <p>Zev Steinrock (he/him)</p>
        </div>
        </Col>
        <Col lg={5}>
        <SVGLayer blob={Green_blob} dancer={WAW_Dance}/>
        </Col>
      </Row>
          
        <h3 className="subtitle margin-top">THE TEAM</h3>
        <Row>
            {team.map(who=>(
                <Col md={3} key={who.id}>
                  <Team name={who.name} subtitle={who.subtitle} image={who.image} pronoun={who.pronoun}/>
                </Col>
              ))}
          </Row>

          <Row className="margin-team">
            <Col lg={6}>

            <h3 className="subtitle">JOIN US</h3>
            <p>We are still growing and looking for people to join our team. Email <span id="email">contact@chicagoartistguide.org</span> for more information.</p>
          
            </Col>

          </Row>

            <h1 className="title">Vision</h1>
            <h2 className="tagline">Theatre made by anyone, for everyone</h2>

            <h1 className="title">Mission</h1>
            <h2 className="tagline">We provide a centralized place for Chicago theatre companies, individual artists, and communities to come together. We remove common obstacles with time and money-saving resources so artists can focus on what’s most important: making art.</h2>

            <h1 className="title margin-team">Values</h1>

            <Row>
                <Col lg={6}>
                <h3 className="subtitle">ACCESSIBILITY</h3>
                <p>
                We provide easily accessible resources to empower those in marginalized groups to advocate for themselves. 
                By leveraging online technologies, we eliminate geographical barriers so that more artists can connect to work across the city.
                </p>

                <h3 className="subtitle">CONTINUED LEARNING</h3>
                <p>
                We are committed to bettering ourselves, our services, and our industry. 
                We are open to feedback to stay current in our practices.
                </p>
                <h3 className="subtitle">INCLUSION</h3>
                <p>
                We are committed to bettering ourselves, our services, and our industry. 
                We are open to feedback to stay current in our practices.   
                </p>
                </Col>

                <Col>
                <h3 className="subtitle">SAFETY</h3>
                <p>
                Your safety and the privacy of your data are of the utmost importance to us. We are committed to following, and (where we’re able) exceeding industry standards and best practices with regard to safeguarding your information. 
                </p>
                <ul>
                  <li><p>
                  CAG is committed to full transparency with regard to what data we collect from you, why we are collecting it, and, most importantly, what will and will not be displayed publicly for on your profile or elsewhere on our site. 
                  </p>
                  </li>
                  <li><p>
                  CAG will never share your information without your explicit, affirmative consent.   
                  </p></li>
                  <li><p>
                  CAG will never sell your data to a third party.  
                  </p>
                  </li>
                </ul>
                </Col>
            </Row>

            
      </Container>
);
}

export default WhoWeAre;
