import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import styled from 'styled-components';
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import { Title } from '../layout/Titles';
import { Tagline } from '../layout/Titles';
import { colors, fonts } from '../../theme/styleVars';
import yellow_blob from '../../images/yellow_blob_2.svg';

const unions = [];

const Demographics: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { formData, setForm } = props;
  const {
    demographicsUnionStatus, // checkboxes for Unions or non-union
    demographicsAgency,
    demographicsWebsites, // { url: string, type: string }
    demographicsBio
  } = formData;

  const isUnionsInUnions = (unionType: string) =>
    demographicsUnionStatus.indexOf(unionType) > -1;

  const demographicWebsiteChange = (url: any, type: string) => {
    let newWebsites = [...demographicsWebsites];

    if (url) {
      // check ethnicity type value
      if (newWebsites.indexOf(type) < 0) {
        newWebsites.push(type);
      }
    } else {
      // uncheck age range value
      newWebsites = newWebsites.filter(aR => aR !== type);
    }

    const target = {
      name: 'demographicsWebsites',
      value: newWebsites
    };

    setForm({ target });
  };

  return (
    <Container>
      <Row>
        <Col lg="8">
          <Title>ALMOST DONE!</Title>
          <Tagline>Just a few more questions.</Tagline>
          <Row>
            <Col lg="10">
              <Form.Group>
                <Container>
                  <CAGLabel>Union</CAGLabel>
                  <Row>
                    <Col lg="5">
                      <Form.Control
                        aria-label="union"
                        as="select"
                        defaultValue={demographicsUnionStatus}
                        name="demographicsUnionStatus"
                        onChange={setForm}
                      >
                        <option value={undefined}>Select</option>
                        <option value={undefined}>Union</option>
                        <option value={undefined}>Non-Union</option>
                        <option value={undefined}>Other</option>
                      </Form.Control>
                    </Col>
                    <Col lg="5">
                      <Form.Control
                        aria-label="union"
                        defaultValue=""
                        disabled={
                          demographicsUnionStatus === 'Other' ? false : true
                        }
                        name="demographicsUnionStatus"
                        onChange={setForm}
                        placeholder="Other"
                      ></Form.Control>
                    </Col>
                  </Row>
                </Container>
              </Form.Group>
              <Col lg="8">
                <Form.Group>
                  <Form.Control
                    aria-label="agency"
                    defaultValue={demographicsAgency}
                    name="demographicsAgency"
                    onChange={setForm}
                    placeholder="Agency"
                  ></Form.Control>
                </Form.Group>
              </Col>
              <Col lg="10">
                <Form.Group>
                  <Container>
                    <CAGLabel>Website Links</CAGLabel>
                    <Row>
                      <Col lg="6">
                        <Form.Control
                          aria-label="website-link"
                          defaultValue={demographicsWebsites}
                          name="demographicsWebsites"
                          onChange={setForm}
                        ></Form.Control>
                      </Col>
                      <Col lg="4">
                        <CAGLabel>Website</CAGLabel>
                        <Form.Control
                          aria-label="website"
                          as="select"
                          defaultValue=""
                          name="demographicsWebsites"
                          onChange={setForm}
                        ></Form.Control>
                      </Col>
                      <Col lg="4">
                        <PrivacyPar>Remove this link</PrivacyPar>
                      </Col>
                    </Row>
                  </Container>
                </Form.Group>
              </Col>
            </Col>
          </Row>
        </Col>
        <ImageCol lg="4">
          <Image alt="" src={yellow_blob} />
        </ImageCol>
      </Row>
    </Container>
  );
};

const ImageCol = styled(Col)`
  display: flex;
  max-height: 100%;
  max-width: 100%;
`;

const CAGLabel = styled(Form.Label)`
  color: ${colors.mainFont};
  font-family: ${fonts.mainFont};
  font-size: 20px;
`;

const PrivacyPar = styled.p`
  color: ${colors.mainFont};
  font-family: ${fonts.lora};
  font-size: 18px;
  letter-spacing: 0px;
  margin-top: 17px;
`;

export default Demographics;
