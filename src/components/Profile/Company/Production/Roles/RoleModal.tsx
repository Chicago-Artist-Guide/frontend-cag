import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { FormTarget } from 'react-hooks-helper';
import styled from 'styled-components';
import { Button, Checkbox, Dropdown } from '../../../../../components/shared';
import { breakpoints, colors, fonts } from '../../../../../theme/styleVars';
import { getOptions } from '../../../../../utils/helpers';
import {
  additionalRequirements,
  ageRanges,
  roleGenders,
  productionEquities,
  roleStatuses
} from '../../../../../utils/lookups';
import { ethnicityTypes } from '../../../../SignUp/Individual/types';
import ConfirmDialog from '../../../../ConfirmDialog';
import { CAGLabel } from '../../../../SignUp/SignUpStyles';
import {
  FormInput,
  FormSelect,
  FormTextArea,
  OptGroupSelectValue
} from '../../../Form/Inputs';
import { offstageRolesOptions } from '../../../shared/offstageRolesOptions';
import { OffStageRoleCategory, StageRole } from '../../../shared/profile.types';
import { Role } from '../../types';

const statuses = getOptions(roleStatuses);
const equities = getOptions(productionEquities);

const RoleModal: React.FC<{
  show: boolean;
  type: StageRole;
  role?: Role;
  onDelete: (x: Role) => void;
  onSubmit: (x: Role) => void;
  onClose: () => void;
}> = ({ show = false, type, role = {}, onSubmit, onClose, onDelete }) => {
  if (!show) return null;
  const [showConfirm, setShowConfirm] = useState(false);
  const [formValues, setFormValues] = useState<Role>({});

  useEffect(() => {
    if (role.role_id) {
      setFormValues(role);
    } else {
      setFormValues({
        type: type,
        role_status: 'Open',
        gender_identity: ['Open to all genders'],
        age_range: ['Open to all ages'],
        ethnicity: ['Open to all ethnicities']
      });
    }
    console.log(formValues);
  }, []);

  const setFormState = (
    event:
      | React.SyntheticEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLInputElement>
      | FormTarget
  ) => {
    const eventTarget = event.target as any;
    setFormValues((prev) => ({
      ...prev,
      [eventTarget?.name]: eventTarget?.value
    }));
  };

  const onSave = async (role: Role) => {
    onSubmit(role);
    setFormValues({});
  };

  const isOnStage = type === 'On-Stage';
  const title = isOnStage ? 'On-Stage Role' : 'Off-Stage Role';

  const isValueIncluded = (field: keyof Role, value: string) => {
    const fieldValue = formValues[field] as string[];
    if (!fieldValue) return false;
    return fieldValue.includes(value);
  };

  const handleOpenToAllChange = (
    field: 'gender_identity' | 'ethnicity' | 'age_range',
    checked: boolean
  ) => {
    if (checked) {
      const openToAllValue =
        field === 'gender_identity'
          ? 'Open to all genders'
          : field === 'ethnicity'
            ? 'Open to all ethnicities'
            : 'Open to all ages';
      setFormValues({ ...formValues, [field]: [openToAllValue] });
    }
  };

  const handleSpecificOptionChange = (
    field: 'gender_identity' | 'ethnicity' | 'age_range',
    value: string,
    checked: boolean
  ) => {
    const currentValues = (formValues[field] as string[]) || [];
    const openToAllValue =
      field === 'gender_identity'
        ? 'Open to all genders'
        : field === 'ethnicity'
          ? 'Open to all ethnicities'
          : 'Open to all ages';

    if (checked) {
      // Remove "Open to all" if present, add specific value
      const filtered = currentValues.filter((v) => v !== openToAllValue);
      setFormValues({ ...formValues, [field]: [...filtered, value] });
    } else {
      // Remove the unchecked value
      const filtered = currentValues.filter((v) => v !== value);
      setFormValues({ ...formValues, [field]: filtered });
    }
  };

  const isOpenToAllSelected = (
    field: 'gender_identity' | 'ethnicity' | 'age_range'
  ) => {
    const fieldValue = formValues[field] as string[];
    if (!fieldValue || fieldValue.length === 0) return false;
    const openToAllValue =
      field === 'gender_identity'
        ? 'Open to all genders'
        : field === 'ethnicity'
          ? 'Open to all ethnicities'
          : 'Open to all ages';
    return fieldValue.includes(openToAllValue);
  };

  const hasSpecificSelections = (
    field: 'gender_identity' | 'ethnicity' | 'age_range'
  ) => {
    const fieldValue = formValues[field] as string[];
    if (!fieldValue || fieldValue.length === 0) return false;
    const openToAllValue =
      field === 'gender_identity'
        ? 'Open to all genders'
        : field === 'ethnicity'
          ? 'Open to all ethnicities'
          : 'Open to all ages';
    return fieldValue.some((v) => v !== openToAllValue);
  };

  const onDeleteConfirm = () => {
    onDelete(formValues);
  };

  const onDeleteCancel = () => {
    setShowConfirm(false);
  };

  const transformedOffstageRoleOptions: OptGroupSelectValue = Object.keys(
    offstageRolesOptions
  ).reduce((acc, cat) => {
    acc[cat] = {
      category: offstageRolesOptions[cat as OffStageRoleCategory].category,
      name: offstageRolesOptions[cat as OffStageRoleCategory].name,
      options: offstageRolesOptions[cat as OffStageRoleCategory].options.map(
        (opt) => ({
          name: opt.label,
          value: opt.value
        })
      )
    };

    return acc;
  }, {} as OptGroupSelectValue);

  return (
    <>
      <ConfirmDialog
        title="Delete role"
        content="Are you sure you wish to delete this role from the production?"
        onCancel={onDeleteCancel}
        onConfirm={onDeleteConfirm}
        show={showConfirm}
      />
      <Modal show={!showConfirm} dialogClassName="modal-w">
        <Modal.Body>
          <Form className="px-5 py-4">
            <Row>
              <Col>
                <Title>{title}</Title>
              </Col>
              <div className="d-flex flex-shrink-1 flex-row flex-row-reverse">
                <CloseButton
                  className="d-flex align-items-center"
                  onClick={onClose}
                >
                  <Icon icon={faClose} />
                </CloseButton>
              </div>
            </Row>
            <Row className="mt-5">
              <Col lg={7}>
                {!isOnStage ? (
                  <FormSelect
                    name="role_name"
                    label="Position"
                    defaultValue={formValues.role_name}
                    onChange={setFormState}
                    hasOptGroups={true}
                    options={transformedOffstageRoleOptions}
                  />
                ) : (
                  <FormInput
                    name="role_name"
                    label="Role Name"
                    onChange={setFormState}
                    defaultValue={formValues?.role_name}
                    style={{ marginTop: 0 }}
                  />
                )}
                <FormTextArea
                  name="description"
                  label={
                    isOnStage ? 'Character Description' : 'Role Description'
                  }
                  onChange={setFormState}
                  defaultValue={formValues?.description}
                  rows={4}
                />
                <Form.Group className="form-group" style={{ marginTop: 30 }}>
                  <CAGLabel>Pay</CAGLabel>
                  <RoleRate>
                    <FormInput
                      name="role_rate"
                      label="Rate"
                      onChange={setFormState}
                      defaultValue={formValues?.role_rate}
                      type="number"
                    />
                    <Dropdown
                      name="role_rate_unit"
                      label="Unit"
                      options={[
                        {
                          name: 'Total',
                          value: 'Total'
                        },
                        {
                          name: 'Per Week',
                          value: 'Per Week'
                        },
                        {
                          name: 'Per Hour',
                          value: 'Per Hour'
                        },
                        {
                          name: 'Per Show',
                          value: 'Per Show'
                        }
                      ]}
                      value={formValues?.role_rate_unit}
                      onChange={setFormState}
                    />
                  </RoleRate>
                </Form.Group>
                <Dropdown
                  name="role_status"
                  label="Role Status"
                  options={statuses}
                  value={formValues.role_status}
                  onChange={setFormState}
                  style={{ marginTop: 0 }}
                />
                {!isOnStage ? (
                  <Dropdown
                    name="union"
                    label="Union"
                    options={equities}
                    value={formValues.union}
                    onChange={setFormState}
                    style={{ marginTop: 20 }}
                  />
                ) : (
                  <>
                    <Form.Group
                      className="form-group"
                      style={{ marginTop: 30 }}
                    >
                      <CAGLabel>Additional Requirements</CAGLabel>
                      {additionalRequirements.map((requirement) => (
                        <Checkbox
                          checked={isValueIncluded(
                            'additional_requirements',
                            requirement
                          )}
                          fieldType="checkbox"
                          key={`additional_requirements_${requirement}`}
                          label={requirement}
                          name={requirement}
                          onChange={(e: any) => {
                            let additionalRequirements =
                              formValues.additional_requirements || [];
                            const selected = e.target.name;
                            if (
                              additionalRequirements.includes(requirement) &&
                              !e.target.checked
                            ) {
                              additionalRequirements =
                                additionalRequirements?.filter(
                                  (range) => range !== requirement
                                );
                            } else if (e.target.checked) {
                              additionalRequirements.push(selected);
                            }
                            setFormValues({
                              ...formValues,
                              additional_requirements: additionalRequirements
                            });
                          }}
                        />
                      ))}
                      {isValueIncluded(
                        'additional_requirements',
                        'Requires singing'
                      ) && (
                        <FormInput
                          name="singing_details"
                          label="Singing Details"
                          placeholder="Classical"
                          onChange={setFormState}
                          defaultValue={formValues?.singing_details}
                          style={{ marginTop: 15 }}
                        />
                      )}
                      {isValueIncluded(
                        'additional_requirements',
                        'Requires dancing'
                      ) && (
                        <FormInput
                          name="dancing_details"
                          label="Dancing Details"
                          placeholder="Modern"
                          onChange={setFormState}
                          defaultValue={formValues?.dancing_details}
                          style={{ marginTop: 15 }}
                        />
                      )}
                    </Form.Group>
                    <Form.Group
                      className="form-group"
                      style={{ marginTop: 30 }}
                    >
                      <CAGLabel>Gender Identity</CAGLabel>
                      {roleGenders.map((gender) => {
                        const isOpenToAll = gender === 'Open to all genders';
                        const isDisabled =
                          isOpenToAll &&
                          hasSpecificSelections('gender_identity');
                        const isChecked = isValueIncluded(
                          'gender_identity',
                          gender
                        );
                        return (
                          <Checkbox
                            checked={isChecked}
                            disabled={isDisabled}
                            fieldType="checkbox"
                            key={`gender_identity_${gender}`}
                            label={gender}
                            name={gender}
                            onChange={(e: any) => {
                              if (isOpenToAll) {
                                handleOpenToAllChange(
                                  'gender_identity',
                                  e.target.checked
                                );
                              } else {
                                handleSpecificOptionChange(
                                  'gender_identity',
                                  gender,
                                  e.target.checked
                                );
                              }
                            }}
                          />
                        );
                      })}
                    </Form.Group>
                    <Form.Group
                      className="form-group"
                      style={{ marginTop: 20 }}
                    >
                      <CAGLabel>Character Age Range</CAGLabel>
                      {ageRanges.map((ageRange) => {
                        const isOpenToAll = ageRange === 'Open to all ages';
                        const isDisabled =
                          isOpenToAll && hasSpecificSelections('age_range');
                        const isChecked = isValueIncluded(
                          'age_range',
                          ageRange
                        );
                        return (
                          <Checkbox
                            checked={isChecked}
                            disabled={isDisabled}
                            fieldType="checkbox"
                            key={`age_range_${ageRange}`}
                            label={ageRange}
                            name={ageRange}
                            onChange={(e: any) => {
                              if (isOpenToAll) {
                                handleOpenToAllChange(
                                  'age_range',
                                  e.target.checked
                                );
                              } else {
                                handleSpecificOptionChange(
                                  'age_range',
                                  ageRange,
                                  e.target.checked
                                );
                              }
                            }}
                          />
                        );
                      })}
                    </Form.Group>
                    <Form.Group
                      className="form-group"
                      style={{ marginTop: 20 }}
                    >
                      <CAGLabel>Ethnicity</CAGLabel>
                      <Checkbox
                        checked={isValueIncluded(
                          'ethnicity',
                          'Open to all ethnicities'
                        )}
                        disabled={hasSpecificSelections('ethnicity')}
                        fieldType="checkbox"
                        key="ethnicity-open-to-all"
                        label="Open to all ethnicities"
                        name="Open to all ethnicities"
                        onChange={(e: any) => {
                          handleOpenToAllChange('ethnicity', e.target.checked);
                        }}
                      />
                      {ethnicityTypes.map((eth) => {
                        const isParentChecked = isValueIncluded(
                          'ethnicity',
                          eth.name
                        );
                        const isParentDisabled =
                          isOpenToAllSelected('ethnicity');
                        return (
                          <React.Fragment key={`parent-frag-chk-${eth.name}`}>
                            <Checkbox
                              checked={isParentChecked}
                              disabled={isParentDisabled}
                              fieldType="checkbox"
                              key={`first-level-chk-${eth.name}`}
                              label={eth.name}
                              name={eth.name}
                              onChange={(e: any) => {
                                handleSpecificOptionChange(
                                  'ethnicity',
                                  eth.name,
                                  e.target.checked
                                );
                              }}
                            />
                            {eth.values.length > 0 && (
                              <div style={{ paddingLeft: '1.25rem' }}>
                                {eth.values.map((ethV) => {
                                  const isSubChecked = isValueIncluded(
                                    'ethnicity',
                                    ethV
                                  );
                                  const isSubDisabled =
                                    isOpenToAllSelected('ethnicity');
                                  return (
                                    <Checkbox
                                      checked={isSubChecked}
                                      disabled={isSubDisabled}
                                      fieldType="checkbox"
                                      key={`${eth.name}-child-chk-${ethV}`}
                                      label={ethV}
                                      name={ethV}
                                      onChange={(e: any) => {
                                        handleSpecificOptionChange(
                                          'ethnicity',
                                          ethV,
                                          e.target.checked
                                        );
                                      }}
                                    />
                                  );
                                })}
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </Form.Group>
                    <Form.Group
                      className="form-group"
                      style={{ marginTop: 20 }}
                    >
                      <CAGLabel>LGBTQ+</CAGLabel>
                      <Checkbox
                        checked={formValues.lgbtq_only || false}
                        fieldType="checkbox"
                        key="lgbtq_only"
                        label="LGBTQ+ only"
                        name="lgbtq_only"
                        onChange={(e: any) => {
                          setFormValues({
                            ...formValues,
                            lgbtq_only: e.target.checked
                          });
                        }}
                      />
                    </Form.Group>
                  </>
                )}
              </Col>
            </Row>
            <ModalButtonContainer className="d-flex flex-column-reverse flex-md-row flex-md-row-reverse mt-3">
              <Button
                onClick={() => onSave(formValues)}
                text="Save + Close"
                type="button"
                variant="primary"
              />
              <Button
                onClick={() => setShowConfirm(true)}
                text="Delete"
                type="button"
                variant="danger"
                className="mb-md-0 mr-md-3 mb-3"
              />
            </ModalButtonContainer>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

const CloseButton = styled.div`
  font-size: 24px;
  cursor: pointer;
`;

const Icon = styled(FontAwesomeIcon)`
  margin-right: 5px;
  color: ${colors.lighterGrey};
`;

const Title = styled.h2`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 700;
  font-size: 20px;
  line-height: 16px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
`;

const RoleRate = styled.div`
  margin-top: -30px;
  display: flex;
  gap: 0.75em;
  align-items: center;
`;

const ModalButtonContainer = styled.div`
  gap: 0;

  @media (max-width: ${breakpoints.md}) {
    gap: 12px;
    width: 100%;

    button {
      width: 100%;
      min-height: 44px;
    }
  }
`;

export default RoleModal;
