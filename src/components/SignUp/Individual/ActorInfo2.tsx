import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { Checkbox, PrivateLabel } from '../../../components/shared';
import yellow_blob from '../../../images/yellow_blob_2.svg';
import { colors, fonts } from '../../../theme/styleVars';
import { Title } from '../../layout';
import {
  AgeRange,
  ageRanges,
  Gender,
  GenderRole,
  genderRoles,
  genders,
  IndividualData
} from './types';

const ActorInfo2: React.FC<{
  setForm: SetForm;
  formData: IndividualData;
  hasErrorCallback: (step: string, hasErrors: boolean) => void;
}> = (props) => {
  const { formData, setForm, hasErrorCallback } = props;
  const {
    actorInfo2AgeRanges,
    actorInfo2Gender,
    actorInfo2GenderRoles,
    actorInfo2GenderTransition,
    actorInfo2HeightNoAnswer
  } = formData;

  const requiredFields = ['actorInfo2AgeRanges', 'actorInfo2Gender'];

  const createDefaultFormErrorsData = () => {
    const formErrorsObj: { [key: string]: boolean } = {};

    requiredFields.forEach((fieldName: string) => {
      const fieldValue = formData[fieldName as keyof IndividualData];

      if (Array.isArray(fieldValue)) {
        formErrorsObj[fieldName] = !fieldValue.length;
      } else {
        formErrorsObj[fieldName] = fieldValue === '' || !fieldValue;
      }
    });

    return formErrorsObj;
  };

  // then use createDefaultFormErrorsData() to fill our initial formErrors state for this page
  const [formErrors, setFormErrors] = useState(createDefaultFormErrorsData());

  // calls the custom callback for the sign up page errors state object
  // we just make this so we don't need to repeat "actorInfo2" everywhere
  const customErrorCallback = (hasErrors: boolean) =>
    hasErrorCallback('actorInfo2', hasErrors);

  // effect for updating the sign up page errors state for this page
  // every time formErrors is updated
  useEffect(() => {
    customErrorCallback(!Object.values(formErrors).every((v) => !v));
  }, [formErrors]); // eslint-disable-line react-hooks/exhaustive-deps

  // re-check there's a value when required fields update
  useEffect(() => {
    setFormErrors(createDefaultFormErrorsData());
  }, [actorInfo2AgeRanges, actorInfo2Gender]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAgeRangeInAgeRanges = (ageRange: AgeRange) =>
    actorInfo2AgeRanges.indexOf(ageRange) > -1;
  const isGenderRoleInGenderRoles = (genderRole: GenderRole) =>
    actorInfo2GenderRoles.indexOf(genderRole) > -1;

  const ageRangeChange = (checkValue: boolean, range: AgeRange) => {
    let newRanges = [...actorInfo2AgeRanges];

    if (checkValue) {
      // check age range value
      if (newRanges.indexOf(range) < 0 && newRanges.length < 3) {
        newRanges.push(range);
      }
    } else {
      // uncheck age range value
      newRanges = newRanges.filter((aR) => aR !== range);
    }

    const target = {
      name: 'actorInfo2AgeRanges',
      value: newRanges
    };

    setForm({ target });
  };

  const genderRoleChange = (checkValue: boolean, role: GenderRole) => {
    let newRoles = [...actorInfo2GenderRoles];

    if (checkValue) {
      // check gender role value
      if (newRoles.indexOf(role) < 0) {
        newRoles.push(role);
      }
    } else {
      // uncheck gender role value
      newRoles = newRoles.filter((gR) => gR !== role);
    }

    const target = {
      name: 'actorInfo2GenderRoles',
      value: newRoles
    };

    setForm({ target });
  };

  return (
    <Container>
      <Row>
        <Col lg="8">
          <PaddingTitle>LET'S GET SOME DETAILS</PaddingTitle>
          <Row>
            <Col lg="12">
              <Form.Group className="form-group">
                <CAGLabel>Height</CAGLabel>
                <Container>
                  <Row>
                    <PaddedCol lg="3">
                      <Form.Control
                        aria-label="height feet"
                        as="select"
                        name="actorInfo2HeightFt"
                        onChange={setForm}
                      >
                        <option value={undefined}>Feet</option>
                        {[0, 1, 2, 3, 4, 5, 6, 7].map((ft) => (
                          <option key={`ft-option-value-${ft}`} value={ft}>
                            {ft} ft
                          </option>
                        ))}
                      </Form.Control>
                    </PaddedCol>
                    <PaddedCol lg="3">
                      <Form.Control
                        aria-label="height inches"
                        as="select"
                        name="actorInfo2HeightIn"
                        onChange={setForm}
                      >
                        <option value={undefined}>Inches</option>
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
                          (inches) => (
                            <option
                              key={`inch-option-value-${inches}`}
                              value={inches}
                            >
                              {inches} in
                            </option>
                          )
                        )}
                      </Form.Control>
                    </PaddedCol>
                    <PaddedCol lg="6">
                      <Checkbox
                        checked={actorInfo2HeightNoAnswer}
                        fieldType="checkbox"
                        label="I do not wish to answer"
                        name="actorInfo2HeightNoAnswer"
                        onChange={setForm}
                      />
                    </PaddedCol>
                  </Row>
                </Container>
              </Form.Group>
              <Form.Group className="form-group">
                <CAGLabel>
                  Which age ranges do you play? <PrivateLabel />
                </CAGLabel>
                <p>Select up to 3 ranges</p>
                {ageRanges.map((ageRange) => (
                  <Checkbox
                    checked={isAgeRangeInAgeRanges(ageRange)}
                    fieldType="checkbox"
                    key={`age-range-chk-${ageRange}`}
                    label={ageRange}
                    name="actorInfo2AgeRanges"
                    onChange={(e: any) =>
                      ageRangeChange(e.currentTarget.checked, ageRange)
                    }
                  />
                ))}
              </Form.Group>
              <Form.Group className="form-group">
                <CAGLabel>
                  Gender Identity <PrivateLabel />
                </CAGLabel>
                <p>
                  Select your gender identity. If you select Trans/Nonbinary,
                  you will be asked which types of roles you are interested in
                  for casting purposes.
                </p>
                <Form.Control
                  as="select"
                  defaultValue=""
                  name="actorInfo2Gender"
                  onChange={setForm}
                >
                  <option value={undefined}>Select</option>
                  {genders.map((g) => (
                    <option key={`gender-value-${g}`} value={g}>
                      {g}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          {actorInfo2Gender === 'Trans/Nonbinary' && (
            <Row>
              <Col lg="6">
                <Form.Group className="form-group">
                  <CAGLabelSmaller>
                    Interested in the following roles: <PrivateLabel />
                  </CAGLabelSmaller>
                  <p style={{ fontSize: '14px', marginBottom: '10px' }}>
                    Select all that apply
                  </p>
                  {genderRoles.map((g) => (
                    <Checkbox
                      checked={isGenderRoleInGenderRoles(g)}
                      fieldType="checkbox"
                      key={`gender-chk-${g}`}
                      label={g}
                      name="actorInfo2GenderRoles"
                      onChange={(e: any) =>
                        genderRoleChange(e.currentTarget.checked, g)
                      }
                    />
                  ))}
                </Form.Group>
              </Col>
              <Col lg="6">
                <Form.Group className="form-group">
                  <CAGLabelSmaller>
                    I would be comfortable playing a character through all
                    phases of their transition: <PrivateLabel />
                  </CAGLabelSmaller>
                  <Checkbox
                    checked={actorInfo2GenderTransition === 'Yes'}
                    fieldType="radio"
                    label="Yes"
                    name="actorInfo2GenderTransition"
                    onChange={setForm}
                    value="Yes"
                  />
                  <Checkbox
                    checked={actorInfo2GenderTransition === 'No'}
                    fieldType="radio"
                    label="No"
                    name="actorInfo2GenderTransition"
                    onChange={setForm}
                    value="No"
                  />
                </Form.Group>
              </Col>
            </Row>
          )}
        </Col>
        <ImageCol lg="4">
          <Image alt="" src={yellow_blob} />
        </ImageCol>
      </Row>
    </Container>
  );
};

const PaddingTitle = styled(Title)`
  padding: 20px 0px;
`;

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

const CAGLabelSmaller = styled(CAGLabel as any)`
  font-size: 16px;
`;

const PaddedCol = styled(Col)`
  padding-left: 0;
`;

export default ActorInfo2;
