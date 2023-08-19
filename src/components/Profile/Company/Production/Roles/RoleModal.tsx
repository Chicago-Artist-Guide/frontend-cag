import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { FormTarget } from 'react-hooks-helper';
import styled from 'styled-components';
import { Button, Checkbox, Dropdown } from '../../../../../genericComponents';
import { colors, fonts } from '../../../../../theme/styleVars';
import { CAGLabel } from '../../../../SignUp/SignUpStyles';
import { FormInput, FormTextArea } from '../../../Form/Inputs';
import { StageRole } from '../../../shared/profile.types';
import { Role } from '../../types';
import {
  ageRanges,
  ethnicities,
  genders,
  roleStatuses
} from '../../../../../utils/lookups';
import { getOptions } from '../../../../../utils/helpers';
import ConfirmDialog from '../../../../ConfirmDialog';

const statuses = getOptions(roleStatuses);

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
        role_status: 'Open'
      });
    }
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

  const title = type === 'On-Stage' ? 'On-Stage Role' : 'Off-Stage Role';
  const isAgeRangeInAgeRanges = (ageRange: string) => {
    return formValues.age_range?.includes(ageRange);
  };

  const isGenderInGenders = (gender: string) => {
    return formValues.gender_identity?.includes(gender);
  };

  const isEthnicityInEthnicities = (ethnicity: string) => {
    return formValues.ethnicity?.includes(ethnicity);
  };

  const onDeleteConfirm = () => {
    onDelete(formValues);
  };

  const onDeleteCancel = () => {
    setShowConfirm(false);
  };

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
              <div className="d-flex flex-row flex-shrink-1 flex-row-reverse">
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
                <FormInput
                  name="role_name"
                  label="Role Name"
                  onChange={setFormState}
                  defaultValue={formValues?.role_name}
                  style={{ marginTop: 0 }}
                />
                <FormTextArea
                  name="description"
                  label="Bio/Description"
                  onChange={setFormState}
                  defaultValue={formValues?.description}
                  rows={6}
                />
                <Form.Group className="form-group">
                  <CAGLabel>Role Rate</CAGLabel>
                  <RoleRate>
                    <FormInput
                      name="rate_rate"
                      label="Rate"
                      onChange={setFormState}
                      defaultValue={formValues?.role_rate}
                      type="number"
                    />
                    <Dropdown
                      name="rate_rate_unit"
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
                        }
                      ]}
                      value={formValues?.role_rate_unit}
                      onChange={setFormState}
                    />
                  </RoleRate>
                </Form.Group>
                <Form.Group className="form-group" style={{ marginTop: 20 }}>
                  <CAGLabel>Gender Identity</CAGLabel>
                  {genders.map((gender) => (
                    <Checkbox
                      checked={isGenderInGenders(gender)}
                      fieldType="checkbox"
                      key={`gender_identity_${gender}`}
                      label={gender}
                      name={`${gender}`}
                      onChange={(e: any) => {
                        let genders = formValues.gender_identity || [];
                        const selected = e.target.name;
                        if (genders?.includes(gender) && !e.target.checked) {
                          genders = genders?.filter(
                            (range) => range !== gender
                          );
                        } else if (e.target.checked) {
                          genders.push(selected);
                        }
                        setFormValues({
                          ...formValues,
                          gender_identity: genders
                        });
                      }}
                    />
                  ))}
                </Form.Group>
              </Col>
              <Col lg={{ span: 4, offset: 1 }}>
                <Dropdown
                  name="role_status"
                  label="Role Status"
                  options={statuses}
                  value={formValues.role_status}
                  onChange={setFormState}
                  style={{ marginTop: 0 }}
                />
                <Form.Group className="form-group" style={{ marginTop: 20 }}>
                  <CAGLabel>Age Range</CAGLabel>
                  {ageRanges.map((ageRange) => (
                    <Checkbox
                      checked={isAgeRangeInAgeRanges(ageRange)}
                      fieldType="checkbox"
                      key={`age_range_${ageRange}`}
                      label={ageRange}
                      name={`${ageRange}`}
                      onChange={(e: any) => {
                        let ageRanges = formValues.age_range || [];
                        const selectedRange = e.target.name;
                        if (
                          ageRanges?.includes(ageRange) &&
                          !e.target.checked
                        ) {
                          ageRanges = ageRanges?.filter(
                            (range) => range !== ageRange
                          );
                        } else if (e.target.checked) {
                          ageRanges.push(selectedRange);
                        }
                        setFormValues({
                          ...formValues,
                          age_range: ageRanges
                        });
                      }}
                    />
                  ))}
                </Form.Group>
                <Form.Group className="form-group" style={{ marginTop: 20 }}>
                  <CAGLabel>Ethnicity</CAGLabel>
                  {ethnicities.map((ethnicity) => (
                    <Checkbox
                      checked={isEthnicityInEthnicities(ethnicity)}
                      fieldType="checkbox"
                      key={`age_range_${ethnicity}`}
                      label={ethnicity}
                      name={`${ethnicity}`}
                      onChange={(e: any) => {
                        let ethnicities = formValues.ethnicity || [];
                        const selectedRange = e.target.name;
                        if (
                          ethnicities?.includes(ethnicity) &&
                          !e.target.checked
                        ) {
                          ethnicities = ethnicities?.filter(
                            (range) => range !== ethnicity
                          );
                        } else if (e.target.checked) {
                          ethnicities.push(selectedRange);
                        }
                        setFormValues({
                          ...formValues,
                          ethnicity: ethnicities
                        });
                      }}
                    />
                  ))}
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex flex-row flex-row-reverse mt-3">
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
                className="mr-3"
              />
            </div>
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
  display: flex;
  gap: 0.75em;
  align-items: center;
`;

export default RoleModal;
