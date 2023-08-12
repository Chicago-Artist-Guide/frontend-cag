import {
  DocumentData,
  DocumentSnapshot,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import React, { useEffect, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import DatePicker from 'react-datepicker';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import {
  faCheckCircle,
  faImage,
  faPenToSquare,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useFirebaseContext } from '../../../context/FirebaseContext';
import { useProfileContext } from '../../../context/ProfileContext';
import { Button, Checkbox, InputField } from '../../../genericComponents';
import PageContainer from '../../layout/PageContainer';
import { fonts, colors } from '../../../theme/styleVars';
import DetailSection from '../shared/DetailSection';
import {
  AgeRange,
  PastPerformances,
  ProfileAwards,
  pronouns,
  UpcomingPerformances,
  IndividualAccountInit,
  IndividualProfileInit,
  IndividualProfile as IndividualProfileT,
  IndividualProfile2,
  IndividualWebsite,
  WebsiteTypes,
  TrainingInstitution,
  skillCheckboxes,
  SkillCheckbox
} from '../../SignUp/Individual/types';
import type { EditModeSections } from './types';
import { hasNonEmptyValues } from '../../../utils/hasNonEmptyValues';
import AwardCard from './AwardCard';
import IndividualUpcomingShow from './IndividualUpcomingShow';
import IndividualCredits from './IndividualCredits';
import { PreviewCard } from '../shared/styles';
import EditPersonalDetails from './EditPersonalDetails';

type PerformanceState = {
  [key: number]: string | number | null | boolean;
};

const IndividualProfile: React.FC<{
  previewMode?: boolean;
}> = ({ previewMode = false }) => {
  const history = useHistory();
  const { firebaseStorage } = useFirebaseContext();
  const { account, profile, setAccountData, setProfileData } =
    useProfileContext();
  const [showSignUp2Link, setShowUp2Link] = useState(false);
  const [editMode, setEditMode] = useState<EditModeSections>({
    personalDetails: false,
    headline: false,
    training: false,
    upcoming: false,
    past: false,
    skills: false,
    awards: false
  });
  const [editProfile, setEditProfile] = useState(profile?.data);
  const [editAccount, setEditAccount] = useState(account?.data);

  // websites
  const [websiteId, setWebsiteId] = useState(1);

  // upcoming and past shows
  const [showId, setShowId] = useState(1);
  const [showPastId, setShowPastId] = useState(1);
  const [file, setFile] = useState<any>({ 1: '' });
  const [percent, setPercent] = useState<PerformanceState>({ 1: 0 });
  const [imgUrl, setImgUrl] = useState<{ [key: number]: string | null }>({
    1: null
  });
  const [uploadInProgress, setUploadInProgress] = useState<PerformanceState>({
    1: false
  });

  // skills
  const [input, setInput] = useState('');
  const [skillTags, setTags] = useState([
    ...(editProfile?.additional_skills_manual || [])
  ] as string[]);
  const [isKeyReleased, setIsKeyReleased] = useState(false);

  // awards
  const [awardId, setAwardId] = useState(1);
  const [yearOptions, setYearOptions] = useState([] as number[]);

  const PageWrapper = previewMode ? Container : PageContainer;

  const hideShowUpLink = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setShowUp2Link(false);
  };

  const updatePerformanceState = () => {
    if (!profile?.data?.upcoming_performances) {
      return;
    }

    let maxId = 1;
    const uPFiles: any = {};
    const uPPercents: PerformanceState = {};
    const uPImgUrls: { [key: number]: string | null } = {};
    const uPUploads: PerformanceState = {};

    for (const performance of profile.data.upcoming_performances) {
      const id = performance.id;

      if (id > maxId) {
        maxId = id;
      }

      uPFiles[id] = '';
      uPPercents[id] = 0;
      uPImgUrls[id] = performance.imageUrl || null;
      uPUploads[id] = false;
    }

    setShowId(maxId);
    setFile(uPFiles);
    setPercent(uPPercents);
    setImgUrl(uPImgUrls);
    setUploadInProgress(uPUploads);
  };

  const updatePastPerformanceState = () => {
    if (!profile?.data?.past_performances) {
      return;
    }

    const maxId = profile.data.upcoming_performances.length || 1;
    setShowPastId(maxId);
  };

  useEffect(() => {
    if (editMode.personalDetails || editMode.headline || editMode.upcoming) {
      return;
    }

    setWebsiteId(profile?.data?.websites?.length || 1);
    setShowUp2Link(previewMode || !profile?.data?.completed_profile_2);
    setEditProfile(profile?.data);
    updatePerformanceState();
    updatePastPerformanceState();
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
  }, [profile.ref, setProfileData]);

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
  }, [account.ref, setAccountData]);

  const onEditModeClick = (
    e: React.MouseEvent<HTMLElement>,
    editModeSection: keyof EditModeSections,
    editModeVal?: boolean
  ) => {
    e.preventDefault();

    setEditMode({
      ...editMode,
      [editModeSection]: editModeVal ?? true
    });
  };

  const setProfileForm = (field: string, value: any) => {
    setEditProfile(
      (
        prevState: IndividualProfileInit &
          IndividualProfileT &
          IndividualProfile2
      ) => ({ ...prevState, [field]: value })
    );
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

        setEditMode({
          ...editMode,
          personalDetails: false
        });
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

    const headlineAccountDetails = {
      first_name,
      last_name
    };
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

        setEditMode({
          ...editMode,
          headline: false
        });
      } else {
        // no profile.ref
        // look up?
      }
    } catch (err) {
      console.error('Error updating profile data:', err);
    }
  };

  const updateMultiSection = async (
    section: 'upcoming_performances' | 'past_performances' | 'awards',
    editModeName: keyof EditModeSections
  ) => {
    const newData = editProfile[section];

    if (!newData) {
      return;
    }

    try {
      if (profile.ref) {
        await updateDoc(profile.ref, { [section]: newData });

        setEditMode({
          ...editMode,
          [editModeName]: false
        });
      } else {
        // no profile.ref
        // look up?
      }
    } catch (err) {
      console.error('Error updating profile data:', err);
    }
  };

  const updateSkills = async () => {
    const { additional_skills_checkboxes, additional_skills_manual } =
      editProfile;
    const skillsProps = {
      additional_skills_checkboxes,
      additional_skills_manual
    };

    try {
      if (profile.ref) {
        await updateDoc(profile.ref, { ...skillsProps });

        setEditMode({
          ...editMode,
          skills: false
        });
      } else {
        // no profile.ref
        // look up?
      }
    } catch (err) {
      console.error('Error updating profile data:', err);
    }
  };

  const onFileChange = (e: any, id: number) => {
    const imgFile = e.target.files[0];

    if (imgFile) {
      const currFiles = { ...file };
      setFile({ ...currFiles, [id]: imgFile });
    }
  };

  const uploadFile = (id: number) => {
    if (!file[id]) {
      return;
    }

    // get file
    const currFile = file[id];

    // start upload
    const currUploadProg = { ...uploadInProgress };
    setUploadInProgress({ ...currUploadProg, [id]: true });

    const storageRef = ref(
      firebaseStorage,
      `/files-${editProfile?.uid}/${editProfile?.account_id}-${currFile.name}`
    );
    const uploadTask = uploadBytesResumable(storageRef, currFile);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const currPercent = Math.round(
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        );

        // update progress
        const currProgress = { ...percent };
        setPercent({ ...currProgress, [id]: currPercent });
      },
      (err) => {
        console.log('Error uploading image', err);
        setUploadInProgress({ ...currUploadProg, [id]: false });
      },
      () => {
        setUploadInProgress({ ...currUploadProg, [id]: false });

        // download url
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          console.log('Uploaded image url:', url);
          const currImgUrl = { ...imgUrl };
          setImgUrl({ ...currImgUrl, [id]: url });
        });
      }
    );
  };

  const onUpcomingInputChange = <T extends keyof UpcomingPerformances>(
    fieldValue: UpcomingPerformances[T],
    fieldName: T,
    id: any
  ) => {
    // indexing to assign each upcoming show value a number
    const newUpcomingShowValues = [
      ...(editProfile?.upcoming_performances || [])
    ];
    const findIndex = newUpcomingShowValues.findIndex((show) => show.id === id);
    newUpcomingShowValues[findIndex][fieldName] = fieldValue;

    setProfileForm('upcoming_performances', newUpcomingShowValues);
  };

  const removeUpcomingInput = (e: any, id: any) => {
    e.preventDefault();
    const newUpcomingShowValues = [
      ...(editProfile?.upcoming_performances || [])
    ];
    const findIndex = newUpcomingShowValues.findIndex((show) => show.id === id);
    newUpcomingShowValues.splice(findIndex, 1);

    setProfileForm('upcoming_performances', newUpcomingShowValues);

    const newFile = { ...file };
    const newPercent = { ...percent };
    const newImgUrl = { ...imgUrl };
    const newUploadInProgress = { ...uploadInProgress };

    delete newFile[id];
    delete (newPercent as any)[id];
    delete newImgUrl[id];
    delete (newUploadInProgress as any)[id];

    setFile(newFile);
    setPercent(newPercent);
    setImgUrl(newImgUrl);
    setUploadInProgress(newUploadInProgress);
  };

  const addUpcomingInput = (e: any) => {
    e.preventDefault();
    const newUpcomingShowValues = [
      ...(editProfile?.upcoming_performances || [])
    ];
    const newShowId = showId + 1;

    newUpcomingShowValues.push({
      id: newShowId,
      title: '',
      synopsis: '',
      industryCode: '',
      url: '',
      imageUrl: ''
    });

    setShowId(newShowId);
    setProfileForm('upcoming_performances', newUpcomingShowValues);

    const newFile = { ...file, [newShowId]: '' };
    const newPercent = { ...percent, [newShowId]: 0 };
    const newImgUrl = { ...imgUrl, [newShowId]: null };
    const newUploadInProgress = { ...uploadInProgress, [newShowId]: false };

    setFile(newFile);
    setPercent(newPercent);
    setImgUrl(newImgUrl);
    setUploadInProgress(newUploadInProgress);
  };

  useEffect(() => {
    editProfile?.upcoming_performances.forEach((upcomingShow: any) => {
      const showId = upcomingShow.id;
      const showImgUrl = imgUrl[showId] ?? false;

      if (showImgUrl) {
        onUpcomingInputChange(showImgUrl, 'imageUrl', showId);
      }
    });
  }, [imgUrl]);

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
    const newYears = [] as number[];

    for (let i = 2023; i > 1949; i--) {
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
      {showSignUp2Link && (
        <Row>
          <PreviewCard>
            <h2>Your Profile is looking great!</h2>
            <p>
              We can walk you through the remaining steps or you can take it
              from here
            </p>
            <div>
              <Button
                onClick={() => history.push('/sign-up-2')}
                text="Keep Going"
                type="button"
                variant="secondary"
              />
              <a href="#" onClick={hideShowUpLink}>
                remind me later
              </a>
            </div>
          </PreviewCard>
        </Row>
      )}
      {profile?.data?.completed_profile_2 && (
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
              Our platform is scheduled to go live this summer, so please watch
              for any email announcements coming from us in the next few months.
              We've got big things coming soon!
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
          <ProfileImage src={profile?.data?.profile_image_url} fluid />
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
                  {profile?.data?.age_ranges?.length && (
                    <>
                      Age Range: {profile?.data?.age_ranges?.join(', ')}
                      <br />
                    </>
                  )}
                  {(profile?.data?.height_no_answer ||
                    (profile?.data?.height_ft &&
                      profile?.data?.height_ft !== '')) && (
                    <>
                      Height:{' '}
                      {profile?.data?.height_no_answer ? (
                        'N/A'
                      ) : (
                        <>
                          {profile?.data?.height_ft}’-{profile?.data?.height_in}
                          ”
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
                  {profile?.data?.ethnicities.length && (
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
                        <a href={w.url} target="_blank">
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
          <div>
            {editMode['training'] ? (
              <>
                <p>Coming soon</p>
              </>
            ) : (
              <>
                {hasNonEmptyValues(profile?.data?.training_institutions) ? (
                  <DetailSection title="Training">
                    {profile?.data?.training_institutions.map(
                      (training: TrainingInstitution) => (
                        <p>
                          <strong>{training.trainingInstitution}</strong>
                          <br />
                          {training.trainingCity}, {training.trainingState}
                          <br />
                          <em>{training.trainingDegree}</em>
                          <br />
                          <span>{training.trainingDetails}</span>
                        </p>
                      )
                    )}
                  </DetailSection>
                ) : profile?.data?.training_institution &&
                  profile?.data?.training_institution !== '' ? (
                  <DetailSection title="Training">
                    {/* need to support the old single training value profiles - will only update once they edit */}
                    <p>
                      <strong>{profile?.data.training_institution}</strong>
                      <br />
                      {profile?.data.training_city},{' '}
                      {profile?.data.training_state}
                      <br />
                      <em>{profile?.data.training_degree}</em>
                      <br />
                      <span>{profile?.data.training_details}</span>
                    </p>
                  </DetailSection>
                ) : (
                  <></>
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
            {editMode['upcoming'] ? (
              <Container>
                {editProfile?.upcoming_performances?.map(
                  (upcomingRow: any, i: any) => (
                    <PerfRow key={`upcoming-show-row-${upcomingRow.id}`}>
                      <Col lg="4">
                        <Form.Group className="form-group">
                          <PhotoContainer
                            style={{
                              backgroundImage:
                                imgUrl[upcomingRow.id] !== null
                                  ? `url(${imgUrl[upcomingRow.id]})`
                                  : undefined
                            }}
                          >
                            {imgUrl[upcomingRow.id] === null && (
                              <FontAwesomeIcon
                                className="bod-icon"
                                icon={faImage}
                                size="lg"
                              />
                            )}
                          </PhotoContainer>
                          <Form.Group className="form-group">
                            <Form.Label>File size limit: 5MB</Form.Label>
                            <Form.Control
                              accept="image/*"
                              onChange={(e: any) =>
                                onFileChange(e, upcomingRow.id)
                              }
                              style={{
                                padding: 0,
                                border: 'none'
                              }}
                              type="file"
                            />
                          </Form.Group>
                          <div>
                            <Button
                              disabled={
                                (uploadInProgress as any)[upcomingRow.id] ||
                                file[upcomingRow.id] === ''
                              }
                              onClick={() => uploadFile(upcomingRow.id)}
                              text="Upload File"
                              type="button"
                              variant="secondary"
                            />
                          </div>
                          {(uploadInProgress as any)[upcomingRow.id] && (
                            <p>
                              Upload progress:{' '}
                              {(percent as any)[upcomingRow.id]}%
                            </p>
                          )}
                          {editProfile?.upcoming_performances?.length > 1 && (
                            <DeleteLinkDiv>
                              <a
                                href="#"
                                onClick={(e: any) =>
                                  removeUpcomingInput(e, upcomingRow.id)
                                }
                              >
                                X Delete Show
                              </a>
                            </DeleteLinkDiv>
                          )}
                        </Form.Group>
                      </Col>
                      <Col lg="8">
                        <InputField
                          label="Show Title"
                          name="title"
                          onChange={(e: any) =>
                            onUpcomingInputChange(
                              e.target.value || '',
                              'title',
                              upcomingRow.id
                            )
                          }
                          value={upcomingRow.title}
                        />
                        <SynopsisTextarea controlId="show-synopsis">
                          <Form.Control
                            as="textarea"
                            name="synopsis"
                            onChange={(e: any) =>
                              onUpcomingInputChange(
                                e.target.value || '',
                                'synopsis',
                                upcomingRow.id
                              )
                            }
                            placeholder="Show Synopsis"
                            value={upcomingRow.synopsis}
                          />
                        </SynopsisTextarea>
                        <InputField
                          label="Industry Code"
                          name="industryCode"
                          onChange={(e: any) =>
                            onUpcomingInputChange(
                              e.target.value || '',
                              'industryCode',
                              upcomingRow.id
                            )
                          }
                          value={upcomingRow.industryCode}
                        />
                        <WebsiteUrlField>
                          <InputField
                            label="Link to Website/Tickets"
                            name="url"
                            onChange={(e: any) =>
                              onUpcomingInputChange(
                                e.target.value || '',
                                'url',
                                upcomingRow.id
                              )
                            }
                            placeholder="http://"
                            value={upcomingRow.url}
                          />
                        </WebsiteUrlField>
                      </Col>
                    </PerfRow>
                  )
                )}
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
                    {profile?.data?.upcoming_performances.map(
                      (perf: UpcomingPerformances) => (
                        <IndividualUpcomingShow
                          key={`upcoming-shows-${perf.id}-${perf.industryCode}`}
                          show={perf}
                        />
                      )
                    )}
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
                {editProfile?.past_performances?.map(
                  (credit: any, i: number) => (
                    <PerfRow key={`credit-${credit.id}`}>
                      <Col lg="4">
                        <Form>
                          <InputField
                            name="title"
                            onChange={(e: any) =>
                              onCreditFieldChange(
                                'title',
                                e.target.value,
                                credit.id
                              )
                            }
                            placeholder="Show Title"
                            value={credit.title}
                          />
                          <InputField
                            name="group"
                            onChange={(e: any) =>
                              onCreditFieldChange(
                                'location',
                                e.target.value,
                                credit.id
                              )
                            }
                            placeholder="Theatre or Location"
                            value={credit.location}
                          />
                          <InputField
                            name="url"
                            onChange={(e: any) =>
                              onCreditFieldChange(
                                'url',
                                e.target.value,
                                credit.id
                              )
                            }
                            placeholder="Web Link"
                            value={credit.url}
                          />
                          <InputField
                            name="role"
                            onChange={(e: any) =>
                              onCreditFieldChange(
                                'role',
                                e.target.value,
                                credit.id
                              )
                            }
                            placeholder="Role/Position"
                            value={credit.role}
                          />
                          <InputField
                            name="director"
                            onChange={(e: any) =>
                              onCreditFieldChange(
                                'director',
                                e.target.value,
                                credit.id
                              )
                            }
                            placeholder="Director"
                            value={credit.director}
                          />
                          <InputField
                            name="musicalDirector"
                            onChange={(e: any) =>
                              onCreditFieldChange(
                                'musicalDirector',
                                e.target.value,
                                credit.id
                              )
                            }
                            placeholder="Musical Director"
                            value={credit.musicalDirector}
                          />
                        </Form>
                        {i ? (
                          <DeleteRowLink
                            href="#"
                            onClick={(e: any) =>
                              removeCreditBlock(e, credit.id)
                            }
                          >
                            X Delete
                          </DeleteRowLink>
                        ) : null}
                      </Col>
                      <Col lg="4">
                        <InputField
                          name="group"
                          onChange={(e: any) =>
                            onCreditFieldChange(
                              'group',
                              e.target.value,
                              credit.id
                            )
                          }
                          placeholder="Theatre Group"
                          value={credit.group}
                        />
                        <DateRowTitle>Running Dates</DateRowTitle>
                        <DateRow>
                          <DatePicker
                            name="startDate"
                            onChange={(date: any) => {
                              const dateString = new Date(
                                date
                              ).toLocaleDateString();
                              onCreditFieldChange(
                                'startDate',
                                dateString,
                                credit.id
                              );
                            }}
                            value={credit.startDate}
                          />
                          <h6>through</h6>
                          <DatePicker
                            name="endDate"
                            onChange={(date: any) => {
                              const dateString = new Date(
                                date
                              ).toLocaleDateString();
                              onCreditFieldChange(
                                'endDate',
                                dateString,
                                credit.id
                              );
                            }}
                            value={credit.endDate}
                          />
                        </DateRow>
                      </Col>
                    </PerfRow>
                  )
                )}
                <Row>
                  <Col lg="12">
                    <a
                      href="#"
                      onClick={(e: any) => {
                        e.preventDefault();
                        addCreditBlock();
                      }}
                    >
                      + Save and add another past performance
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
                  <DetailSection title="Past Performances">
                    {profile?.data?.past_performances.map(
                      (perf: PastPerformances) => (
                        <IndividualCredits
                          key={`credits-shows-${perf.id}`}
                          show={perf}
                        />
                      )
                    )}
                  </DetailSection>
                )}
                <a
                  href="#"
                  onClick={(e: React.MouseEvent<HTMLElement>) =>
                    onEditModeClick(e, 'past', !editMode['past'])
                  }
                >
                  + Add Past Performances
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
                {(profile?.data?.additional_skills_checkboxes?.length ||
                  profile?.data?.additional_skills_manual?.length) && (
                  <DetailSection title="Special Skills">
                    <ProfileFlex>
                      {profile?.data?.additional_skills_checkboxes?.length &&
                        profile?.data?.additional_skills_checkboxes.map(
                          (skill: string) => (
                            <Badge
                              pill
                              bg="primary"
                              key={`skills-primary-${skill}`}
                              text="white"
                            >
                              {skill}
                            </Badge>
                          )
                        )}
                      {profile?.data?.additional_skills_manual?.length &&
                        profile?.data?.additional_skills_manual.map(
                          (skill: string) => (
                            <Badge
                              pill
                              bg="secondary"
                              key={`skills-manual-${skill}`}
                              text="white"
                            >
                              {skill}
                            </Badge>
                          )
                        )}
                    </ProfileFlex>
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
            {editMode['awards'] ? (
              <Container>
                {editProfile?.awards?.map((awardRow: any, i: any) => (
                  <AwardRow key={`award-row-${awardRow.id}`}>
                    <Col lg="4">
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
                      <CAGFormControl
                        as="input"
                        name="url"
                        onChange={(e: any) =>
                          onAwardInputChange(
                            e.target.value || '',
                            'url',
                            awardRow.id
                          )
                        }
                        placeholder="Web Link"
                        value={awardRow.url}
                      />
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
                    <Col lg="6">
                      <CAGFormControl
                        as="textarea"
                        name="description"
                        onChange={(e: any) =>
                          onAwardInputChange(
                            e.target.value || '',
                            'description',
                            awardRow.id
                          )
                        }
                        placeholder="Description/Notes"
                        rows={6}
                        value={awardRow.description}
                      />
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
                    <ProfileFlex>
                      {profile?.data?.awards.map((award: ProfileAwards) => (
                        <AwardCard
                          award={award}
                          key={`award-${award?.title}`}
                        />
                      ))}
                    </ProfileFlex>
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
      ${colors.darkGreen} 100%
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

const PerfRow = styled(Row)`
  padding-top: 2em;
  padding-bottom: 2em;

  &:not(:first-child) {
    border-top: 1px solid ${colors.lightGrey};
  }
`;

const PhotoContainer = styled.div`
  align-items: center;
  background: ${colors.lightGrey};
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  color: white;
  display: flex;
  font-size: 68px;
  height: 300px;
  justify-content: center;
  width: 100%;
`;

const SynopsisTextarea = styled(Form.Group)`
  margin-top: 12px;
`;

const WebsiteUrlField = styled.div`
  margin-top: 12px;
`;

const DeleteLinkDiv = styled.div`
  padding: 1em 0;

  a,
  a:hover {
    color: ${colors.salmon};
  }
`;

const DeleteRowLink = styled.a`
  color: ${colors.salmon};
  display: block;
  margin-top: 1em;

  &:hover {
    color: ${colors.salmon};
  }
`;

const DateRowTitle = styled.h5`
  margin-top: 20px;
  padding-bottom: 8px;
`;

const DateRow = styled.div`
  display: flex;
  gap: 1em;
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
    color: ${colors.darkGreen};
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
    border: 1.5px solid ${colors.darkGreen};
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
