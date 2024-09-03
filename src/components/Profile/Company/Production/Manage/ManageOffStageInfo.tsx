import React from 'react';
import { FormInput, FormTextArea } from '../../../Form/Inputs';
import { Production } from '../../types';
import { Col } from 'react-bootstrap';

const ManageOffStageInfo: React.FC<{
  formValues: Production;
  setFormValues: any;
}> = ({ formValues, setFormValues }) => {
  return (
    <Col>
      <FormInput
        name="contact_person_name_offstage"
        label="Contact Person Name"
        onChange={setFormValues}
        defaultValue={formValues?.contact_person_name_offstage}
        style={{ marginTop: 0 }}
      />
      <FormInput
        name="contact_person_email_offstage"
        label="Contact Person Email"
        onChange={setFormValues}
        defaultValue={formValues?.contact_person_email_offstage}
        style={{ marginTop: 25 }}
      />
      <FormTextArea
        name="additional_notes_offstage"
        label="Additional Notes"
        onChange={setFormValues}
        defaultValue={formValues?.additional_notes_offstage}
        style={{ marginTop: 25 }}
      />
    </Col>
  );
};

export default ManageOffStageInfo;
