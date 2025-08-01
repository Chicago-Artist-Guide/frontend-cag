import { getDoc, updateDoc } from '@firebase/firestore';
import { uuidv4 } from '@firebase/util';
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect } from 'react';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { Button, InputField } from '../../../components/shared';
import { useUserContext } from '../../../context/UserContext';
import { colors, fonts } from '../../../theme/styleVars';
import { neighborhoods } from '../../../utils/lookups';
import { ErrorMessage } from '../../../utils/validation';
import PageContainer from '../../layout/PageContainer';
import AdditionalPhoto from '../Form/AdditionalPhoto';
import { FormInput, FormSelect, FormTextArea, Input } from '../Form/Inputs';
import { ImageUploadComponent } from '../../shared';
import DetailAdd from '../shared/DetailAdd';
import DetailSection from '../shared/DetailSection';
import {
  AdditionalPhotos,
  DetailsCard,
  DetailsCardItem,
  DetailsColTitle,
  LeftCol,
  RightCol,
  Title
} from './ProfileStyles';
import { Award, Profile } from './types';

const CompanyProfileEdit: React.FC<{ toggleEdit: () => void }> = ({
  toggleEdit
}) => {
  const {
    profile: { ref, data },
    setProfileData
  } = useUserContext();
  const [formValues, setFormValues] = useForm<Profile>({
    additional_photos: {},
    awards: [],
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
        setFormValues({ target: { name: key, value: value } })
      );
    }
  }, [data]);

  const handleSubmit = async () => {
    if (ref && JSON.stringify(data) !== JSON.stringify(formValues)) {
      const nextData = {
        ...data,
        ...formValues,
        awards: formValues.awards?.filter((award) => award.award_name) || []
      };
      await updateDoc(ref, nextData);
      const profileData = await getDoc(ref);
      setProfileData(profileData.data());
    }
    toggleEdit();
  };

  const images = Array(6).fill(1);
  const awards = formValues?.awards || [];

  const handleAwardChange = (event: any, index: number, field: keyof Award) => {
    const newAwards = [...awards];
    newAwards[index][field] = event.target.value;
    setFormValues({ target: { name: 'awards', value: newAwards } });
  };

  const handleAwardLinkChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    awardIdx: number,
    linkIdx: number
  ) => {
    const newAwards = [...awards];
    if (!newAwards[awardIdx].website_links)
      newAwards[awardIdx].website_links = [''];
    newAwards[awardIdx].website_links[linkIdx] = e.target.value;
    setFormValues({ target: { name: 'awards', value: newAwards } });
  };

  const addAwardLink = (awardIdx: number) => {
    const newAwards = [...awards];
    if (!newAwards[awardIdx].website_links)
      newAwards[awardIdx].website_links = [''];
    newAwards[awardIdx].website_links.push('');
    setFormValues({ target: { name: 'awards', value: newAwards } });
  };

  const removeAwardLink = (awardIdx: number, linkIdx: number) => {
    const newAwards = [...awards];
    if (!newAwards[awardIdx].website_links) return;
    newAwards[awardIdx].website_links.splice(linkIdx, 1);
    if (newAwards[awardIdx].website_links.length === 0) {
      newAwards[awardIdx].website_links.push('');
    }
    setFormValues({ target: { name: 'awards', value: newAwards } });
  };

  const removeAward = (index: number) => {
    const newAwards = [...awards];
    newAwards.splice(index, 1);
    setFormValues({ target: { name: 'awards', value: newAwards } });
  };

  const addAward = () => {
    setFormValues({
      target: {
        name: 'awards',
        value: [...awards, { award_id: uuidv4(), award_name: '' }]
      }
    });
  };

  return (
    <PageContainer>
      <Form>
        <Row>
          <Col lg={12}>
            <div className="d-flex justify-content-between flex-row">
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
            <ImageUploadComponent
              onSave={(imageUrl: string) => {
                setFormValues({
                  target: { name: 'profile_image_url', value: imageUrl }
                });
              }}
              currentImageUrl={formValues?.profile_image_url}
              imageType="company"
              showCrop={true}
              maxSizeInMB={5}
            />
            <AdditionalPhotos className="d-flex justify-content-between flex-wrap">
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
              {awards.map((award, index) => (
                <div key={index} className="mt-3">
                  <div className="d-flex">
                    <AwardTitle>Award #{index + 1}</AwardTitle>
                    <CloseIcon
                      icon={faClose}
                      className="ml-auto"
                      size="lg"
                      onClick={() => removeAward(index)}
                    />
                  </div>
                  <Row>
                    <Col md={6} xs={12}>
                      <FormInput
                        name={`awards.${index}.award_name`}
                        label="Award Name"
                        defaultValue={award.award_name}
                        onChange={(e) =>
                          handleAwardChange(e, index, 'award_name')
                        }
                        placeholder="Best Play"
                      />
                      <FormInput
                        name={`awards.${index}.award_year`}
                        label="Award Year"
                        defaultValue={award.award_year}
                        onChange={(e) =>
                          handleAwardChange(e, index, 'award_year')
                        }
                        placeholder="2019"
                      />
                    </Col>
                    <Col md={6} xs={12}>
                      <FormInput
                        name={`awards.${index}.awarded_by`}
                        label="Awarded By"
                        defaultValue={award.awarded_by}
                        onChange={(e) =>
                          handleAwardChange(e, index, 'awarded_by')
                        }
                        placeholder="Theatre Awards"
                      />
                      <FormInput
                        name={`awards.${index}.show_title`}
                        label="Show Title"
                        defaultValue={award.show_title}
                        onChange={(e) =>
                          handleAwardChange(e, index, 'show_title')
                        }
                        placeholder="Death of a Salesman"
                      />
                    </Col>
                  </Row>
                  <div style={{ marginTop: 12 }}>
                    <label>Relevant Links:</label>
                    {(award.website_links && award.website_links.length > 0
                      ? award.website_links
                      : ['']
                    ).map((link, linkIdx) => (
                      <AwardWebsiteLinkRow key={linkIdx}>
                        <FormInput
                          name={`awards.${index}.website_links.${linkIdx}`}
                          label=""
                          defaultValue={link}
                          onChange={(e) => {
                            if (
                              e &&
                              'target' in e &&
                              e.target &&
                              (e.target as HTMLInputElement).value !== undefined
                            ) {
                              handleAwardLinkChange(
                                e as React.ChangeEvent<HTMLInputElement>,
                                index,
                                linkIdx
                              );
                            }
                          }}
                          style={{ flex: 1, minWidth: 0, marginTop: 0 }}
                          placeholder="https://www.example.com"
                        />
                        {award.website_links &&
                          award.website_links.length > 1 && (
                            <AwardWebsiteCloseBtn
                              type="button"
                              variant="danger"
                              icon={faClose}
                              text=""
                              onClick={() => removeAwardLink(index, linkIdx)}
                            />
                          )}
                      </AwardWebsiteLinkRow>
                    ))}
                    <Button
                      type="button"
                      variant="secondary"
                      text="Add Link"
                      onClick={() => addAwardLink(index)}
                      style={{ marginTop: 4 }}
                    />
                  </div>
                </div>
              ))}
              <div className="mt-4">
                <DetailAdd
                  text="Add an award or recognition"
                  onClick={addAward}
                />
              </div>
            </DetailSection>
          </RightCol>
        </Row>
      </Form>
    </PageContainer>
  );
};

const AwardTitle = styled.h2`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${colors.mainFont};
`;

const CloseIcon = styled(FontAwesomeIcon)`
  color: ${colors.black};
  cursor: pointer;
  &:hover {
    color: ${colors.slate};
  }
`;

const AwardWebsiteLinkRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  max-width: 500px;
`;

const AwardWebsiteCloseBtn = styled(Button)`
  margin-left: 8;
  min-width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  & > svg {
    margin-right: 0;
  }
`;

export default CompanyProfileEdit;
