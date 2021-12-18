import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import { Tagline, Title, TitleThree } from '../components/layout/Titles';
import SVGLayer from '../components/SVGLayer';
import blueBlob from '../images/blue_blob.svg';
import streamingDance from '../images/streaming_dance.svg';

const FAQ = () => {
  const aboutQ = [
    {
      id: 1,
      question: 'Why was CAG created?',
      answer: [
        'You can read more about our founding ',
        <a href="https://medium.com/chiartistguide/diversifying-and-strengthening-theater-in-chicago-2145d83806e2">
          here
        </a>,
        '.'
      ]
    },
    {
      id: 2,
      question: 'Who is CAG?',
      answer:
        'We are a 501(c)(3) nonprofit organization run by a team of volunteers with experience in theatre, nonprofits, and technology. '
    },
    {
      id: 3,
      question: 'Can I join?',
      answer: [
        'We are still growing and looking for people to join our team. ',
        <a href="mailto:contact@chicagoartistguide.org">Email</a>,
        ' us for more information.'
      ]
    }
  ];

  const platformQ = [
    {
      id: 1,
      question: 'Is it free?',
      answer: 'Yes! All features are currently free on Chicago Artist Guide.'
    },
    {
      id: 2,
      question: 'How do theater companies use our services?',
      answer:
        'Theatre companies have access to see all profiles. Not all identity information is displayed on an individual’s profile, however theatre companies can use certain filters to search for people who fit the demographic in which they are searching.'
    },
    {
      id: 3,
      question: 'How was your website built? ',
      answer:
        'We use React for the frontend and AWS microservices for the backend.'
    }
  ];

  const privacyQ = [
    {
      id: 1,
      question: 'Who is able to see the profile information?',
      answer:
        'Your profile is only viewable to theater companies on the platform in relation to their production requirements. '
    },
    {
      id: 2,
      question: 'Can users choose not to enter certain information?',
      answer:
        'Users have the option to enter information that they see fit when creating their profile. We recommend filling in as much information as possible to be considered for more roles.  You may update your information at any time. If information is missing, theater companies may contact you to provide further detail.'
    },
    {
      id: 3,
      question: 'What if I want to know about how my data is being used?',
      answer: [
        'Please read our ',
        <a href="https://www.chicagoartistguide.org/terms-of-service">
          Terms of Service
        </a>,
        ' for more details.'
      ]
    }
  ];

  const identityQ = [
    {
      id: 1,
      question: 'Will I be excluded from searches based on how I identify?',
      answer:
        'If the theatre company puts no identifiers on their posting, then everyone is eligible. There are no options to filter people by the majority identities of cis and straight. We also encourage producers not to filter roles as “white” unless it is specifically outlined by the playwright.  This means, only people in underrepresented groups will have access to roles specifically created for them.'
    },
    {
      id: 2,
      question: 'How was the identity selection chosen?',
      answer: [
        'Options were selected based on their relevance to casting and hiring specifically for theatre. Research, interviews, and testing were used to create the first version of our selections. Read more about our process from our Research Director ',
        <a href="https://medium.com/chiartistguide/our-research-method-705c7e5b7c8">
          here
        </a>,
        '.'
      ]
    }
  ];

  return (
    <PageContainer>
      <Row>
        <Col lg={8}>
          <Title>FREQUENTLY ASKED QUESTIONS</Title>
          <Tagline>Find out what we're all about</Tagline>
          <h3>About Chicago Artist Guide</h3>
          {aboutQ.map(qa => (
            <div className="margin-team" key={qa.id}>
              <TitleThree>{qa.question}</TitleThree>
              <p>{qa.answer}</p>
            </div>
          ))}
          <h3>Our Platform</h3>
          {platformQ.map(qa => (
            <div className="margin-team" key={qa.id}>
              <TitleThree>{qa.question}</TitleThree>
              <p>{qa.answer}</p>
            </div>
          ))}
          <h3>Privacy</h3>
          {privacyQ.map(qa => (
            <div className="margin-team" key={qa.id}>
              <TitleThree>{qa.question}</TitleThree>
              <p>{qa.answer}</p>
            </div>
          ))}
          <h3>Identity</h3>
          {identityQ.map(qa => (
            <div className="margin-team" key={qa.id}>
              <TitleThree>{qa.question}</TitleThree>
              <p>{qa.answer}</p>
            </div>
          ))}
        </Col>
        <Col lg={4}>
          <SVGLayer blob={blueBlob} dancer={streamingDance} />
        </Col>
      </Row>
    </PageContainer>
  );
};

export default FAQ;
