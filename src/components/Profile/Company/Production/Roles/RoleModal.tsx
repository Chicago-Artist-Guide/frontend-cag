import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Col, Form, Modal, Row } from 'react-bootstrap';
import { useForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { Button, Dropdown } from '../../../../../genericComponents';
import { colors } from '../../../../../theme/styleVars';
import { FormInput, FormTextArea } from '../../../Form/Inputs';
import { LeftCol, RightCol } from '../../ProfileStyles';
import { Role } from '../../types';

const statuses = ['Open', 'Closed'].map(status => ({
  name: status,
  value: status
}));

const RoleModal: React.FC<{
  show: boolean;
  type: 'on-stage' | 'off-stage';
  role?: Role;
  onSubmit: (x: Role) => void;
  onClose: () => void;
}> = ({ show = false, type, role = {}, onSubmit, onClose }) => {
  const [formValues, setFormValues] = useForm<Role>({
    type: type,
    role_status: 'Open'
  });

  useEffect(() => {
    if (role.role_id) {
      Object.entries(role).map(([key, value]) =>
        setFormValues({
          target: {
            name: key,
            value: value
          }
        })
      );
    }
  }, [role]);

  return (
    <Modal show={show} dialogClassName="modal-w">
      <Modal.Body>
        <Form>
          <Row className="px-4 py-4">
            <Col lg={7}>
              <FormInput
                name="role_name"
                label="Role Name"
                onChange={setFormValues}
                defaultValue={formValues?.role_name}
                style={{ marginTop: 0 }}
              />
              <FormTextArea
                name="description"
                label="Bio/Description"
                onChange={setFormValues}
                defaultValue={formValues?.description}
                rows={6}
              />
            </Col>
            <RightCol lg={{ span: 4, offset: 1 }}>
              <div className="d-flex flex-column" style={{ height: '100%' }}>
                <div
                  className="d-flex flex-row flex-shrink-1 flex-row-reverse"
                  style={{ gap: '1em' }}
                >
                  <CloseButton
                    className="d-flex align-items-center ml-3"
                    onClick={onClose}
                  >
                    <Icon icon={faClose} />
                  </CloseButton>
                </div>
                <div className="flex-grow-1">
                  <Dropdown
                    name="role_status"
                    label="Role Status"
                    options={statuses}
                    value={formValues.role_status}
                    onChange={setFormValues}
                  />
                </div>
                <div
                  className="d-flex flex-row flex-shrink-1 flex-row-reverse"
                  style={{ gap: '1em' }}
                >
                  <Button
                    onClick={() => onSubmit(formValues)}
                    text="Save + Close"
                    type="button"
                    variant="primary"
                  />
                </div>
              </div>
            </RightCol>
          </Row>
        </Form>
      </Modal.Body>
    </Modal>
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

export default RoleModal;
