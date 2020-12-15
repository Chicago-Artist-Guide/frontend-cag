import React from "react";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SVGLayer from "../components/SVGLayer";
import blueBlob from "../images/blue_blob.svg";
import streamingDance from "../images/streaming_dance.svg";

const FAQ = () => {
  const questions = [
    {
      id: 1,
      question: "WHO IS ABLE TO SEE THE PROFILE INFORMATION?",
      answer:
        "Your profile is only viewable to theater companies on the platform."
    },
    {
      id: 2,
      question: "CAN USERS CHOOSE NOT TO ENTER CERTAIN INFORMATION?",
      answer:
        "Users have the option to enter information that they see fit when creating their profile. We recommend filling in as much information as possible to be considered for more roles. You may update your information at any time. If information is missing, theater companies may contact you to provide further detail."
    },
    {
      id: 3,
      question: "HOW DO THEATER COMPANIES USE OUR SERVICES?",
      answer:
        "Theatre companies have access to see all profiles. Not all identity information is displayed on an individual’s profile, however theatre companies can use certain filters to search for people who fit the demographic in which they are searching."
    },
    {
      id: 4,
      question: "WILL I BE EXCLUDED FROM SEARCHES BASED ON HOW I IDENTIFY?",
      answer:
        "If the theatre company puts no identifiers on their posting, then everyone is eligible. There are no options to filter people by the majority identities of cis, straight, and white. This means, only people in underrepresented groups will have access to roles specifically created for them."
    },
    {
      id: 5,
      question: "HOW WAS YOUR WEBSITE BUILT?",
      answer:
        "We use React for the frontend and AWS microservices for the backend."
    },
    {
      id: 6,
      question: "WHO IS CHICAGO ARTIST GUIDE",
      answer:
        "We are a 501(c)(3) nonprofit organization run by a team of volunteers with experience in theatre, nonprofits, and technology."
    }
  ];

  return (
    <Container className="margin-container">
      {/*Hero Section*/}
      <Row>
        <Col lg={8}>
          <h1 className="title">FREQUENTLY ASKED QUESTIONS</h1>
          <h2 className="tagline">Find out what we're all about</h2>
          {questions.map(qa => (
            <div className="margin-team">
              <h3 className="subtitle">{qa.question}</h3>
              <p>{qa.answer}</p>
            </div>
          ))}
        </Col>
        <Col lg={4}>
          <SVGLayer blob={blueBlob} dancer={streamingDance} />
        </Col>
      </Row>
    </Container>
  );
};

export default FAQ;
