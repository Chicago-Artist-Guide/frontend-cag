import React, { useEffect, useState } from 'react';
import { getOptions } from '../../../../../utils/helpers';
import {
  productionStatuses,
  productionEquities
} from '../../../../../utils/lookups';
import ImageUpload from '../../../../shared/ImageUpload';
import {
  FormInput,
  FormRadio,
  FormTextArea,
  FormDateRange
} from '../../../Form/Inputs';
import { LeftCol, RightCol } from '../../ProfileStyles';
import { Production } from '../../types';

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
        <FormInput
          name="writers"
          label="Written By"
          onChange={setFormValues}
          defaultValue={formValues?.writers}
        />
        <FormDateRange
          name="open_and_close"
          label="Open & Close"
          onChange={setFormValues}
          startValue={formValues?.open_and_close_start}
          endValue={formValues?.open_and_close_end}
        />
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
        <FormRadio
          name="equity"
          label="Equity"
          options={getOptions(productionEquities)}
          checked={formValues.equity}
          onChange={setFormValues}
        />
        <FormInput
          name="location"
          label="Location"
          onChange={setFormValues}
          defaultValue={formValues?.location}
        />
        <FormInput
          name="musical_director"
          label="Musical Director"
          onChange={setFormValues}
          defaultValue={formValues?.musical_director}
        />
      </RightCol>
    </>
  );
};

export default ManageProductionBasic;
