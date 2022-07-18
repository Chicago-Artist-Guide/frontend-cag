import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import Form from 'react-bootstrap/Form';
import yellow_blob from '../../../images/yellow_blob_2.svg';
import { Checkbox, PrivateLabel } from '../../../genericComponents';
import { colors, fonts } from '../../../theme/styleVars';
import { Title } from '../../layout';

const ageRanges = [
  '18-22',
  '23-27',
  '28-32',
  '33-37',
  '38-42',
  '43-47',
  '48-52',
  '53-57',
  '58-62',
  '62+'
];

const genders = [
  'Cis Female',
  'Cis Male',
  'Trans Female',
  'Trans Male',
  'Non Binary/Agender',
  'I choose not to respond'
];

const genderRoles = ['Women', 'Men', 'Neither'];

const ActorInfo2: React.FC<{
  setForm: any;
  formData: any;
  hasErrorCallback: (step: string, hasErrors: boolean) => void;
}> = props => {
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
      if (Array.isArray(formData[fieldName])) {
        formErrorsObj[fieldName] = !formData[fieldName].length;
      } else {
        formErrorsObj[fieldName] =
          formData[fieldName] === '' || formData[fieldName] === false;
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
    customErrorCallback(!Object.values(formErrors).every(v => !v));
  }, [formErrors]); // eslint-disable-line react-hooks/exhaustive-deps

  // re-check there's a value when required fields update
  useEffect(() => {
    setFormErrors(createDefaultFormErrorsData());
  }, [actorInfo2AgeRanges, actorInfo2Gender]); // eslint-disable-line react-hooks/exhaustive-deps

  const isAgeRangeInAgeRanges = (ageRange: string) =>
    actorInfo2AgeRanges.indexOf(ageRange) > -1;
  const isGenderRoleInGenderRoles = (genderRole: string) =>
    actorInfo2GenderRoles.indexOf(genderRole) > -1;

  const ageRangeChange = (checkValue: any, range: string) => {
    let newRanges = [...actorInfo2AgeRanges];

    if (checkValue) {
      // check age range value
      if (newRanges.indexOf(range) < 0) {
        newRanges.push(range);
      }
    } else {
      // uncheck age range value
      newRanges = newRanges.filter(aR => aR !== range);
    }

    const target = {
      name: 'actorInfo2AgeRanges',
      value: newRanges
    };

    setForm({ target });
  };

  const genderRoleChange = (checkValue: any, role: string) => {
    let newRoles = [...actorInfo2GenderRoles];

    if (checkValue) {
      // check gender role value
      if (newRoles.indexOf(role) < 0) {
        newRoles.push(role);
      }
    } else {
      // uncheck gender role value
      newRoles = newRoles.filter(gR => gR !== role);
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
              <Form.Group>
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
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(ft => (
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
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(inches => (
                          <option
                            key={`inch-option-value-${inches}`}
                            value={inches}
                          >
                            {inches} in
                          </option>
                        ))}
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
              <Form.Group>
                <CAGLabel>
                  What age range do you play? <PrivateLabel />
                </CAGLabel>
                <p>Select up to 3 ranges</p>
                {ageRanges.map(ageRange => (
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
              <Form.Group>
                <CAGLabel>
                  Gender Identity <PrivateLabel />
                </CAGLabel>
                <p>
                  First, choose your gender identity - additional options may be
                  presented for casting purposes. If other, please select the
                  option with which you most closely identify for casting
                  purposes.
                </p>
                <Form.Control
                  as="select"
                  defaultValue=""
                  name="actorInfo2Gender"
                  onChange={setForm}
                >
                  <option value={undefined}>Select</option>
                  {genders.map(g => (
                    <option key={`gender-value-${g}`} value={g}>
                      {g}
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            </Col>
          </Row>
          {actorInfo2Gender !== '' && !actorInfo2Gender.includes('Cis') && (
            <Row>
              <Col lg="6">
                <Form.Group>
                  <CAGLabelSmaller>
                    I would also be comfortable playing roles usually played by:{' '}
                    <PrivateLabel />
                  </CAGLabelSmaller>
                  {genderRoles.map(g => (
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
                <Form.Group>
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
