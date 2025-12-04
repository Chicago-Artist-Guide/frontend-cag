import { getDoc, updateDoc } from '@firebase/firestore';
import { uuidv4 } from '@firebase/util';
import { faFloppyDisk, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import React, { useEffect, useRef } from 'react';
import { Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import { useForm } from 'react-hooks-helper';
import styled from 'styled-components';
import { Button, InputField } from '../../../components/shared';
import { useUserContext } from '../../../context/UserContext';
import { breakpoints, colors, fonts } from '../../../theme/styleVars';
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

const CompanyProfileEdit: React.FC<{
  toggleEdit: () => void;
  autoAddAward?: boolean;
}> = ({ toggleEdit, autoAddAward = false }) => {
  const {
    profile: { ref, data },
    setProfileData
  } = useUserContext();
  // Initialize form values directly from data - no useEffect needed
  const [formValues, setFormValues] = useForm<Profile>(
    data || {
      additional_photos: {},
      awards: []
    }
  );
  const locations = [
    { name: 'Choose one...', value: 'choose' },
    ...neighborhoods.map((neighborhood) => ({
      name: neighborhood,
      value: neighborhood
    }))
  ];

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
  const awardsSectionRef = useRef<HTMLDivElement>(null);

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

  // Auto-add award and scroll to awards section when entering from "Add award" button
  useEffect(() => {
    if (autoAddAward) {
      // Add a new award if coming from "Add award" button
      if (awards.length === 0 || awards[awards.length - 1].award_name) {
        addAward();
      }
      // Scroll to awards section after a brief delay to ensure render
      setTimeout(() => {
        awardsSectionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }, 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAddAward]);

  return (
    <PageContainer>
      <Form>
        <Row>
          <Col lg={12}>
            <EditHeaderWrapper>
              <BackButton
                onClick={toggleEdit}
                text="Back to Profile"
                type="button"
                variant="secondary"
              />
              <Title>Edit your profile</Title>
              <SaveProfileButton
                onClick={handleSubmit}
                text="Save Profile"
                icon={faFloppyDisk}
                type="button"
                variant="primary"
              />
            </EditHeaderWrapper>
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

            <AwardsSection ref={awardsSectionRef}>
              <AwardsSectionHeader>
                <AwardsSectionTitle>Awards & Recognition</AwardsSectionTitle>
                {awards.length > 0 && (
                  <AwardsHelpText>
                    Each award saves individually. Fill in required fields (*),
                    then click "Save" on each award.
                  </AwardsHelpText>
                )}
              </AwardsSectionHeader>
              {awards.map((award, index) => (
                <AwardFormContainer key={index} className="mt-3">
                  <AwardHeader>
                    <AwardTitle>Award #{index + 1}</AwardTitle>
                  </AwardHeader>
                  <Row>
                    <Col md={6} xs={12}>
                      <FormInput
                        name={`awards.${index}.award_name`}
                        label="Award Name *"
                        defaultValue={award.award_name}
                        onChange={(e) =>
                          handleAwardChange(e, index, 'award_name')
                        }
                        placeholder="Best Play"
                      />
                      <FormInput
                        name={`awards.${index}.award_year`}
                        label="Award Year *"
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
                        label="Awarded By *"
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
                  <LinksSection>
                    <LinksLabel>Relevant Links:</LinksLabel>
                    {(award.website_links && award.website_links.length > 0
                      ? award.website_links
                      : ['']
                    ).map((link, linkIdx) => (
                      <AwardWebsiteLinkRow key={linkIdx}>
                        <LinkInputWrapper>
                          <FormInput
                            name={`awards.${index}.website_links.${linkIdx}`}
                            label=""
                            defaultValue={link}
                            onChange={(e) => {
                              if (
                                e &&
                                'target' in e &&
                                e.target &&
                                (e.target as HTMLInputElement).value !==
                                  undefined
                              ) {
                                handleAwardLinkChange(
                                  e as React.ChangeEvent<HTMLInputElement>,
                                  index,
                                  linkIdx
                                );
                              }
                            }}
                            style={{ marginTop: 0 }}
                            placeholder="https://www.example.com"
                          />
                        </LinkInputWrapper>
                        {award.website_links &&
                          award.website_links.length > 1 && (
                            <AwardWebsiteDeleteBtn
                              type="button"
                              variant="danger"
                              icon={faTrashCan}
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
                      style={{ marginTop: 8 }}
                    />
                  </LinksSection>
                  <AwardActions>
                    <SaveAwardButton
                      type="button"
                      variant="primary"
                      icon={faFloppyDisk}
                      text="Save"
                      onClick={() => handleSubmit()}
                      disabled={
                        !award.award_name ||
                        !award.award_year ||
                        !award.awarded_by
                      }
                    />
                    <DeleteButton
                      type="button"
                      variant="danger"
                      icon={faTrashCan}
                      text="Remove"
                      onClick={() => removeAward(index)}
                    />
                  </AwardActions>
                </AwardFormContainer>
              ))}
              <div className="mt-4">
                <DetailAdd
                  text="Add an award or recognition"
                  onClick={addAward}
                />
              </div>
            </AwardsSection>
          </RightCol>
        </Row>
      </Form>
    </PageContainer>
  );
};

const AwardsSection = styled.div`
  margin-top: 32px;
  padding-top: 32px;
  border-top: 2px solid ${colors.lightGrey};

  @media (max-width: ${breakpoints.md}) {
    margin-top: 24px;
    padding-top: 24px;
  }
`;

const AwardsSectionHeader = styled.div`
  margin-bottom: 20px;

  @media (max-width: ${breakpoints.md}) {
    margin-bottom: 16px;
  }
`;

const AwardsSectionTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${colors.mainFont};
  margin: 0 0 8px 0;

  @media (max-width: ${breakpoints.md}) {
    font-size: 18px;
  }
`;

const AwardsHelpText = styled.p`
  font-family: ${fonts.mainFont};
  font-size: 14px;
  color: ${colors.slate};
  margin: 0;
  font-style: italic;

  @media (max-width: ${breakpoints.md}) {
    font-size: 13px;
  }
`;

const AwardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;

  @media (max-width: ${breakpoints.md}) {
    margin-bottom: 12px;
  }
`;

const AwardTitle = styled.h2`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 700;
  font-size: 24px;
  letter-spacing: 0.07em;
  text-transform: uppercase;
  color: ${colors.mainFont};
  margin: 0;

  @media (max-width: ${breakpoints.md}) {
    font-size: 18px;
  }
`;

const AwardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid ${colors.lightGrey};

  @media (max-width: ${breakpoints.md}) {
    width: 100%;
    justify-content: space-between;
    margin-top: 12px;
    padding-top: 12px;
  }
`;

const EditHeaderWrapper = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;

  @media (max-width: ${breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    margin-bottom: 20px;
  }

  ${Title} {
    @media (max-width: ${breakpoints.md}) {
      order: 1;
      text-align: center;
    }
  }
`;

const BackButton = styled(Button)`
  @media (max-width: ${breakpoints.md}) {
    order: 3;
    width: 100%;
  }
`;

const SaveProfileButton = styled(Button)`
  @media (max-width: ${breakpoints.md}) {
    order: 2;
    width: 100%;
  }
`;

const AwardFormContainer = styled.div`
  @media (max-width: ${breakpoints.md}) {
    padding: 16px;
    background: ${colors.white};
    border-radius: 8px;
    box-shadow: 0 0 4px 2px ${colors.black05a};
    margin-bottom: 16px;
  }
`;

const SaveAwardButton = styled(Button)`
  min-height: 44px;
  padding: 8px 16px;
  flex-shrink: 0;
  white-space: nowrap;

  @media (max-width: ${breakpoints.md}) {
    font-size: 14px;
    padding: 8px 12px;
    flex: 1;
  }
`;

const DeleteButton = styled(Button)`
  min-height: 44px;
  padding: 8px 16px;
  flex-shrink: 0;
  white-space: nowrap;

  @media (max-width: ${breakpoints.md}) {
    font-size: 14px;
    padding: 8px 12px;
    flex: 1;
  }
`;

const LinksSection = styled.div`
  margin-top: 16px;

  @media (max-width: ${breakpoints.md}) {
    margin-top: 12px;
  }
`;

const LinksLabel = styled.label`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 14px;
  display: block;
  margin-bottom: 8px;
  color: ${colors.mainFont};
`;

const LinkInputWrapper = styled.div`
  flex: 1;
  min-width: 0;
`;

const AwardWebsiteLinkRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;

  @media (max-width: ${breakpoints.md}) {
    align-items: center;
  }
`;

const AwardWebsiteDeleteBtn = styled(Button)`
  min-width: 44px;
  min-height: 44px;
  padding: 0;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0;

  & > svg {
    margin-right: 0;
  }
`;

export default CompanyProfileEdit;
