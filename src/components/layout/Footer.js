import React from "react";
import NavLink from 'react-bootstrap/NavLink';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Container from 'react-bootstrap/Container';
import { SocialIcon } from 'react-social-icons';

function Footer() {
  return (
    <div className="fixed-bottom bg-primary">
    <Container>
    <div className="pt-4 pb-4">
      <Row>
        <Col sm={12} md={4}>
            <NavLink className="text-dark" to="/">Home</NavLink>
            <NavLink className="text-dark" to="/#what-we-do">What We Do</NavLink>
            <NavLink className="text-dark" to="/#who-we-are">Who We Are</NavLink>
            <NavLink className="text-dark" to="/#contact-us">Contact Us</NavLink>
        </Col>
        <Col sm={12} md={4}>
        < NavLink className="text-dark" to="/resources">Resources</NavLink>
        < NavLink className="text-dark" to="/blog">Blog</NavLink>
        </Col>
        <Col sm={12} md={4}>
          <SocialIcon url="https://www.linkedin.com/company/chicago-artist-guide/"/>{' '}
          <SocialIcon url="https://www.facebook.com/chiartistguide" />{' '}
          <SocialIcon url="mailto:chicagoartistguide@gmail.com"/>{' '}
        </Col>
      </Row>
      </div>
      <p>© 2020 Chicago Artist Guide. All Rights Reserved</p>
    </Container>
    </div>
  );
}

export default Footer;
