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
  roleStatuses,
  unionOptions
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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  useEffect(() => {
    if (role.role_id) {
      // Backward compatibility: convert legacy string union to array
      const normalizedRole = {
        ...role,
        union: typeof role.union === 'string' ? [role.union] : role.union || []
      };
      setFormValues(normalizedRole);
    } else {
      setFormValues({
        type: type,
        role_status: 'Open',
        gender_identity: ['Open to all genders'],
        age_range: ['Open to all ages'],
        ethnicity: ['Open to all ethnicities'],
        union: []
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

  const validateForm = (): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Role name/position required
    if (!formValues.role_name?.trim()) {
      errors.push(isOnStage ? 'Role Name is required' : 'Position is required');
    }

    // Pay required and must be positive
    if (!formValues.role_rate || Number(formValues.role_rate) <= 0) {
      errors.push('Pay must be a positive number');
    }

    return { valid: errors.length === 0, errors };
  };

  const onSave = async (role: Role) => {
    const validation = validateForm();

    if (!validation.valid) {
      // Display errors to user
      setValidationErrors(validation.errors);
      return;
    }

    // Clear any previous errors
    setValidationErrors([]);
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

  const handleUmbrellaEthnicityChange = (
    umbrella: string,
    checked: boolean
  ) => {
    const umbrellaObj = ethnicityTypes.find((e) => e.name === umbrella);
    if (!umbrellaObj) return;

    const currentEthnicities = (formValues.ethnicity as string[]) || [];

    if (checked) {
      // Remove "Open to all ethnicities" if present
      const filtered = currentEthnicities.filter(
        (e) => e !== 'Open to all ethnicities'
      );
      // Add umbrella and all subcategories
      const newEthnicities = [
        ...filtered.filter(
          (e) => e !== umbrella && !umbrellaObj.values.includes(e)
        ),
        umbrella,
        ...umbrellaObj.values
      ];
      setFormValues({ ...formValues, ethnicity: newEthnicities });
    } else {
      // Remove umbrella and all subcategories
      const newEthnicities = currentEthnicities.filter(
        (e) => e !== umbrella && !umbrellaObj.values.includes(e)
      );
      setFormValues({ ...formValues, ethnicity: newEthnicities });
    }
  };

  const handleSubcategoryEthnicityChange = (
    subcategory: string,
    checked: boolean
  ) => {
    const umbrellaObj = ethnicityTypes.find((e) =>
      e.values.includes(subcategory)
    );
    if (!umbrellaObj) return;

    const currentEthnicities = (formValues.ethnicity as string[]) || [];

    if (checked) {
      // Remove "Open to all ethnicities" if present
      const filtered = currentEthnicities.filter(
        (e) => e !== 'Open to all ethnicities'
      );
      const newEthnicities = [...filtered, subcategory];

      // Check if all subcategories now selected
      const allSubcategoriesSelected = umbrellaObj.values.every((v) =>
        newEthnicities.includes(v)
      );

      if (
        allSubcategoriesSelected &&
        !newEthnicities.includes(umbrellaObj.name)
      ) {
        newEthnicities.push(umbrellaObj.name);
      }

      setFormValues({ ...formValues, ethnicity: newEthnicities });
    } else {
      // Remove subcategory and umbrella if present
      const newEthnicities = currentEthnicities.filter(
        (e) => e !== subcategory && e !== umbrellaObj.name
      );
      setFormValues({ ...formValues, ethnicity: newEthnicities });
    }
  };

  const handleUnionChange = (option: string, checked: boolean) => {
    const currentUnions = (formValues.union as string[]) || [];

    if (checked) {
      setFormValues({ ...formValues, union: [...currentUnions, option] });
    } else {
      setFormValues({
        ...formValues,
        union: currentUnions.filter((u) => u !== option)
      });
    }
  };

  const isUnionSelected = (option: string): boolean => {
    return ((formValues.union as string[]) || []).includes(option);
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
                    required={true}
                  />
                ) : (
                  <FormInput
                    name="role_name"
                    label="Role Name"
                    onChange={setFormState}
                    defaultValue={formValues?.role_name}
                    style={{ marginTop: 0 }}
                    required={true}
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
                  <CAGLabel>
                    Pay<RequiredAsterisk>*</RequiredAsterisk>
                  </CAGLabel>
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
                <Form.Group className="form-group" style={{ marginTop: 30 }}>
                  <CAGLabel>Union Status</CAGLabel>
                  {unionOptions.map((option) => (
                    <Checkbox
                      checked={isUnionSelected(option)}
                      fieldType="checkbox"
                      key={`union_${option}`}
                      label={option}
                      name={option}
                      onChange={(e: any) => {
                        handleUnionChange(option, e.target.checked);
                      }}
                    />
                  ))}
                </Form.Group>
                {isOnStage && (
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
                      <CAGLabel>Character Gender</CAGLabel>
                      {roleGenders.map((gender) => {
                        const selectedGender =
                          formValues.gender_identity?.[0] ||
                          'Open to all genders';
                        const isChecked = selectedGender === gender;
                        return (
                          <Checkbox
                            checked={isChecked}
                            fieldType="radio"
                            key={`gender_identity_${gender}`}
                            label={gender}
                            name="gender_identity_radio"
                            value={gender}
                            onChange={() => {
                              setFormValues({
                                ...formValues,
                                gender_identity: [gender],
                                include_nonbinary: false
                              });
                            }}
                          />
                        );
                      })}
                      {formValues.gender_identity?.[0] &&
                        formValues.gender_identity[0] !==
                          'Open to all genders' && (
                          <div
                            style={{ marginTop: '10px', paddingLeft: '20px' }}
                          >
                            <Checkbox
                              checked={formValues.include_nonbinary || false}
                              fieldType="checkbox"
                              key="include_nonbinary"
                              label="Include nonbinary actors"
                              name="include_nonbinary"
                              onChange={(e: any) => {
                                setFormValues({
                                  ...formValues,
                                  include_nonbinary: e.target.checked
                                });
                              }}
                            />
                          </div>
                        )}
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
                        return (
                          <React.Fragment key={`parent-frag-chk-${eth.name}`}>
                            <Checkbox
                              checked={isParentChecked}
                              fieldType="checkbox"
                              key={`first-level-chk-${eth.name}`}
                              label={eth.name}
                              name={eth.name}
                              onChange={(e: any) => {
                                handleUmbrellaEthnicityChange(
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
                                  return (
                                    <Checkbox
                                      checked={isSubChecked}
                                      fieldType="checkbox"
                                      key={`${eth.name}-child-chk-${ethV}`}
                                      label={ethV}
                                      name={ethV}
                                      onChange={(e: any) => {
                                        handleSubcategoryEthnicityChange(
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
            {validationErrors.length > 0 && (
              <ValidationErrorContainer>
                {validationErrors.map((error, index) => (
                  <ValidationError key={index}>{error}</ValidationError>
                ))}
              </ValidationErrorContainer>
            )}
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

const ValidationErrorContainer = styled.div`
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 12px 16px;
  margin-top: 20px;
  margin-bottom: 10px;
`;

const ValidationError = styled.div`
  color: #721c24;
  font-size: 14px;
  margin: 4px 0;
  font-family: ${fonts.montserrat};
`;

const RequiredAsterisk = styled.span`
  color: #dc3545;
  margin-left: 4px;
  font-weight: 600;
`;

export default RoleModal;
