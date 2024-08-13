import React, { useEffect, useState } from 'react';
import { getOptions } from '../../../../../utils/helpers';
import { productionStatuses } from '../../../../../utils/lookups';
import { FormInput, FormRadio, FormTextArea } from '../../../Form/Inputs';
import { LeftCol, RightCol } from '../../ProfileStyles';
import { Production } from '../../types';
import ProductionPhoto from '../ProductionPhoto';
import ImageUpload from '../../../../shared/ImageUpload';

const types = ['Musical', 'Play', 'Other'];
const equity = ['Union', 'Non-Union'];

const ManageProductionBasic: React.FC<{
  formValues: Production;
  setFormValues: any;
}> = ({ formValues, setFormValues }) => {
  const [showOtherType, setShowOtherType] = useState(false);

  useEffect(() => {
    setShowOtherType(formValues.type === 'Other');
  }, [formValues.type]);

  const setProfilePicture = (url: string) => {
    const target = {
      name: 'production_image_url',
      value: url
    };
    setFormValues({ target });
  };

  return (
    <>
      <LeftCol lg={4}>
        <ImageUpload
          onSave={(production_image_url: string) =>
            setProfilePicture(production_image_url)
          }
          currentImgUrl={formValues?.production_image_url}
          modal={false}
          type={'Poster'}
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
          options={getOptions(productionStatuses)}
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
        <FormInput
          name="casting_director"
          label="Casting Director"
          onChange={setFormValues}
          defaultValue={formValues?.casting_director}
        />
        <FormInput
          name="casting_director_email"
          label="Casting Director Email"
          onChange={setFormValues}
          defaultValue={formValues?.casting_director_email}
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
