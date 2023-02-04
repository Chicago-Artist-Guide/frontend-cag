import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import styled from 'styled-components';
import { colors } from '../theme/styleVars';
import PageContainer from '../components/layout/PageContainer';
import { Tagline, Title } from '../components/layout/Titles';
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
    },
    {
      id: 4,
      question: "What is CAG's Diversity, Equity, and Inclusion Commitment?",
      answer: [
        'We acknowledge that there is no one perfect way to achieve equity, but we are willing to take risks because there is much work to do.',
        <>
          <br />
          <br />
        </>,
        <>
          <u>Anti-Racism</u>
          <br />
        </>,
        'Racism is inherent to every aspect of our lives; it is woven into the fabric of society and  encompasses more than racial prejudices. Racism involves social, institutional and systemic powers. While we cannot separate ourselves from White Supremacy we are committed to challenging the traditionally biased processes for hiring and promoting artists both on and off stage. Chicago Artist Guide is dedicated to doing our part in creating equitable anti-racist representation in all areas of the performing arts. We at Chicago Artist Guide must be actively anti-racist. We absolutely and unapologetically denounce our racist systems and its proponents without exception.',
        <>
          <br />
          <br />
        </>,
        <>
          <u>Intersectionality</u>
          <br />
        </>,
        'We stand for and protect the values of inclusion, participation, and compassion for everyone--regardless of race, class, religion, country of origin, immigration status, (dis)ability,  age, gender identity, or sexual orientation. ​(via ',
        <a href="https://theghostlightproject.com/" target="_blank">
          The Ghostlight Project
        </a>,
        ')',
        <>
          <br />
          <br />
        </>,
        <>
          <u>Our Pledge</u>
          <br />
        </>,
        'We are committed to bettering ourselves, our services, and our industry through continued learning. We are thoughtfully researching and implementing this new platform for the artistic community, starting with an in-depth assessment of our services, policies and procedures. We are seeking out and listening to voices that have not been heard, and fully engaging under-represented populations in dialogue that will help us improve this technology.'
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
        "Theatre companies have access to see all profiles. Not all identity information is displayed on an individual's profile, however theatre companies can use certain filters to search for people who fit the demographic in which they are searching."
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
    },
    {
      id: 4,
      question: "What is CAG's Privacy Statement?",
      answer: [
        "The privacy of your data is of the utmost importance to us. We are committed to following, and (where we're able) exceeding industry standards and best practices with regard to safeguarding your information.",
        <ul>
          <li>
            We are committed to full transparency with regard to what data we
            collect from you, why we are collecting it, and, most importantly,
            what will and will not be displayed publicly for on your profile or
            elsewhere on our site.
          </li>
          <li>
            We will never share your information without your explicit,
            affirmative consent.
          </li>
          <li>We will never sell your data to a third party.</li>
        </ul>
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
          <Section>
            <h2>About Chicago Artist Guide</h2>
            {aboutQ.map(qa => (
              <div className="" key={qa.id}>
                <Question>{qa.question}</Question>
                <p>{qa.answer}</p>
              </div>
            ))}
          </Section>
          <Section>
            <h2>Our Platform</h2>
            {platformQ.map(qa => (
              <div className="" key={qa.id}>
                <Question>{qa.question}</Question>
                <p>{qa.answer}</p>
              </div>
            ))}
          </Section>
          <Section>
            <h2>Privacy</h2>
            {privacyQ.map(qa => (
              <div className="" key={qa.id}>
                <Question>{qa.question}</Question>
                <p>{qa.answer}</p>
              </div>
            ))}
          </Section>
          <Section>
            <h2>Identity</h2>
            {identityQ.map(qa => (
              <div className="" key={qa.id}>
                <Question>{qa.question}</Question>
                <p>{qa.answer}</p>
              </div>
            ))}
          </Section>
        </Col>
        <Col lg={4}>
          <SVGLayer blob={blueBlob} dancer={streamingDance} />
        </Col>
      </Row>
    </PageContainer>
  );
};

const Section = styled.div`
  margin-top: 4rem;
`;

const Question = styled.div`
  font-weight: 700;
  font-color: ${colors.dark};
  text-transform: uppercase;
`;

export default FAQ;
