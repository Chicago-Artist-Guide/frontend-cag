import { getDoc, updateDoc } from '@firebase/firestore';
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { useProfileContext } from '../../../context/ProfileContext';
import { Button } from '../../../genericComponents';
import { breakpoints, colors, fonts } from '../../../theme/styleVars';
import { neighborhoods } from '../../../utils/lookups';
import PageContainer from '../../layout/PageContainer';
import AdditionalPhoto from '../Form/AdditionalPhoto';
import { FormInput, FormSelect, FormTextArea, Input } from '../Form/Inputs';
import FormPhoto from '../Form/Photo';
import DetailAdd from '../shared/DetailAdd';
import DetailSection from '../shared/DetailSection';
import AddAward from './AddAward';
import { Profile } from './types';

const CompanyProfileEdit: React.FC<{
  toggleEdit: (isEditing: boolean) => void;
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
    ...neighborhoods.map(neighborhood => ({
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
      console.log({ nextData });
      await updateDoc(ref, nextData);
      const profileData = await getDoc(ref);
      setProfileData(profileData.data());
    }
    toggleEdit(false);
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
                  <Input
                    aria-label="primary_contact_email"
                    name="primary_contact_email"
                    onChange={setFormValues}
                    defaultValue={formValues?.primary_contact_email}
                  />
                </DetailsCardItem>
              </div>
            </DetailsCard>
          </LeftCol>
          <Col lg={{ span: 7, offset: 1 }}>
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
              <AddAward />
            </DetailSection>
            <DetailSection title="Active Shows">
              <DetailAdd text="Add a new show" />
            </DetailSection>
            <DetailSection title="Inactive Shows">
              <DetailAdd text="Add a new show" />
            </DetailSection>
          </Col>
        </Row>
      </Form>
    </PageContainer>
  );
};

const LeftCol = styled(Col)`
  @media (min-width: ${breakpoints.lg}) {
    max-width: 362px;
  }
`;

const Title = styled.h1`
  font-family: ${fonts.montserrat};
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 76px;
  text-transform: uppercase;
`;

const AdditionalPhotos = styled.div`
  margin-top: 20px;

  @media (min-width: ${breakpoints.lg}) {
    max-width: 332px;
  }
`;

const DetailsCard = styled.div`
  margin-top: 47px;
  background: ${colors.white};
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  padding: 25px 21px;
`;

const DetailsCardItem = styled.h6`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.07em;
  margin-top: 5px;
`;

const DetailsColTitle = styled.h2`
  font-family: ${fonts.montserrat};
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;

  &::after {
    content: '';
    margin-top: 8px;
    display: block;
    height: 8px;
    background: linear-gradient(
      90deg,
      ${colors.yellow} 0%,
      ${colors.darkGreen} 100%
    );
    border-radius: 4px;
  }
`;

export default CompanyProfileEdit;
