import React, { useEffect, useState } from 'react';
import { FormInput, FormRadio, FormTextArea } from '../../Form/Inputs';
import { LeftCol, RightCol } from '../ProfileStyles';
import { Production } from '../types';
import ProductionPhoto from './ProductionPhoto';

const types = ['Musical', 'Play', 'Other'];
const statuses = ['Open Casting', 'Auditioning', 'Production'];
const equity = ['Union', 'Non-Union'];

function getOptions(options: string[]) {
  return options.map(option => ({
    name: option,
    value: option
  }));
}

const ManageProductionBasic: React.FC<{
  formValues: Production;
  setFormValues: any;
}> = ({ formValues, setFormValues }) => {
  const [showOtherType, setShowOtherType] = useState(false);

  useEffect(() => {
    setShowOtherType(formValues.type === 'Other');
  }, [formValues.type]);

  return (
    <>
      <LeftCol lg={4}>
        <ProductionPhoto
          src={formValues?.production_image_url}
          name="production_image_url"
          onChange={setFormValues}
        />
      </LeftCol>
      <RightCol lg={{ span: 7, offset: 1 }}>
        <FormInput
          name="production_name"
          label="Production Name"
          onChange={setFormValues}
          defaultValue={formValues?.production_name}
          style={{ marginTop: 0 }}
        />

        <FormRadio
          name="type"
          label="Type"
          options={getOptions(types)}
          checked={formValues.type}
          onChange={setFormValues}
        />

        {showOtherType && (
          <FormInput
            name="type_other"
            label=""
            onChange={setFormValues}
            defaultValue={formValues?.type_other}
            style={{ marginTop: 0 }}
          />
        )}

        <FormRadio
          name="status"
          label="Status"
          options={getOptions(statuses)}
          checked={formValues.status}
          onChange={setFormValues}
        />

        <FormTextArea
          name="description"
          label="Description"
          onChange={setFormValues}
          defaultValue={formValues?.description}
        />

        <FormInput
          name="director"
          label="Director"
          onChange={setFormValues}
          defaultValue={formValues?.director}
        />

        <FormInput
          name="musical_director"
          label="Musical Director"
          onChange={setFormValues}
          defaultValue={formValues?.musical_director}
        />

        <FormRadio
          name="equity"
          label="Equity"
          options={getOptions(equity)}
          checked={formValues.equity}
          onChange={setFormValues}
        />
      </RightCol>
    </>
  );
};

export default ManageProductionBasic;
