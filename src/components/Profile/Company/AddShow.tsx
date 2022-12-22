import { getDoc, updateDoc } from '@firebase/firestore';
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import React, { useEffect, useState } from 'react';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hooks-helper';
import { useProfileContext } from '../../../context/ProfileContext';
import { Button } from '../../../genericComponents';
import { neighborhoods } from '../../../utils/lookups';
import PageContainer from '../../layout/PageContainer';
import AdditionalPhoto from '../Form/AdditionalPhoto';
import {
  FormInput,
  FormRadio,
  FormSelect,
  FormTextArea,
  Input
} from '../Form/Inputs';
import FormPhoto from '../Form/Photo';
import DetailAdd from '../shared/DetailAdd';
import DetailSection from '../shared/DetailSection';
import AddAwardButton from './AddAwardButton';
import {
  AdditionalPhotos,
  DetailsCard,
  DetailsCardItem,
  DetailsColTitle,
  LeftCol,
  RightCol,
  Title
} from './ProfileStyles';
import { Show } from './types';

const types = [
  { name: 'Musical', value: 'musical' },
  { name: 'Play', value: 'play' },
  { name: 'Other', value: 'other' }
];

const CompanyAddShow: React.FC<{
  toggleEdit: () => void;
}> = ({ toggleEdit }) => {
  const {
    profile: { ref, data },
    setProfileData
  } = useProfileContext();
  const [formValues, setFormValues] = useForm<Show>({
    production_name: '',
    production_image_url: '',
    type: undefined,
    type_other: '',
    status: undefined,
    description: '',
    director: '',
    musical_director: '',
    equity: undefined
  });
  const [showOtherType, setShowOtherType] = useState(false);

  console.log('formValues', formValues);

  useEffect(() => {
    setShowOtherType(formValues.type === 'other');
  }, [formValues.type]);

  // useEffect(() => {
  //   if (data) {
  //     Object.entries(data).map(([key, value]) =>
  //       setFormValues({
  //         target: {
  //           name: key,
  //           value: value
  //         }
  //       })
  //     );
  //   }
  // }, [data]);

  const handleSubmit = async () => {
    if (ref && JSON.stringify(data) !== JSON.stringify(formValues)) {
      const nextData = {
        ...data,
        ...formValues
      };
      await updateDoc(ref, nextData);
      const profileData = await getDoc(ref);
      setProfileData(profileData.data());
    }
    toggleEdit();
  };

  return (
    <PageContainer>
      <Form>
        <Row>
          <Col lg={12}>
            <div className="d-flex flex-row justify-content-between">
              <Title>Add a new show</Title>
              <Button
                onClick={toggleEdit}
                text="Save Show"
                icon={faFloppyDisk}
                type="button"
                variant="primary"
              />
            </div>
          </Col>
        </Row>
        <Row>
          <LeftCol lg={4}>
            <FormPhoto
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
              options={types}
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

            <FormTextArea
              name="description"
              label="Bio"
              onChange={setFormValues}
              defaultValue={formValues?.description}
            />

            <DetailSection title="Awards & Recognition">
              <AddAwardButton />
            </DetailSection>
            <DetailSection title="Active Shows">
              <DetailAdd text="Add a new show" />
            </DetailSection>
            <DetailSection title="Inactive Shows">
              <DetailAdd text="Add a new show" />
            </DetailSection>
          </RightCol>
        </Row>
      </Form>
    </PageContainer>
  );
};

export default CompanyAddShow;
