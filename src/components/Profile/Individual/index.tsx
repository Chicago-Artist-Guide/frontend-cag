import {
  faCamera,
  faCheckCircle,
  faPenToSquare,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  DocumentData,
  DocumentSnapshot,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import styled from 'styled-components';
import { Button, Checkbox, InputField } from '../../../components/shared';
import { useUserContext } from '../../../context/UserContext';
import { colors, fonts } from '../../../theme/styleVars';
import { hasNonEmptyValues } from '../../../utils/hasNonEmptyValues';
import { forceHttp } from '../../../utils/validation';
import PageContainer from '../../layout/PageContainer';
import {
  AgeRange,
  IndividualAccountInit,
  IndividualProfileDataFullInit,
  IndividualWebsite,
  PastPerformances,
  ProfileAwards,
  pronouns,
  SkillCheckbox,
  skillCheckboxes,
  TrainingInstitution,
  UpcomingPerformances,
  WebsiteTypes
} from '../../SignUp/Individual/types';
import DetailSection from '../shared/DetailSection';
import { ImageUploadComponent } from '../../shared';
import { PreviewCard } from '../shared/styles';
import EditPersonalDetails from './EditPersonalDetails';
import Awards from './ProfileSections/Awards';
import FeaturesEdit from './ProfileSections/Edits/FeaturesEdit';
import OffStageSkillsEdit from './ProfileSections/Edits/OffStageSkillsEdit';
import TrainingEdit from './ProfileSections/Edits/TrainingEdit';
import Features from './ProfileSections/Features';
import OffStageSkills from './ProfileSections/OffStageSkills';
import SpecialSkills from './ProfileSections/SpecialSkills';
import Training from './ProfileSections/Training';
import type { EditModeSections } from './types';

const IndividualProfile: React.FC<{ previewMode?: boolean }> = ({
  previewMode = false
}) => {
  const { account, profile, setAccountData, setProfileData } = useUserContext();
  const [editMode, setEditMode] = useState<EditModeSections>({
    personalDetails: false,
    headline: false,
    training: false,
    upcoming: false,
    past: false,
    skills: false,
    awards: false,
    offstage_roles: false
  });
  const [editProfile, setEditProfile] = useState(profile?.data);
  const [editAccount, setEditAccount] = useState(account?.data);

  // websites
  const [websiteId, setWebsiteId] = useState(1);

  // training
  const [trainingId, setTrainingId] = useState(1);

  // upcoming and past shows
  const [showPastId, setShowPastId] = useState(1);
  const [upcomingId, setShowUpcomingId] = useState(1);

  // skills
  const [input, setInput] = useState('');
  const [skillTags, setTags] = useState([
    ...(editProfile?.additional_skills_manual || [])
  ] as string[]);
  const [trainings] = useState([
    ...(editProfile?.training_institutions || [])
  ] as string[]);
  const [isKeyReleased, setIsKeyReleased] = useState(false);

  // awards
  const [awardId, setAwardId] = useState(1);
  const [yearOptions, setYearOptions] = useState([] as number[]);

  const PageWrapper = previewMode ? Container : PageContainer;

  const updatePerformanceState = () => {
    if (!profile?.data?.upcoming_performances) {
      return;
    }

    let maxId = 1;

    for (const performance of profile.data.upcoming_performances) {
      const id = performance.id;
      if (id > maxId) {
        maxId = id;
      }
    }
    setShowUpcomingId(maxId);
  };

  const updatePastPerformanceState = () => {
    if (!profile?.data?.past_performances) {
      return;
    }

    let maxId = 1;

    for (const performance of profile.data.past_performances) {
      const id = performance.id;
      if (id > maxId) {
        maxId = id;
      }
    }

    setShowPastId(maxId);
  };

  const updateTrainingState = () => {
    if (!profile?.data?.training_institutions) {
      setEditProfile((prevState: any) => ({
        ...prevState,
        training_institutions: []
      }));
      return;
    }

    const maxId = profile.data.training_institutions.length || 1;
    setTrainingId(maxId);
  };

  useEffect(() => {
    if (editMode.personalDetails || editMode.headline || editMode.upcoming) {
      return;
    }

    setWebsiteId(profile?.data?.websites?.length || 1);
    setEditProfile(profile?.data);
    updatePerformanceState();
    updatePastPerformanceState();
    updateTrainingState();
  }, [profile?.data, editMode]);

  useEffect(() => {
    if (profile.ref) {
      const unsubscribeProfile = onSnapshot(
        profile.ref,
        (snapshot: DocumentSnapshot<DocumentData>) => {
          const updatedProfileData = snapshot.data();
          if (updatedProfileData) {
            setProfileData(updatedProfileData);
          } else {
            console.log('Profile document does not exist');
          }
        }
      );

      // Clean up the subscription on unmount
      return () => unsubscribeProfile();
    }
  }, []); // removing profile.ref to save calls to firebase

  useEffect(() => {
    if (account.ref) {
      const unsubscribeAccount = onSnapshot(
        account.ref,
        (snapshot: DocumentSnapshot<DocumentData>) => {
          const updatedAccountData = snapshot.data();
          if (updatedAccountData) {
            setAccountData(updatedAccountData);
          } else {
            console.log('Account document does not exist');
          }
        }
      );

      // Clean up the subscription on unmount
      return () => unsubscribeAccount();
    }
  }, []); // removing account.ref to save calls to firebase

  const onEditModeClick = (
    e: React.MouseEvent<HTMLElement>,
    editModeSection: keyof EditModeSections,
    editModeVal?: boolean
  ) => {
    e.preventDefault();

    setEditMode({ ...editMode, [editModeSection]: editModeVal ?? true });
  };

  const setProfileForm = (field: string, value: any) => {
    setEditProfile((prevState: IndividualProfileDataFullInit) => ({
      ...prevState,
      [field]: value
    }));
  };

  const setAccountForm = (field: string, value: any) => {
    setEditAccount((prevState: IndividualAccountInit) => ({
      ...prevState,
      [field]: value
    }));
  };

  const ageRangeChange = (checkValue: boolean, range: AgeRange) => {
    let newRanges = [...(editProfile?.age_ranges || [])];

    if (checkValue) {
      // check age range value
      if (newRanges.indexOf(range) < 0 && newRanges.length < 3) {
        newRanges.push(range);
      }
    } else {
      // uncheck age range value
      newRanges = newRanges.filter((aR) => aR !== range);
    }

    setProfileForm('age_ranges', newRanges);
  };

  const ethnicityChange = (checkValue: any, type: string) => {
    let newEthnicities = [...(editProfile?.ethnicities || [])];

    if (checkValue) {
      // check ethnicity type value
      if (newEthnicities.indexOf(type) < 0) {
        newEthnicities.push(type);
      }
    } else {
      // uncheck age range value
      newEthnicities = newEthnicities.filter((aR) => aR !== type);
    }

    setProfileForm('ethnicities', newEthnicities);
  };

  const onWebsiteInputChange = <T extends keyof IndividualWebsite>(
    fieldValue: IndividualWebsite[T],
    fieldName: T,
    id: number
  ) => {
    const newWebsiteValues = [...(editProfile?.websites || [])];
    const findIndex = newWebsiteValues.findIndex((web) => web.id === id);
    newWebsiteValues[findIndex][fieldName] = fieldValue;

    setProfileForm('websites', newWebsiteValues);
  };

  const removeWebsiteInput = (e: any, id: any) => {
    e.preventDefault();

    const newWebsiteValues = [...(editProfile?.websites || [])];
    const findIndex = newWebsiteValues.findIndex((web) => web.id === id);
    newWebsiteValues.splice(findIndex, 1);

    setProfileForm('websites', newWebsiteValues);
  };

  const addWebsiteInput = (e: any) => {
    e.preventDefault();
    const newWebsiteId = websiteId + 1;
    const newWebsiteInputs = [...(editProfile?.websites || [])];

    newWebsiteInputs.push({
      id: newWebsiteId,
      url: '',
      websiteType: '' as WebsiteTypes
    });

    setWebsiteId(newWebsiteId);
    setProfileForm('websites', newWebsiteInputs);
  };

  const saveProfilePicture = async (pfpImgUrl: string) => {
    try {
      if (profile.ref) {
        await updateDoc(profile.ref, { ['profile_image_url']: pfpImgUrl });
      } else {
        // no profile.ref
        // look up?
      }
    } catch (err) {
      console.error('Error updating profile image', err);
    }
  };

  const updatePersonalDetails = async () => {
    const {
      age_ranges,
      height_ft,
      height_in,
      height_no_answer,
      gender_identity,
      ethnicities,
      union_status,
      union_other,
      agency,
      websites
    } = editProfile;

    const personalDetailsData = {
      age_ranges,
      height_ft,
      height_in,
      height_no_answer,
      gender_identity,
      ethnicities,
      union_status,
      union_other,
      agency,
      websites
    };

    try {
      if (profile.ref) {
        await updateDoc(profile.ref, { ...personalDetailsData });

        setEditMode({ ...editMode, personalDetails: false });
      } else {
        // no profile.ref
        // look up?
      }
    } catch (err) {
      console.error('Error updating profile data:', err);
    }
  };

  const updateHeadlineProfile = async () => {
    const { first_name, last_name } = editAccount;
    const { pronouns, pronouns_other, profile_tagline, bio } = editProfile;

    const headlineAccountDetails = { first_name, last_name };
    const headlineProfileDetails = {
      pronouns,
      pronouns_other,
      profile_tagline,
      bio
    };

    try {
      if (account.ref && profile.ref) {
        await updateDoc(account.ref, { ...headlineAccountDetails });
        await updateDoc(profile.ref, { ...headlineProfileDetails });

        setEditMode({ ...editMode, headline: false });
      } else {
        // no profile.ref
        // look up?
      }
    } catch (err) {
      console.error('Error updating profile data:', err);
    }
  };

  const updateMultiSection = async (
    section:
      | 'training_institutions'
      | 'upcoming_performances'
      | 'past_performances'
      | 'awards',
    editModeName: keyof EditModeSections
  ) => {
    const newData = editProfile[section];
    console.log(section);
    if (!newData) {
      console.log('This is your error');
      return;
    }
    try {
      if (profile.ref) {
        await updateDoc(profile.ref, { [section]: newData });

        setEditMode({ ...editMode, [editModeName]: false });
      } else {
        // no profile.ref
        // look up?
      }
    } catch (err) {
      console.error('Error updating profile data:', err);
    }
  };

  const updateSkills = async () => {
    if (!editProfile) {
      return;
    }

    const additionalSkillsCheckboxes =
      editProfile.additional_skills_checkboxes ?? [];
    const additionalSkillsManual = editProfile.additional_skills_manual ?? [];

    const skillsProps = {
      additional_skills_checkboxes: additionalSkillsCheckboxes,
      additional_skills_manual: additionalSkillsManual
    };

    try {
      if (profile.ref) {
        await updateDoc(profile.ref, { ...skillsProps });

        setEditMode({ ...editMode, skills: false });
      } else {
        // no profile.ref
        // look up?
      }
    } catch (err) {
      console.error('Error updating profile data:', err);
    }
  };

  const submitOffStageSkills = async (selectedRoles: any) => {
    Object.entries(selectedRoles).forEach(async ([key, value]) => {
      if (profile.ref) {
        await updateDoc(profile.ref, { [key]: value } as {
          [key: string]: string;
        });
        setEditMode({ ...editMode, offstage_roles: false });
      } else {
        // no profile.ref
        // look up?
      }
    });
  };

  const onTrainingFieldChange = <T extends keyof TrainingInstitution>(
    fieldName: T,
    fieldValue: TrainingInstitution[T],
    id: number
  ) => {
    const newTrainings = [...(editProfile?.training_institutions || [])];
    const findIndex = newTrainings.findIndex((training) => training.id === id);

    newTrainings[findIndex][fieldName] = fieldValue;
    setProfileForm('training_institutions', newTrainings);
    console.log(editProfile);
  };

  const removeTrainingBlock = (e: any, id: number) => {
    e.preventDefault();
    const newTrainings = [...(editProfile?.training_institutions || [])];
    const findIndex = newTrainings.findIndex((training) => training.id === id);
    newTrainings.splice(findIndex, 1);

    setProfileForm('training_institutions', newTrainings);
  };

  const addTrainingBlock = (e: any) => {
    e.preventDefault();

    const newTrainingId = trainingId + 1;

    setProfileForm('training_institutions', [
      ...(editProfile?.training_institutions || []),
      {
        id: newTrainingId,
        trainingYear: '',
        trainingInstitution: '',
        trainingDegree: ''
      }
    ]);
    setTrainingId(newTrainingId);
  };

  const removeUpcomingInput = (e: any, id: any) => {
    e.preventDefault();
    const newCredits = [...(editProfile?.upcoming_performances || [])];
    const findIndex = newCredits.findIndex((show) => show.id === id);
    newCredits.splice(findIndex, 1);

    setProfileForm('upcoming_performances', newCredits);
  };

  const addUpcomingInput = (e: any) => {
    e.preventDefault();

    const newShowId = upcomingId + 1;

    setProfileForm('upcoming_performances', [
      ...(editProfile?.upcoming_performances || []),

      {
        id: newShowId,
        title: '',
        group: '',
        location: '',
        startDate: '',
        endDate: '',
        url: '',
        role: '',
        director: '',
        musicalDirector: ''
      }
    ]);

    setShowUpcomingId(newShowId);
  };

  const onCreditFieldChange = <T extends keyof PastPerformances>(
    fieldName: T,
    fieldValue: PastPerformances[T],
    id: number
  ) => {
    const newCredits = [...(editProfile?.past_performances || [])];
    const findIndex = newCredits.findIndex((show) => show.id === id);
    newCredits[findIndex][fieldName] = fieldValue;

    setProfileForm('past_performances', newCredits);
  };

  const onUpcomingInputChange = <T extends keyof UpcomingPerformances>(
    fieldName: T,
    fieldValue: UpcomingPerformances[T],
    id: number
  ) => {
    const newCredits = [...(editProfile?.upcoming_performances || [])];
    const findIndex = newCredits.findIndex((show) => show.id === id);
    newCredits[findIndex][fieldName] = fieldValue;

    setProfileForm('upcoming_performances', newCredits);
  };

  const removeCreditBlock = (e: any, id: number) => {
    e.preventDefault();
    const newCredits = [...(editProfile?.past_performances || [])];
    const findIndex = newCredits.findIndex((show) => show.id === id);
    newCredits.splice(findIndex, 1);

    setProfileForm('past_performances', newCredits);
  };

  const addCreditBlock = () => {
    const newShowId = showPastId + 1;

    setProfileForm('past_performances', [
      ...(editProfile?.past_performances || []),
      {
        id: newShowId,
        title: '',
        group: '',
        location: '',
        startDate: '',
        endDate: '',
        url: '',
        role: '',
        director: '',
        musicalDirector: ''
      }
    ]);

    setShowPastId(newShowId);
  };

  const isAdditionalSkillsCheckboxes = (skillOption: SkillCheckbox) =>
    editProfile?.additional_skills_checkboxes?.indexOf(skillOption) > -1;

  const skillOptionChange = (checkValue: boolean, skill: SkillCheckbox) => {
    let newSkills = [...(editProfile?.additional_skills_checkboxes || [])];

    if (checkValue) {
      // check value
      if (newSkills.indexOf(skill) < 0) {
        newSkills.push(skill);
      }
    } else {
      // uncheck value
      newSkills = newSkills.filter((sO) => sO !== skill);
    }

    setProfileForm('additional_skills_checkboxes', newSkills);
  };

  const addTag = () => {
    const trimmedInput = input.trim();
    if (trimmedInput.length && !skillTags.includes(trimmedInput)) {
      setTags((prevState) => [...prevState, trimmedInput]);
      setInput('');
    }
  };

  const deleteTag = (index: any) => {
    setTags((prevState) => prevState.filter((tag, i) => i !== index));
  };

  const onKeyDown = (e: any) => {
    const { key } = e;
    const trimmedInput = input.trim();

    if (
      (key === ',' || key === 'Enter') &&
      trimmedInput.length &&
      !skillTags.includes(trimmedInput)
    ) {
      e.preventDefault();
      setTags((prevState) => [...prevState, trimmedInput]);
      setInput('');
    }

    if (
      key === 'Backspace' &&
      !input.length &&
      skillTags.length &&
      isKeyReleased
    ) {
      e.preventDefault();
      const tagsCopy = [...skillTags];
      const poppedTag = tagsCopy.pop() ?? '';
      setTags(tagsCopy);
      setInput(poppedTag);
    }
    setIsKeyReleased(false);
  };

  const onKeyUp = () => {
    setIsKeyReleased(true);
  };

  useEffect(() => {
    const allSkills = [...skillTags];
    setProfileForm('additional_skills_manual', allSkills);
  }, [skillTags]);

  useEffect(() => {
    const allTrainings = [...trainings];
    setProfileForm('training_institutions', allTrainings);
  }, [trainings]);

  useEffect(() => {
    const newYears = [] as number[];

    for (let i = 2024; i > 1949; i--) {
      newYears.push(i);
    }

    setYearOptions(newYears);
  }, []);

  const onAwardInputChange = <T extends keyof ProfileAwards>(
    fieldValue: ProfileAwards[T],
    fieldName: T,
    id: number
  ) => {
    const newAwardValues = [...(editProfile?.awards || [])] as ProfileAwards[];
    const findIndex = newAwardValues.findIndex((award) => award.id === id);
    newAwardValues[findIndex][fieldName] = fieldValue;

    setProfileForm('awards', newAwardValues);
  };

  const addAwardInput = (e: any) => {
    e.preventDefault();
    const newAwardId = awardId + 1;
    const newAwardInputs = [...(editProfile?.awards || [])];

    newAwardInputs.push({
      id: newAwardId,
      title: '',
      year: '',
      url: '',
      description: ''
    });

    setAwardId(newAwardId);
    setProfileForm('awards', newAwardInputs);
  };

  const removeAwardInput = (e: any, id: any) => {
    e.preventDefault();

    const newAwardValues = [...(editProfile?.awards || [])];
    const findIndex = newAwardValues.findIndex((award) => award.id === id);
    newAwardValues.splice(findIndex, 1);

    setProfileForm('awards', newAwardValues);
  };

  return (
    <PageWrapper>
      {profile?.data?.completed_profile && (
        <Row>
          <PreviewCard>
            <h2>
              <FontAwesomeIcon
                style={{ marginRight: '12px' }}
                icon={faCheckCircle}
              />{' '}
              Profile Complete!
            </h2>
            <p>
              We are working with theatre companies to get their roles posted.
              You'll start to receive matches as they become available! Check
              out the Find Roles and Messaging links below for matching. These
              features are in beta and we welcome your feedback as an early
              member!
            </p>
            <p>Thanks - The Chicago Artist Guide Team</p>
          </PreviewCard>
        </Row>
      )}
      <Row>
        <Col lg={12}>
          <Title>YOUR PROFILE</Title>
        </Col>
      </Row>
      <Row>
        <Col lg={4}>
          <ImageUploadComponent
            onSave={(pfpImgUrl: string) => saveProfilePicture(pfpImgUrl)}
            currentImageUrl={profile?.data?.profile_image_url}
            imageType="user"
            showCrop={true}
            maxSizeInMB={5}
          />
          <DetailsCard>
            <DetailsColTitle>
              <div>
                Personal Details
                <a
                  href="#"
                  onClick={(e: React.MouseEvent<HTMLElement>) =>
                    onEditModeClick(
                      e,
                      'personalDetails',
                      !editMode['personalDetails']
                    )
                  }
                >
                  <FontAwesomeIcon
                    icon={editMode['personalDetails'] ? faXmark : faPenToSquare}
                  />
                </a>
              </div>
            </DetailsColTitle>
            {editMode['personalDetails'] ? (
              <EditPersonalDetails
                {...{
                  ageRangeChange,
                  editProfile,
                  onWebsiteInputChange,
                  removeWebsiteInput,
                  addWebsiteInput,
                  updatePersonalDetails,
                  setProfileForm,
                  ethnicityChange
                }}
              />
            ) : (
              <>
                <p>
                  {profile?.data?.age_ranges?.length > 0 && (
                    <>
                      Character Age Ranges:{' '}
                      {profile?.data?.age_ranges?.join(', ')}
                      <br />
                    </>
                  )}
                  {(profile?.data?.height_no_answer ||
                    (profile?.data?.height_ft &&
                      profile?.data?.height_ft !== '0')) && (
                    <>
                      Height:{' '}
                      {profile?.data?.height_no_answer ? (
                        'N/A'
                      ) : (
                        <>
                          {profile?.data?.height_ft}'-{profile?.data?.height_in}
                          "
                        </>
                      )}
                      <br />
                    </>
                  )}
                  {profile?.data?.gender_identity &&
                    profile?.data?.gender_identity !== '' && (
                      <>
                        Gender Identity: {profile?.data?.gender_identity}
                        <br />
                      </>
                    )}
                  {profile?.data?.ethnicities?.length > 0 && (
                    <>
                      Ethnicity: {profile?.data?.ethnicities?.join(', ')}
                      <br />
                    </>
                  )}
                  {((profile?.data?.union_status &&
                    profile?.data?.union_status !== '') ||
                    (profile?.data?.union_other &&
                      profile?.data?.union_other !== '')) && (
                    <>
                      Union:{' '}
                      {profile?.data?.union_status ||
                        profile?.data?.union_other}
                      <br />
                    </>
                  )}
                  {profile?.data?.agency && profile?.data?.agency !== '' && (
                    <>Agency: {profile?.data?.agency}</>
                  )}
                </p>
                {hasNonEmptyValues(profile?.data?.websites) && (
                  <p>
                    <strong>Websites:</strong>
                    <br />
                    {profile?.data?.websites.map((w: IndividualWebsite) => (
                      <React.Fragment key={`personal-website-${w.id}`}>
                        <a href={forceHttp(w.url)} target="_blank">
                          Visit Website (<em>{w.websiteType}</em>)
                        </a>
                        <br />
                      </React.Fragment>
                    ))}
                  </p>
                )}
              </>
            )}
          </DetailsCard>
          <DetailsCard>
            <DetailsColTitle>
              <div>Menu</div>
            </DetailsColTitle>
            <div>
              <a href="/profile/search/roles">Find Roles</a>
            </div>
            <div>
              <a href="/profile/messages">Messages</a>
            </div>
          </DetailsCard>
        </Col>
        <Col lg={8}>
          <div>
            <a
              href="#"
              onClick={(e: React.MouseEvent<HTMLElement>) =>
                onEditModeClick(e, 'headline', !editMode['headline'])
              }
            >
              <FontAwesomeIcon
                icon={editMode['headline'] ? faXmark : faPenToSquare}
              />
            </a>
            {editMode['headline'] ? (
              <div>
                <CAGLabel>Edit Profile</CAGLabel>
                <InputField
                  label="First"
                  name="basicsFirstName"
                  onChange={(e: any) =>
                    setAccountForm('first_name', e.target.value)
                  }
                  required={true}
                  requiredLabel="First name"
                  value={editAccount?.first_name}
                />
                <InputField
                  label="Last"
                  name="basicsLastName"
                  onChange={(e: any) =>
                    setAccountForm('last_name', e.target.value)
                  }
                  required={true}
                  requiredLabel="Last name"
                  value={editAccount?.last_name}
                />
                <Form.Group className="form-group">
                  <Container>
                    <Row>
                      <PaddedCol lg="6">
                        <CAGLabel>Pronouns</CAGLabel>
                        <Form.Control
                          aria-label="pronouns"
                          as="select"
                          defaultValue={editProfile?.pronouns}
                          name="actorInfo1Pronouns"
                          onChange={(e: any) =>
                            setProfileForm('pronouns', e.target.value)
                          }
                        >
                          <option value={undefined}>Choose...</option>
                          {pronouns.map((noun) => (
                            <option key={`option-value-${noun}`} value={noun}>
                              {noun}
                            </option>
                          ))}
                        </Form.Control>
                      </PaddedCol>
                      <PaddedCol lg="6">
                        <CAGLabel>Other</CAGLabel>
                        <Form.Control
                          aria-label="pronouns"
                          defaultValue={editProfile?.pronouns_other}
                          disabled={false}
                          name="actorInfo1PronounsOther"
                          onChange={(e: any) =>
                            setProfileForm('pronouns_other', e.target.value)
                          }
                        />
                      </PaddedCol>
                    </Row>
                  </Container>
                </Form.Group>
                <CAGLabel>Profile Headline &amp; Personal Bio</CAGLabel>
                <Container>
                  <Row>
                    <PaddedCol lg="10">
                      <Form.Group className="form-group">
                        <CAGFormControl
                          aria-label="bio headline"
                          defaultValue={editProfile?.profile_tagline}
                          name="demographicsBioHeadline"
                          onChange={(e: any) =>
                            setProfileForm('profile_tagline', e.target.value)
                          }
                          placeholder="Profile Headline (ex: Actor, Musician, Dancer)"
                        />
                      </Form.Group>
                      <Form.Group className="form-group">
                        <Form.Control
                          as="textarea"
                          defaultValue={editProfile?.bio}
                          name="demographicsBio"
                          onChange={(e: any) =>
                            setProfileForm('bio', e.target.value)
                          }
                          rows={5}
                        />
                      </Form.Group>
                    </PaddedCol>
                  </Row>
                </Container>
                <Button
                  onClick={updateHeadlineProfile}
                  text="Save"
                  type="button"
                  variant="primary"
                />
              </div>
            ) : (
              <>
                <HeaderNamePronouns>
                  <h2>
                    {account?.data.first_name} {account?.data.last_name}
                  </h2>
                  <p>
                    {profile?.data?.pronouns || profile?.data?.pronouns_other}
                  </p>
                </HeaderNamePronouns>
                {profile?.data?.profile_tagline && (
                  <h3>{profile?.data?.profile_tagline}</h3>
                )}
                {profile?.data?.bio && <p>{profile?.data?.bio}</p>}
              </>
            )}
          </div>
          <hr />
          <div>
            {/* TRAINING SECTION */}
            {editMode['training'] ? (
              <Container>
                <TrainingEdit
                  training_institutions={editProfile?.training_institutions}
                  onTrainingFieldChange={onTrainingFieldChange}
                  removeTrainingBlock={removeTrainingBlock}
                />
                <Row>
                  <Col lg="12">
                    <div>
                      <a href="#" onClick={addTrainingBlock}>
                        + Add Another Training
                      </a>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="12">
                    <ProfileFlex>
                      <Button
                        onClick={() =>
                          updateMultiSection(
                            'training_institutions',
                            'training'
                          )
                        }
                        text="Save"
                        type="button"
                        variant="primary"
                      />
                      <Button
                        onClick={(e: React.MouseEvent<HTMLElement>) =>
                          onEditModeClick(e, 'training', !editMode['training'])
                        }
                        text="Cancel"
                        type="button"
                        variant="secondary"
                      />
                    </ProfileFlex>
                  </Col>
                </Row>
              </Container>
            ) : (
              <>
                {hasNonEmptyValues(profile?.data?.training_institutions) && (
                  <DetailSection title="Training">
                    <Training
                      training_institutions={
                        profile?.data?.training_institutions
                      }
                    />
                  </DetailSection>
                )}
                <a
                  href="#"
                  onClick={(e: React.MouseEvent<HTMLElement>) =>
                    onEditModeClick(e, 'training', !editMode['training'])
                  }
                >
                  + Add Training
                </a>
              </>
            )}
            <hr />
            {/* UPCOMING FEATURES */}

            {editMode['upcoming'] ? (
              <Container>
                <FeaturesEdit
                  features={editProfile?.upcoming_performances}
                  emptyPlaceholder={''}
                  onCreditFieldChange={onUpcomingInputChange}
                  removeCreditBlock={removeUpcomingInput}
                />
                <Row>
                  <Col lg="12">
                    <div>
                      <a href="#" onClick={addUpcomingInput}>
                        + Add Upcoming Feature
                      </a>
                    </div>
                  </Col>
                </Row>
                <Row>
                  <Col lg="12">
                    <ProfileFlex>
                      <Button
                        onClick={() =>
                          updateMultiSection(
                            'upcoming_performances',
                            'upcoming'
                          )
                        }
                        text="Save"
                        type="button"
                        variant="primary"
                      />
                      <Button
                        onClick={(e: React.MouseEvent<HTMLElement>) =>
                          onEditModeClick(e, 'upcoming', !editMode['upcoming'])
                        }
                        text="Cancel"
                        type="button"
                        variant="secondary"
                      />
                    </ProfileFlex>
                  </Col>
                </Row>
              </Container>
            ) : (
              <>
                {hasNonEmptyValues(profile?.data?.upcoming_performances) && (
                  <DetailSection title="Upcoming Features">
                    <Features
                      features={profile.data.upcoming_performances}
                      emptyPlaceholder=""
                    />
                  </DetailSection>
                )}
                <a
                  href="#"
                  onClick={(e: React.MouseEvent<HTMLElement>) =>
                    onEditModeClick(e, 'upcoming', !editMode['upcoming'])
                  }
                >
                  + Add Upcoming Features
                </a>
              </>
            )}
            <hr />
            {editMode['past'] ? (
              <Container>
                <FeaturesEdit
                  features={editProfile?.past_performances}
                  emptyPlaceholder={''}
                  onCreditFieldChange={onCreditFieldChange}
                  removeCreditBlock={removeCreditBlock}
                />
                <Row>
                  <Col lg="12">
                    <a
                      href="#"
                      onClick={(e: any) => {
                        e.preventDefault();
                        addCreditBlock();
                      }}
                    >
                      + Save and add another previous production
                    </a>
                  </Col>
                </Row>
                <Row>
                  <Col lg="12">
                    <ProfileFlex>
                      <Button
                        onClick={() =>
                          updateMultiSection('past_performances', 'past')
                        }
                        text="Save"
                        type="button"
                        variant="primary"
                      />
                      <Button
                        onClick={(e: React.MouseEvent<HTMLElement>) =>
                          onEditModeClick(e, 'past', !editMode['past'])
                        }
                        text="Cancel"
                        type="button"
                        variant="secondary"
                      />
                    </ProfileFlex>
                  </Col>
                </Row>
              </Container>
            ) : (
              <>
                {hasNonEmptyValues(profile?.data?.past_performances) && (
                  <DetailSection title="Previous Productions">
                    <Features
                      features={profile.data.past_performances}
                      emptyPlaceholder=""
                    />
                  </DetailSection>
                )}
                <a
                  href="#"
                  onClick={(e: React.MouseEvent<HTMLElement>) =>
                    onEditModeClick(e, 'past', !editMode['past'])
                  }
                >
                  + Add Previous Productions
                </a>
              </>
            )}
            <hr />
            {editMode['skills'] ? (
              <Container>
                <Row>
                  <Col>
                    <CAGFormGroup>
                      <BoldP>I am interested in roles that require:</BoldP>
                      {skillCheckboxes.map((skill) => (
                        <CAGCheckbox
                          checked={isAdditionalSkillsCheckboxes(skill)}
                          fieldType="checkbox"
                          key={`skill-chk-${skill}`}
                          label={skill}
                          name="additionalSkillsCheckboxes"
                          onChange={(e: any) =>
                            skillOptionChange(e.currentTarget.checked, skill)
                          }
                        />
                      ))}
                    </CAGFormGroup>
                    <CAGFormGroup>
                      <BoldP>Additional Skills</BoldP>
                      <CAGInput>
                        <input
                          name="additionalSkillsManual"
                          onChange={(e: any) => {
                            const { value } = e.target;
                            setInput(value);
                          }}
                          onKeyDown={onKeyDown}
                          onKeyUp={onKeyUp}
                          placeholder="Type to add a skill..."
                          value={input}
                        />
                        <button onClick={addTag}>+</button>
                      </CAGInput>
                      <CAGContainer>
                        {skillTags.map((tag, index) => (
                          <CAGTag key={`${tag}-${index}`}>
                            <div className="tag">
                              {tag}
                              <button onClick={() => deleteTag(index)}>
                                x
                              </button>
                            </div>
                          </CAGTag>
                        ))}
                      </CAGContainer>
                    </CAGFormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col lg="12">
                    <ProfileFlex>
                      <Button
                        onClick={updateSkills}
                        text="Save"
                        type="button"
                        variant="primary"
                      />
                      <Button
                        onClick={(e: React.MouseEvent<HTMLElement>) =>
                          onEditModeClick(e, 'skills', !editMode['skills'])
                        }
                        text="Cancel"
                        type="button"
                        variant="secondary"
                      />
                    </ProfileFlex>
                  </Col>
                </Row>
              </Container>
            ) : (
              <>
                {(profile?.data?.additional_skills_checkboxes?.length > 0 ||
                  profile?.data?.additional_skills_manual?.length > 0) && (
                  <DetailSection title="Special Skills">
                    <SpecialSkills
                      checkboxes={profile?.data?.additional_skills_checkboxes}
                      manual={profile?.data?.additional_skills_manual}
                    />
                  </DetailSection>
                )}
                <a
                  href="#"
                  onClick={(e: React.MouseEvent<HTMLElement>) =>
                    onEditModeClick(e, 'skills', !editMode['skills'])
                  }
                >
                  + Add Skills
                </a>
              </>
            )}
            <hr />
            {editMode['offstage_roles'] ? (
              <>
                <OffStageSkillsEdit
                  offstage_roles_general={profile?.data?.offstage_roles_general}
                  offstage_roles_production={
                    profile?.data?.offstage_roles_production
                  }
                  offstage_roles_scenic_and_properties={
                    profile?.data?.offstage_roles_scenic_and_properties
                  }
                  offstage_roles_lighting={
                    profile?.data?.offstage_roles_lighting
                  }
                  offstage_roles_sound={profile?.data?.offstage_roles_sound}
                  offstage_roles_hair_makeup_costumes={
                    profile?.data?.offstage_roles_hair_makeup_costumes
                  }
                  submitOffStageSkills={submitOffStageSkills}
                />
              </>
            ) : (
              <>
                {(profile?.data?.offstage_roles_general?.length > 0 ||
                  profile?.data?.offstage_roles_production?.length > 0 ||
                  profile?.data?.offstage_roles_scenic_and_properties?.length >
                    0 ||
                  profile?.data?.offstage_roles_lighting?.length > 0 ||
                  profile?.data?.offstage_roles_sound?.length > 0 ||
                  profile?.data?.offstage_roles_hair_makeup_costumes?.length >
                    0) && (
                  <DetailSection title="Off Stage Roles">
                    <OffStageSkills
                      offstage_roles_general={
                        profile?.data?.offstage_roles_general
                      }
                      offstage_roles_production={
                        profile?.data?.offstage_roles_production
                      }
                      offstage_roles_scenic_and_properties={
                        profile?.data?.offstage_roles_scenic_and_properties
                      }
                      offstage_roles_lighting={
                        profile?.data?.offstage_roles_lighting
                      }
                      offstage_roles_sound={profile?.data?.offstage_roles_sound}
                      offstage_roles_hair_makeup_costumes={
                        profile?.data?.offstage_roles_hair_makeup_costumes
                      }
                    />
                  </DetailSection>
                )}
                <a
                  href="#"
                  onClick={(e: React.MouseEvent<HTMLElement>) =>
                    onEditModeClick(
                      e,
                      'offstage_roles',
                      !editMode['offstage_roles']
                    )
                  }
                >
                  + Add Off Stage Roles
                </a>
              </>
            )}
            <hr />
            {/* AWARD SECTION */}
            {editMode['awards'] ? (
              <Container>
                {editProfile?.awards?.map((awardRow: any) => (
                  <AwardRow key={`award-row-${awardRow.id}`}>
                    <Col>
                      <CAGFormControl
                        as="input"
                        name="title"
                        onChange={(e: any) =>
                          onAwardInputChange(
                            e.target.value || '',
                            'title',
                            awardRow.id
                          )
                        }
                        placeholder="Award or Recognition"
                        value={awardRow.title}
                      />
                      <CAGFormControl
                        as="select"
                        name="year"
                        onChange={(e: any) =>
                          onAwardInputChange(
                            e.target.value || '',
                            'year',
                            awardRow.id
                          )
                        }
                        value={awardRow.year}
                      >
                        <option disabled selected value="">
                          Year Received
                        </option>
                        {yearOptions.map((year) => {
                          return <option value={year}>{year}</option>;
                        })}
                      </CAGFormControl>
                      {editProfile?.awards?.length > 1 && (
                        <CAGButton>
                          <a
                            href="#"
                            className="delete"
                            onClick={(e: any) =>
                              removeAwardInput(e, awardRow.id)
                            }
                          >
                            X Delete Recognition
                          </a>
                        </CAGButton>
                      )}
                    </Col>
                  </AwardRow>
                ))}
                <Row>
                  <Col lg="10">
                    <CAGButton>
                      <a href="#" onClick={addAwardInput}>
                        + Add another award or recognition
                      </a>
                    </CAGButton>
                  </Col>
                </Row>
                <Row>
                  <Col lg="12">
                    <ProfileFlex>
                      <Button
                        onClick={() => updateMultiSection('awards', 'awards')}
                        text="Save"
                        type="button"
                        variant="primary"
                      />
                      <Button
                        onClick={(e: React.MouseEvent<HTMLElement>) =>
                          onEditModeClick(e, 'awards', !editMode['awards'])
                        }
                        text="Cancel"
                        type="button"
                        variant="secondary"
                      />
                    </ProfileFlex>
                  </Col>
                </Row>
              </Container>
            ) : (
              <>
                {hasNonEmptyValues(profile?.data?.awards) && (
                  <DetailSection title="Awards & Recognition">
                    <Awards
                      awards={profile?.data?.awards}
                      editMode={editMode.awards}
                    />
                  </DetailSection>
                )}
                <a
                  href="#"
                  onClick={(e: React.MouseEvent<HTMLElement>) =>
                    onEditModeClick(e, 'awards', !editMode['awards'])
                  }
                >
                  + Add Awards &amp; Recognition
                </a>
              </>
            )}
          </div>
        </Col>
      </Row>
    </PageWrapper>
  );
};

const Title = styled.h1`
  font-family: ${fonts.montserrat};
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 76px;
`;

const ProfileImage = styled(Image)`
  display: block;
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  background: ${colors.lightGrey};
  minheight: 250px;
  width: 100%;
`;

const PlaceholderImage = styled.div`
  background: ${colors.lightGrey};
  color: white;
  display: flex;
  font-size: 68px;
  height: 300px;
  width: 100%;
  background-repeat: no-repeat;
  background-size: cover;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
`;

const DetailsCard = styled.div`
  margin-top: 47px;
  background: ${colors.white};
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  padding: 25px 21px;
`;

const DetailsColTitle = styled.h2`
  font-family: ${fonts.montserrat};
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;

  > div {
    display: flex;

    a {
      margin-left: auto;
    }
  }

  &::after {
    content: '';
    display: block;
    height: 8px;
    background: linear-gradient(
      90deg,
      ${colors.yellow} 0%,
      ${colors.mint} 100%
    );
    border-radius: 4px;
  }
`;

const HeaderNamePronouns = styled.div`
  display: flex;
  align-items: flex-end;

  p {
    margin-left: 1.15rem;
  }
`;

const ProfileFlex = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 24px 0;
`;

const CAGLabel = styled(Form.Label)`
  color: ${colors.mainFont};
  font-family: ${fonts.mainFont};
  font-size: 20px;
`;

const PaddedCol = styled(Col)`
  padding-left: 0;
`;

const CAGFormControl = styled(Form.Control)`
  margin-bottom: 1em;
  border: 1px solid ${colors.lightGrey};
  border-radius: 7px;
  font-family: ${fonts.mainFont};
  padding: 5px;
  padding-left: 10px;
  width: 100%;
`;

const CAGInput = styled.div`
  position: relative;

  input {
    border: 1px solid ${colors.lightGrey};
    border-radius: 7px;
    font-family: ${fonts.mainFont};
    padding: 10px;
    padding-left: 10px;
    width: 60%;
  }

  button {
    position: absolute;
    right: 40%;
    top: -10px;
    border: none;
    background-color: unset;
    font-size: 40px;
    cursor: pointer;
    color: ${colors.mint};
  }
`;

const CAGContainer = styled.div`
  color: ${colors.gray};
  display: flex;
  max-width: 60%;
  overflow: scroll;
  padding-left: none;
  width: 600%;
`;

const CAGTag = styled.div`
  .tag {
    align-items: center;
    margin: 20px 0;
    margin-right: 10px;
    font-family: ${fonts.mainFont};
    padding-left: 15px;
    padding-right: 10px;
    padding-top: 0px;
    padding-bottom: 0px;
    border: 1.5px solid ${colors.mint};
    border-radius: 20px;
    background-color: white;
    white-space: nowrap;
    color: ${colors.mainFont};
  }

  .tag button {
    display: inline;
    padding: 4px;
    border: none;
    background-color: unset;
    cursor: pointer;
    color: ${colors.lightGrey};
  }
`;

const BoldP = styled.p`
  font-weight: bold;
  color: ${colors.secondaryFontColor};
`;

const CAGCheckbox = styled(Checkbox)`
  color: ${colors.secondaryFontColor};
`;

const CAGFormGroup = styled(Form.Group)`
  margin-bottom: 2em;

  &:last-child {
    margin-bottom: 0;
  }
`;

const AwardRow = styled(Row)`
  padding-top: 2em;
  padding-bottom: 2em;

  &:not(:first-child) {
    border-top: 1px solid ${colors.lightGrey};
  }
`;

const CAGButton = styled.div`
  a {
    display: block;
    margin: 1em 0;

    &.delete {
      color: ${colors.salmon};
    }
  }
`;

export default IndividualProfile;
