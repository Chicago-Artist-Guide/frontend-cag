import React from 'react';
import { Col } from 'react-bootstrap';
import { FormDateRange } from '../../Form/Inputs';
import { Production } from '../types';

const ManageProductionDates: React.FC<{
  formValues: Production;
  setFormValues: any;
}> = ({ formValues, setFormValues }) => {
  return (
    <Col>
      <FormDateRange
        name="audition"
        label="Auditions"
        onChange={setFormValues}
        startValue={formValues?.audition_start}
        endValue={formValues?.audition_end}
      />

      <FormDateRange
        name="callback"
        label="Callbacks"
        onChange={setFormValues}
        startValue={formValues?.callback_start}
        endValue={formValues?.callback_end}
      />

      <FormDateRange
        name="rehearsal"
        label="Rehearsals"
        onChange={setFormValues}
        startValue={formValues?.rehearsal_start}
        endValue={formValues?.rehearsal_end}
      />

      <FormDateRange
        name="tech_week"
        label="Tech Week"
        onChange={setFormValues}
        startValue={formValues?.tech_week_start}
        endValue={formValues?.tech_week_end}
      />

      <FormDateRange
        name="open_and_close"
        label="Open & Close"
        onChange={setFormValues}
        startValue={formValues?.open_and_close_start}
        endValue={formValues?.open_and_close_end}
      />
    </Col>
  );
};

export default ManageProductionDates;
