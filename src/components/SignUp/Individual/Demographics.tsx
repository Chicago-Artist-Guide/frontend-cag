import React, { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import styled from 'styled-components';
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import { SetForm } from 'react-hooks-helper';
import { Title } from '../../layout/Titles';
import { Tagline, TitleThree } from '../../layout/Titles';
import yellow_blob from '../../../images/yellow_blob_2.svg';
import { colors, fonts } from '../../../theme/styleVars';
import {
  websiteTypeOptions,
  IndividualData,
  IndividualWebsite,
  WebsiteTypes
} from './types';

const Demographics: React.FC<{
  setForm: SetForm;
  formData: IndividualData;
}> = (props) => {
  const { formData, setForm } = props;
  const {
    demographicsUnionStatus, // checkboxes for Unions or non-union
    demographicsAgency,
    demographicsWebsites, // { url: string, websiteType: string }
    demographicsBioHeadline,
    demographicsBio
  } = formData;
  const [websiteId, setWebsiteId] = useState(1);

  const onWebsiteInputChange = <T extends keyof IndividualWebsite>(
    fieldValue: IndividualWebsite[T],
    fieldName: T,
    id: number
  ) => {
    const newWebsiteValues = [...demographicsWebsites];
    const findIndex = newWebsiteValues.findIndex((web) => web.id === id);
    newWebsiteValues[findIndex][fieldName] = fieldValue;

    const target = {
      name: 'demographicsWebsites',
      value: newWebsiteValues
    };

    setForm({ target });
  };

  const removeWebsiteInput = (e: any, id: any) => {
    e.preventDefault();

    const newWebsiteValues = [...demographicsWebsites];
    const findIndex = newWebsiteValues.findIndex((web) => web.id === id);
    newWebsiteValues.splice(findIndex, 1);

    const target = {
      name: 'demographicsWebsites',
      value: newWebsiteValues
    };

    setForm({ target });
  };

  const addWebsiteInput = (e: any) => {
    e.preventDefault();
    const newWebsiteId = websiteId + 1;
    const newWebsiteInputs = [...demographicsWebsites];

    newWebsiteInputs.push({
      id: newWebsiteId,
      url: '',
      websiteType: '' as WebsiteTypes
    });

    const target = {
      name: 'demographicsWebsites',
      value: newWebsiteInputs
    };

    setWebsiteId(newWebsiteId);
    setForm({ target });
  };

  const numWebsites = demographicsWebsites?.length;

  return (
    <Container>
      <Row>
        <Col lg="8">
          <Title>ALMOST DONE!</Title>
          <Tagline>Just a few more questions.</Tagline>
          <Row>
            <Col lg="12">
              <TitleThree>Union</TitleThree>
              <Container>
                <Row>
                  <PaddedCol lg="5">
                    <CAGFormControl
                      aria-label="union"
                      as="select"
                      defaultValue={demographicsUnionStatus}
                      name="demographicsUnionStatus"
                      onChange={setForm}
                    >
                      <option value={undefined}>Select union status</option>
                      <option value="Union">Union</option>
                      <option value="Non-Union">Non-Union</option>
                      <option value="Other">Other</option>
                    </CAGFormControl>
                  </PaddedCol>
                  <PaddedCol lg="5">
                    <CAGFormControl
                      aria-label="union"
                      defaultValue=""
                      disabled={demographicsUnionStatus !== 'Other'}
                      name="demographicsUnionStatusOther"
                      onChange={setForm}
                      placeholder="Other"
                    ></CAGFormControl>
                  </PaddedCol>
                </Row>
              </Container>
              <TitleThree>Agency</TitleThree>
              <Container>
                <Row>
                  <PaddedCol lg="10">
                    <Form.Group className="form-group">
                      <CAGFormControl
                        aria-label="agency"
                        defaultValue={demographicsAgency}
                        name="demographicsAgency"
                        onChange={setForm}
                        placeholder="Agency"
                      ></CAGFormControl>
                    </Form.Group>
                  </PaddedCol>
                </Row>
              </Container>
              <TitleThree>Website Links</TitleThree>
              <Container>
                <Row>
                  <PaddedCol lg="10">
                    {demographicsWebsites?.map((websiteRow: any, i: any) => (
                      <WebsiteRow key={`website-row-${websiteRow.id}`}>
                        <CAGFormControl
                          aria-label="URL"
                          as="input"
                          name="websiteUrl"
                          onChange={(e: any) =>
                            onWebsiteInputChange(
                              e.target.value || '',
                              'url',
                              websiteRow.id
                            )
                          }
                          placeholder="URL"
                          value={websiteRow.url}
                        />
                        <CAGFormControl
                          aria-label="website type"
                          as="select"
                          defaultValue={websiteRow.websiteType}
                          name="websiteType"
                          onChange={(e: any) =>
                            onWebsiteInputChange(
                              e.target.value || '',
                              'websiteType',
                              websiteRow.id
                            )
                          }
                        >
                          <option value={undefined}>Select Type</option>
                          {websiteTypeOptions.map((wT) => (
                            <option value={wT} key={wT}>
                              {wT}
                            </option>
                          ))}
                        </CAGFormControl>
                        {numWebsites > 1 && (
                          <a
                            href="#"
                            onClick={(e: any) =>
                              removeWebsiteInput(e, websiteRow.id)
                            }
                          >
                            X
                          </a>
                        )}
                      </WebsiteRow>
                    ))}
                    <div>
                      <a href="#" onClick={addWebsiteInput}>
                        + Add Website
                      </a>
                    </div>
                  </PaddedCol>
                </Row>
              </Container>
              <TitleThree>Profile Headline &amp; Personal Bio</TitleThree>
              <Container>
                <Row>
                  <PaddedCol lg="10">
                    <Form.Group className="form-group">
                      <CAGFormControl
                        aria-label="bio headline"
                        defaultValue={demographicsBioHeadline}
                        name="demographicsBioHeadline"
                        onChange={setForm}
                        placeholder="Profile Headline (ex: Actor, Musician, Dancer)"
                      />
                    </Form.Group>
                    <Form.Group className="form-group">
                      <Form.Control
                        as="textarea"
                        defaultValue={demographicsBio}
                        name="demographicsBio"
                        onChange={setForm}
                        rows={5}
                      />
                    </Form.Group>
                  </PaddedCol>
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

const CAGFormControl = styled(Form.Control)`
  margin-bottom: 1em;
  border: 1px solid ${colors.lightGrey};
  border-radius: 7px;
  font-family: ${fonts.mainFont};
  padding: 5px;
  padding-left: 10px;
  width: 100%;
`;

const PaddedCol = styled(Col)`
  padding-left: 0;
`;

const WebsiteRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;

  input,
  select {
    margin-right: 1rem;
    margin-bottom: 0;
  }
`;

export default Demographics;
