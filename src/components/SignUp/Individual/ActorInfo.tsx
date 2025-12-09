import { Multiselect } from 'multiselect-react-dropdown';
import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { SetForm } from 'react-hooks-helper';
import styled from 'styled-components';
import Checkbox from '../../../components/shared/Checkbox';
import PrivateLabel from '../../../components/shared/PrivateLabel';
import yellow_blob from '../../../images/yellow_blob_2.svg';
import { colors, fonts } from '../../../theme/styleVars';
import { Title } from '../../layout/Titles';
import {
  AgeRange,
  ageRanges,
  flattenedEthnicityTypes,
  Gender,
  GenderRole,
  genderRoles,
  genders,
  IndividualData
} from './types';

const ActorInfo: React.FC<{
  setForm: SetForm;
  formData: IndividualData;
  hasErrorCallback: (step: string, hasErrors: boolean) => void;
}> = (props) => {
  const { formData, setForm, hasErrorCallback } = props;
  const {
    stageRole,
    actorInfo2AgeRanges,
    actorInfo1Ethnicities,
    actorInfo2Gender,
    actorInfo2GenderRoles,
    actorInfo2GenderTransition,
    actorInfo1LGBTQ
  } = formData;

  console.log('actorInfo1Ethnicities', actorInfo1Ethnicities);

  const optLabel = '(Optional)';
  const isOffStage = stageRole === 'off-stage';
  const requiredFields: string[] = [];

  // most fields are optional for off-stage
  if (!isOffStage) {
    requiredFields.push(
      'actorInfo2AgeRanges',
      'actorInfo1Ethnicities',
      'actorInfo2Gender',
      'actorInfo1LGBTQ'
    );
  }

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
  // we just make this so we don't need to repeat "actorInfo" everywhere
  const customErrorCallback = (hasErrors: boolean) =>
    hasErrorCallback('actorInfo', hasErrors);

  // effect for updating the sign up page errors state for this page
  // every time formErrors is updated
  useEffect(() => {
    customErrorCallback(!Object.values(formErrors).every((v) => !v));
  }, [formErrors]);

  // re-check there's a value when required fields update
  useEffect(() => {
    setFormErrors(createDefaultFormErrorsData());
  }, [
    actorInfo2AgeRanges,
    actorInfo1Ethnicities,
    actorInfo2Gender,
    actorInfo1LGBTQ
  ]);

  const isGenderRoleInGenderRoles = (genderRole: GenderRole) =>
    actorInfo2GenderRoles.indexOf(genderRole) > -1;

  const onRangeChangeMulti = (
    selectedList: AgeRange[],
    _selectedItem: AgeRange
  ) => {
    const target = {
      name: 'actorInfo2AgeRanges',
      value: selectedList.length ? selectedList : []
    };

    setForm({ target });
  };

  const onEthnicityChangeMulti = (
    selectedList: AgeRange[],
    _selectedItem: AgeRange
  ) => {
    const target = {
      name: 'actorInfo1Ethnicities',
      value: selectedList.length ? selectedList : []
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
              {!isOffStage && (
                <Form.Group className="form-group">
                  <CAGLabel>
                    Which age ranges do you play? <PrivateLabel />
                  </CAGLabel>
                  <p>Select up to 3 ranges</p>
                  <Multiselect
                    options={ageRanges}
                    showCheckbox={true}
                    isObject={false}
                    selectedValues={actorInfo2AgeRanges}
                    onSelect={onRangeChangeMulti}
                    onRemove={onRangeChangeMulti}
                    selectionLimit={3}
                    placeholder="Select Age Ranges"
                  />
                </Form.Group>
              )}
              <Form.Group className="form-group">
                <CAGLabel>Ethnicity {isOffStage && optLabel}</CAGLabel>
                <Multiselect
                  options={flattenedEthnicityTypes}
                  isObject={false}
                  showCheckbox={true}
                  selectedValues={actorInfo1Ethnicities}
                  placeholder="Select Ethnicities"
                  onSelect={onEthnicityChangeMulti}
                  onRemove={onEthnicityChangeMulti}
                />
              </Form.Group>
              <Form.Group className="form-group">
                <CAGLabel>
                  Gender Identity {isOffStage && optLabel} <PrivateLabel />
                </CAGLabel>
                {!isOffStage && (
                  <p>
                    First, choose your gender identity - additional options may
                    be presented for casting purposes. If other, please select
                    the option with which you most closely identify for casting
                    purposes.
                  </p>
                )}
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
          {actorInfo2Gender !== ('' as Gender) &&
            !actorInfo2Gender.includes('Cis') &&
            !isOffStage && (
              <Row>
                <Col lg="6">
                  <Form.Group className="form-group">
                    <CAGLabelSmaller>
                      I would also be comfortable playing roles usually played
                      by: <PrivateLabel />
                    </CAGLabelSmaller>
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
          <Row>
            <Col lg="12">
              <Form.Group className="form-group">
                <CAGLabel>
                  Do you identify as part of the LGBTQIA+ community?{' '}
                  {isOffStage && optLabel}
                  <PrivateLabel />
                </CAGLabel>
                <Checkbox
                  checked={actorInfo1LGBTQ === 'Yes'}
                  fieldType="radio"
                  label="Yes"
                  name="actorInfo1LGBTQ"
                  onChange={setForm}
                  value="Yes"
                />
                <Checkbox
                  checked={actorInfo1LGBTQ === 'No'}
                  fieldType="radio"
                  label="No"
                  name="actorInfo1LGBTQ"
                  onChange={setForm}
                  value="No"
                />
              </Form.Group>
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

export default ActorInfo;
