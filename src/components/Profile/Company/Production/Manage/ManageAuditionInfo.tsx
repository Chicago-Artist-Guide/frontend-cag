import React, { useEffect, useState } from 'react';
import { getOptions } from '../../../../../utils/helpers';
import {
  FormInput,
  FormTextArea,
  FormSelect,
  FormDateRange
} from '../../../Form/Inputs';
import { Production } from '../../types';
import { neighborhoods } from '../../../../../utils/lookups';
import { Col } from 'styled-bootstrap-grid';

const ManageAuditionInfo: React.FC<{
  formValues: Production;
  setFormValues: any;
}> = ({ formValues, setFormValues }) => {
  const [showOtherType, setShowOtherType] = useState(false);

  useEffect(() => {
    setShowOtherType(formValues.type === 'Other');
    console.log(formValues?.audition_location);
  }, [formValues.type]);

  return (
    <Col>
      <FormInput
        name="audition_location"
        label="Location"
        defaultValue={formValues?.audition_location}
        onChange={setFormValues}
      />
      <FormDateRange
        name="audition"
        label="Auditions"
        onChange={setFormValues}
        startValue={formValues?.audition_start}
        endValue={formValues?.audition_end}
      />
      <FormInput
        name="contact_person_name_audition"
        label="Contact Person Name"
        onChange={setFormValues}
        defaultValue={formValues?.contact_person_name_audition}
        style={{ marginTop: 25 }}
      />
      <FormInput
        name="contact_person_email_audition"
        label="Contact Person Email"
        onChange={setFormValues}
        defaultValue={formValues?.contact_person_email_audition}
        style={{ marginTop: 25 }}
      />
      <FormTextArea
        name="materials_to_prepare_audition"
        label="Materials to Prepare"
        onChange={setFormValues}
        defaultValue={formValues?.materials_to_prepare_audition}
        style={{ marginTop: 25 }}
      />
      <FormTextArea
        name="additional_notes_audition"
        label="Additional Notes"
        onChange={setFormValues}
        defaultValue={formValues?.additional_notes_audition}
        style={{ marginTop: 25 }}
      />
    </Col>
  );
};

export default ManageAuditionInfo;
