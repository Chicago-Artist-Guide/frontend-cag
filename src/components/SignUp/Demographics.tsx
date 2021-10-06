import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import styled from 'styled-components';
import Image from 'react-bootstrap/Image';
import InputField from '../../genericComponents/Input';
import Form from 'react-bootstrap/Form';
import { Title } from '../layout/Titles';
import { Tagline } from '../layout/Titles';
import { colors, fonts } from '../../theme/styleVars';
import yellow_blob from '../../images/yellow_blob_2.svg';

const unions = [
  'I.A.T.S.E.',
  'United Scenic Artists',
  "Actors' Equity Association",
  'Stage Directors and Choreographers Society',
  "Actors' Equity Association - EMC",
  'Non-Union',
];

const Demographics: React.FC<{
  setForm: any;
  formData: any;
}> = (props) => {
  const { formData, setForm } = props;
  const {
    demographicsUnionStatus, // checkboxes for Unions or non-union
    demographicsAgency,
    demographicsWebsites, // { url: string, type: string }
    demographicsBio,
  } = formData;

  const onWebsiteInputChange = (fieldValue: string, fieldName: string, i: any) => {
    // indexing to assign each website value a number

    const newWebsiteValues = [...demographicsWebsites];
    newWebsiteValues[i][fieldName] = fieldValue;

    const target = {
      name: 'demographicsWebsites',
      value: newWebsiteValues,
    };
    setForm({ target });
  };

  const removeWebsiteInput = (i: any) => {
    const newWebsiteValues = [...demographicsWebsites];
    newWebsiteValues.splice(i, 1);
    const target = {
      name: 'demographicsWebsites',
      value: newWebsiteValues,
    };
    setForm({ target });
  };

  const addWebsiteInput = () => {
    const newWebsiteInputs = [...demographicsWebsites];

    newWebsiteInputs.push({
      name: '',
      websiteType: '',
    });

    const target = {
      name: 'demographicsWebsites',
      value: newWebsiteInputs,
    };

    setForm({ target });
  };

  const numWebsites = demographicsWebsites.length;

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
                      {demographicsWebsites.map((websiteRow: number, i: any) => {
                        <div className="website-row" key={`website-row-${i}`}>
                          <InputField
                            label="URL"
                            name="websiteUrl"
                            onChange={(e: any) =>
                              onWebsiteInputChange(
                                'url',
                                e.target.value || '',
                                i
                              )
                            }
                            value={demographicsWebsites[i]['url']}
                          />
                          <InputField
                            label="Type"
                            name="websiteType"
                            onChange={(e: any) =>
                              onWebsiteInputChange(
                                'websiteType',
                                e.target.value || '',
                                i
                              )
                            }
                            value={demographicsWebsites[i]['websiteType']}
                          />
                          {numWebsites > 1 && (
                            <a href="#" onClick={removeWebsiteInput}>
                              X
                            </a>
                          )}
                        </div>;
                      })}
                      <a href="#" onClick={addWebsiteInput}>
                        Add Website
                      </a>
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
