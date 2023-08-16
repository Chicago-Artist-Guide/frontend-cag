import { getDoc, updateDoc } from '@firebase/firestore';
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hooks-helper';
import { useProfileContext } from '../../../context/ProfileContext';
import { Button, InputField } from '../../../genericComponents';
import { neighborhoods } from '../../../utils/lookups';
import PageContainer from '../../layout/PageContainer';
import AdditionalPhoto from '../Form/AdditionalPhoto';
import { FormInput, FormSelect, FormTextArea, Input } from '../Form/Inputs';
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
import { Profile } from './types';
import { ErrorMessage } from '../../../utils/validation';

const CompanyProfileEdit: React.FC<{
  toggleEdit: () => void;
}> = ({ toggleEdit }) => {
  const {
    profile: { ref, data },
    setProfileData
  } = useProfileContext();
  const [formValues, setFormValues] = useForm<Profile>({
    additional_photos: {},
    ...data
  });
  const locations = [
    { name: 'Choose one...', value: 'choose' },
    ...neighborhoods.map((neighborhood) => ({
      name: neighborhood,
      value: neighborhood
    }))
  ];

  useEffect(() => {
    if (data) {
      Object.entries(data).map(([key, value]) =>
        setFormValues({
          target: {
            name: key,
            value: value
          }
        })
      );
    }
  }, [data]);

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

  const images = Array(6).fill(1);

  return (
    <PageContainer>
      <Form>
        <Row>
          <Col lg={12}>
            <div className="d-flex flex-row justify-content-between">
              <Title>Edit your profile</Title>
              <Button
                onClick={handleSubmit}
                text="Save Profile"
                icon={faFloppyDisk}
                type="button"
                variant="secondary"
              />
            </div>
          </Col>
        </Row>
        <Row>
          <LeftCol lg={4}>
            <FormPhoto
              src={formValues?.profile_image_url}
              name="profile_image_url"
              onChange={setFormValues}
            />
            <AdditionalPhotos className="d-flex flex-wrap justify-content-between">
              {images.map((_, index) => (
                <AdditionalPhoto
                  key={index}
                  index={index}
                  src={formValues?.additional_photos?.[index]}
                  name={`additional_photos.${index}`}
                  onChange={setFormValues}
                />
              ))}
            </AdditionalPhotos>
            <DetailsCard>
              <DetailsColTitle>Basic Group Info</DetailsColTitle>
              <div>
                <DetailsCardItem>
                  Number of Members:{' '}
                  <Input
                    aria-label="number_of_members"
                    name="number_of_members"
                    onChange={setFormValues}
                    defaultValue={formValues?.number_of_members}
                  />
                </DetailsCardItem>
                <DetailsCardItem>
                  Primary Contact:
                  <Input
                    aria-label="primary_contact"
                    name="primary_contact"
                    onChange={setFormValues}
                    defaultValue={formValues?.primary_contact}
                  />
                </DetailsCardItem>
                <DetailsCardItem>
                  Email Address:{' '}
                  <InputField
                    first
                    required
                    aria-label="primary_contact_email"
                    name="primary_contact_email"
                    onChange={setFormValues}
                    value={formValues?.primary_contact_email || ''}
                    hasErrorCallback={() => null}
                    requiredLabel="Email address"
                    validationRegexMessage={ErrorMessage.EmailFormat}
                    validationRegexName="emailAddress"
                  />
                </DetailsCardItem>
              </div>
            </DetailsCard>
          </LeftCol>
          <RightCol lg={{ span: 7, offset: 1 }}>
            <FormInput
              name="theatre_name"
              label="Group Name"
              onChange={setFormValues}
              defaultValue={formValues?.theatre_name}
              style={{ marginTop: 0 }}
            />

            <FormSelect
              name="location"
              label="Neighborhood"
              options={locations}
              defaultValue={formValues.location}
              onChange={setFormValues}
            />

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

export default CompanyProfileEdit;
