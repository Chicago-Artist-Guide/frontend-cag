import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import styled from 'styled-components';
import Image from 'react-bootstrap/Image';
import InputField from '../../genericComponents/Input';
import Form from 'react-bootstrap/Form';
import { Title } from '../layout/Titles';
import { Tagline, TitleThree } from '../layout/Titles';
import yellow_blob from '../../images/yellow_blob_2.svg';

/*const unions = [
  'I.A.T.S.E.',
  'United Scenic Artists',
  "Actors' Equity Association",
  'Stage Directors and Choreographers Society',
  "Actors' Equity Association - EMC",
  'Non-Union'
];*/

const websiteTypeOptions = [
  'Personal/Portfolio',
  'Blog',
  'Media',
  'Social - Linktree',
  'Social - Instagram',
  'Social - Twitter',
  'Social - YouTube',
  'Social - LinkedIn',
  'Social - Facebook',
  'Social - TikTok',
  'Social - Other'
];

const Demographics: React.FC<{
  setForm: any;
  formData: any;
}> = props => {
  const { formData, setForm } = props;
  const {
    demographicsUnionStatus, // checkboxes for Unions or non-union
    demographicsAgency,
    demographicsWebsites // { url: string, websiteType: string }
    // demographicsBio
  } = formData;

  const onWebsiteInputChange = (
    fieldValue: string,
    fieldName: string,
    i: any
  ) => {
    // indexing to assign each website value a number
    const newWebsiteValues = [...demographicsWebsites];
    newWebsiteValues[i][fieldName] = fieldValue;

    const target = {
      name: 'demographicsWebsites',
      value: newWebsiteValues
    };
    setForm({ target });
  };

  const removeWebsiteInput = (i: any) => {
    const newWebsiteValues = [...demographicsWebsites];
    newWebsiteValues.splice(i, 1);
    const target = {
      name: 'demographicsWebsites',
      value: newWebsiteValues
    };
    setForm({ target });
  };

  const addWebsiteInput = (e: any) => {
    e.preventDefault();
    const newWebsiteInputs = [...demographicsWebsites];

    newWebsiteInputs.push({
      url: '',
      websiteType: ''
    });

    const target = {
      name: 'demographicsWebsites',
      value: newWebsiteInputs
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
              <TitleThree>Union</TitleThree>
              <Container>
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
                      <option value="Union">Union</option>
                      <option value="Non-Union">Non-Union</option>
                      <option value="Other">Other</option>
                    </Form.Control>
                  </Col>
                  <Col lg="5">
                    <Form.Control
                      aria-label="union"
                      defaultValue=""
                      disabled={demographicsUnionStatus !== 'Other'}
                      name="demographicsUnionStatusOther"
                      onChange={setForm}
                      placeholder="Other"
                    ></Form.Control>
                  </Col>
                </Row>
              </Container>
              <Container>
                <Row>
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
                </Row>
              </Container>
              <TitleThree>Website Links</TitleThree>
              <Container>
                <Row>
                  <Col lg="10">
                    {demographicsWebsites.map((websiteRow: number, i: any) => (
                      <div key={`website-row-${i}`}>
                        <Col lg="12">
                          <InputField
                            label="URL"
                            name="websiteUrl"
                            onChange={(e: any) =>
                              onWebsiteInputChange(
                                e.target.value || '',
                                'url',
                                i
                              )
                            }
                            value={demographicsWebsites[i]['url']}
                          />
                          <Form.Control
                            aria-label="website type"
                            as="select"
                            defaultValue={
                              demographicsWebsites[i]['websiteType']
                            }
                            name="websiteType"
                            onChange={(e: any) =>
                              onWebsiteInputChange(
                                e.target.value || '',
                                'websiteType',
                                i
                              )
                            }
                          >
                            <option value={undefined}>Select</option>
                            {websiteTypeOptions.map(wT => (
                              <option value={wT}>{wT}</option>
                            ))}
                          </Form.Control>
                          <InputField
                            label="Type"
                            name="websiteType"
                            onChange={(e: any) =>
                              onWebsiteInputChange(
                                e.target.value || '',
                                'websiteType',
                                i
                              )
                            }
                            value={demographicsWebsites[i]['websiteType']}
                          />
                          {numWebsites > 1 && (
                            <a href="#" onClick={() => removeWebsiteInput(i)}>
                              X
                            </a>
                          )}
                        </Col>
                      </div>
                    ))}
                    <div>
                      <a href="#" onClick={addWebsiteInput}>
                        + Add Website
                      </a>
                    </div>
                  </Col>
                </Row>
              </Container>
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

export default Demographics;
