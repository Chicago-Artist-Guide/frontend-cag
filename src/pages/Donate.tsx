import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import { Tagline, Title, TitleThree } from '../components/layout/Titles';
import SVGLayer from '../components/SVGLayer';
import yellowBlob1 from '../images/yellow_blob_1.svg';
import homeDance from '../images/home_dance.svg';

const Donate = () => (
  <PageContainer>
    <Row>
      <Col lg={8}>
        <Title>DONATE</Title>
        <Tagline>Support Us</Tagline>
        <p className="margin-container">
          Chicago Artist Guide is building an online platform that will connect
          theatres with artists and help them diversify their casting and
          hiring. Thank you for supporting our efforts to foster and support a
          more diversified Chicago theater community!
        </p>
      </Col>
      <Col lg={4}>
        <SVGLayer blob={yellowBlob1} dancer={homeDance} />
      </Col>
    </Row>
    <Row>
      <Col lg="12">
        <TitleThree>Two Ways to Give</TitleThree>
        <Row>
          <Col lg="8">
            <p>
              <strong>1. Online:</strong>
            </p>
            <iframe
              frameBorder="0"
              height="650px"
              name="givebutter"
              scrolling="no"
              seamless
              src="https://givebutter.com/embed/c/caglaunch"
              title="Donate to Chicago Artist Guide online via GiveButter"
              width="100%"
            />
          </Col>
          <Col lg="4">
            <p>
              <strong>2. OR by mail:</strong>
            </p>
            <p>
              <em>Mail a check to:</em>
            </p>
            <p>
              Chicago Artist Guide
              <br />
              c/o Anna Schutz
              <br />
              4814 N Damen Ave 212
              <br />
              Chicago, IL 60625
            </p>
          </Col>
        </Row>
      </Col>
    </Row>
    <Row>
      <Col lg="12">
        <p>
          <em>
            Chicago Artist Guide NFP is a 501(c)(3) and donations are tax
            deductible to the fullest extent of the law.
          </em>
        </p>
      </Col>
    </Row>
  </PageContainer>
);

export default Donate;
