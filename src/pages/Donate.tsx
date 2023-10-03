import React, { useEffect } from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import { Tagline, Title, TitleThree } from '../components/layout/Titles';
import SVGLayer from '../components/SVGLayer';
import yellowBlob1 from '../images/yellow_blob_1.svg';
import homeDance from '../images/home_dance.svg';
import styled from 'styled-components';
import { breakpoints } from '../theme/styleVars';

const Donate = () => {
  return (
    <PageContainer>
      <Row>
        <Col lg={8}>
          <Title>DONATE</Title>
          <Tagline>Support Us</Tagline>
          <p className="margin-container">
            Chicago Artist Guide is building an online platform that will
            connect theatres with artists and help them diversify their casting
            and hiring. Thank you for supporting our efforts to foster and
            support a more diversified Chicago theater community!
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
              <IFrame
                allowTransparency
                allow="payment"
                frameBorder="0"
                scrolling="no"
                title="Donate to Chicago Artist Guide online"
                style={{ width: '100%', border: 'none' }}
                src="https://secure.lglforms.com/form_engine/s/wIPQhEmPD0vhxafb-oKAQQ"
              >
                <a href="https://secure.lglforms.com/form_engine/s/wIPQhEmPD0vhxafb-oKAQQ">
                  Fill out my LGL Form!
                </a>
              </IFrame>
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
};

const IFrame = styled.iframe`
  height: 1200px;

  @media screen and (max-width: ${breakpoints.sm}) {
    height: 1360px;
  }
`;

export default Donate;
