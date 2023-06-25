import {
  DocumentData,
  DocumentSnapshot,
  onSnapshot,
  updateDoc
} from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useProfileContext } from '../../../context/ProfileContext';
import { Button, Checkbox, InputField } from '../../../genericComponents';
import { fonts, colors } from '../../../theme/styleVars';
import PageContainer from '../../layout/PageContainer';
import DetailSection from '../shared/DetailSection';
import {
  AgeRange,
  ageRanges,
  ethnicityTypes,
  genders,
  PastPerformances,
  ProfileAwards,
  pronouns,
  UpcomingPerformances,
  IndividualAccountInit,
  IndividualProfileInit,
  IndividualProfile as IndividualProfileT,
  IndividualProfile2,
  IndividualWebsite,
  websiteTypeOptions
} from '../../SignUp/Individual/types';
import type { EditModeSections } from './types';
import { hasNonEmptyValues } from '../../../utils/hasNonEmptyValues';
import AwardCard from './AwardCard';
import IndividualUpcomingShow from './IndividualUpcomingShow';
import IndividualCredits from './IndividualCredits';
import { PreviewCard } from '../shared/styles';

const IndividualProfile: React.FC<{
  previewMode?: boolean;
}> = ({ previewMode = false }) => {
  const history = useHistory();
  const { account, profile, setAccountData, setProfileData } =
    useProfileContext();
  const [showSignUp2Link, setShowUp2Link] = useState(false);
  const [editMode, setEditMode] = useState<EditModeSections>({
    personalDetails: false,
    headline: false
  });
  const [editProfile, setEditProfile] = useState(profile?.data);
  const [editAccount, setEditAccount] = useState(account?.data);
  const PageWrapper = previewMode ? Container : PageContainer;

  const hideShowUpLink = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setShowUp2Link(false);
  };

  useEffect(() => {
    if (editMode.personalDetails || editMode.headline) {
      return;
    }

    setShowUp2Link(previewMode || !profile?.data?.completed_profile_2);
    setEditProfile(profile?.data);
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
      if (newRanges.indexOf(range) < 0) {
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
                {editMode['personalDetails'] ? 'Cancel' : 'Edit'}
              </a>
            </DetailsColTitle>
            {editMode['personalDetails'] ? (
              <div>
                <Form.Group className="form-group">
                  <CAGLabel>What age range do you play?</CAGLabel>
                  <p>Select up to 3 ranges</p>
                  {ageRanges.map((ageRange) => (
                    <Checkbox
                      checked={editProfile?.age_ranges?.includes(ageRange)}
                      fieldType="checkbox"
                      key={`age-range-chk-${ageRange}`}
                      label={ageRange}
                      name="actorInfo2AgeRanges"
                      onChange={(e: any) =>
                        ageRangeChange(e.currentTarget.checked, ageRange)
                      }
                    />
                  ))}
                </Form.Group>
                <Form.Group className="form-group">
                  <CAGLabel>Height</CAGLabel>
                  <Container>
                    <Row>
                      <PaddedCol lg="6">
                        <Form.Control
                          aria-label="height feet"
                          as="select"
                          value={editProfile?.height_ft}
                          name="actorInfo2HeightFt"
                          onChange={(e: any) =>
                            setProfileForm('height_ft', e.target.value)
                          }
                        >
                          <option value={undefined}>Feet</option>
                          {[0, 1, 2, 3, 4, 5, 6, 7].map((ft) => (
                            <option key={`ft-option-value-${ft}`} value={ft}>
                              {ft} ft
                            </option>
                          ))}
                        </Form.Control>
                      </PaddedCol>
                      <PaddedCol lg="6">
                        <Form.Control
                          aria-label="height inches"
                          as="select"
                          value={editProfile?.height_in}
                          name="actorInfo2HeightIn"
                          onChange={(e: any) =>
                            setProfileForm('height_in', e.target.value)
                          }
                        >
                          <option value={undefined}>Inches</option>
                          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(
                            (inches) => (
                              <option
                                key={`inch-option-value-${inches}`}
                                value={inches}
                              >
                                {inches} in
                              </option>
                            )
                          )}
                        </Form.Control>
                      </PaddedCol>
                    </Row>
                    <Row>
                      <PaddedCol lg="12">
                        <Checkbox
                          checked={editProfile?.height_no_answer}
                          fieldType="checkbox"
                          label="I do not wish to answer"
                          name="actorInfo2HeightNoAnswer"
                          onChange={(e: any) =>
                            setProfileForm(
                              'height_no_answer',
                              e.currentTarget.checked
                            )
                          }
                        />
                      </PaddedCol>
                    </Row>
                  </Container>
                </Form.Group>
                <Form.Group className="form-group">
                  <CAGLabel>Gender Identity</CAGLabel>
                  <p>
                    First, choose your gender identity - additional options may
                    be presented for casting purposes. If other, please select
                    the option with which you most closely identify for casting
                    purposes.
                  </p>
                  <Form.Control
                    as="select"
                    value={editProfile?.gender_identity}
                    name="actorInfo2Gender"
                    onChange={(e: any) =>
                      setProfileForm('gender_identity', e.target.value)
                    }
                  >
                    <option value={undefined}>Select</option>
                    {genders.map((g) => (
                      <option key={`gender-value-${g}`} value={g}>
                        {g}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
                <Form.Group className="form-group">
                  <CAGLabel>Ethnicity</CAGLabel>
                  {ethnicityTypes.map((eth) => (
                    <React.Fragment key={`parent-frag-chk-${eth.name}`}>
                      <Checkbox
                        checked={editProfile?.ethnicities.includes(eth.name)}
                        fieldType="checkbox"
                        key={`first-level-chk-${eth.name}`}
                        label={eth.name}
                        name="actorInfo1Ethnicities"
                        onChange={(e: any) =>
                          ethnicityChange(e.currentTarget.checked, eth.name)
                        }
                      />
                      {eth.values.length > 0 && (
                        <Checkbox style={{ paddingLeft: '1.25rem' }}>
                          {eth.values.map((ethV) => (
                            <Checkbox
                              checked={editProfile?.ethnicities.includes(ethV)}
                              fieldType="checkbox"
                              key={`${eth.name}-child-chk-${ethV}`}
                              label={ethV}
                              name="actorInfoEthnicities"
                              onChange={(e: any) =>
                                ethnicityChange(e.currentTarget.checked, ethV)
                              }
                            />
                          ))}
                        </Checkbox>
                      )}
                    </React.Fragment>
                  ))}
                </Form.Group>
                <Form.Group>
                  <CAGLabel>Union</CAGLabel>
                  <Container>
                    <Row>
                      <PaddedCol lg="5">
                        <CAGFormControl
                          aria-label="union"
                          as="select"
                          name="demographicsUnionStatus"
                          value={editProfile?.union_status}
                          onChange={(e: any) =>
                            setProfileForm('union_status', e.target.value)
                          }
                        >
                          <option value={undefined}>Select union status</option>
                          <option value="Union">Union</option>
                          <option value="Non-Union">Non-Union</option>
                          <option value="Other">Other</option>
                        </CAGFormControl>
                      </PaddedCol>
                      <PaddedCol lg="5">
                        <CAGFormControl
                          aria-label="union"
                          defaultValue={editProfile?.union_other}
                          disabled={false}
                          name="demographicsUnionStatusOther"
                          onChange={(e: any) =>
                            setProfileForm('union_other', e.target.value)
                          }
                          placeholder="Other"
                        />
                      </PaddedCol>
                    </Row>
                  </Container>
                  <CAGLabel>Agency</CAGLabel>
                  <Container>
                    <Row>
                      <PaddedCol lg="10">
                        <Form.Group className="form-group">
                          <CAGFormControl
                            aria-label="agency"
                            defaultValue={editProfile?.agency}
                            name="demographicsAgency"
                            onChange={(e: any) =>
                              setProfileForm('agency', e.target.value)
                            }
                            placeholder="Agency"
                          />
                        </Form.Group>
                      </PaddedCol>
                    </Row>
                  </Container>
                </Form.Group>
                <hr />
                <Form.Group>
                  <CAGLabel>Website Links</CAGLabel>
                  <Container>
                    <Row>
                      <PaddedCol lg="10">
                        {editProfile?.websites?.map(
                          (websiteRow: any, i: any) => (
                            <div key={`website-row-${websiteRow.id}`}>
                              <CAGFormControl
                                aria-label="URL"
                                as="input"
                                name="websiteUrl"
                                onChange={() => null}
                                placeholder="URL"
                                value={websiteRow.url}
                              />
                              <CAGFormControl
                                aria-label="website type"
                                as="select"
                                defaultValue={websiteRow.websiteType}
                                name="websiteType"
                                onChange={() => null}
                              >
                                <option value={undefined}>Select Type</option>
                                {websiteTypeOptions.map((wT) => (
                                  <option value={wT} key={wT}>
                                    {wT}
                                  </option>
                                ))}
                              </CAGFormControl>
                              {editProfile.websites.length > 1 && (
                                <a href="#" onClick={() => null}>
                                  X
                                </a>
                              )}
                            </div>
                          )
                        )}
                        <div>
                          <a href="#" onClick={() => null}>
                            + Add Website
                          </a>
                        </div>
                      </PaddedCol>
                    </Row>
                  </Container>
                </Form.Group>
                <Button
                  onClick={updatePersonalDetails}
                  text="Save"
                  type="button"
                  variant="primary"
                />
              </div>
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
              {editMode['headline'] ? 'Cancel' : 'Edit'}
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
            {profile?.data?.completed_profile_2 && (
              <DetailSection title="Training">
                <p>
                  <strong>{profile?.data?.training_institution}</strong>
                  <br />
                  {profile?.data?.training_city},{' '}
                  {profile?.data?.training_state}
                  <br />
                  <em>{profile?.data?.training_degree}</em>
                  <br />
                  <span>{profile?.data?.training_details}</span>
                </p>
              </DetailSection>
            )}
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
            {hasNonEmptyValues(profile?.data?.awards) && (
              <DetailSection title="Awards & Recognition">
                <ProfileFlex>
                  {profile?.data?.awards.map((award: ProfileAwards) => (
                    <AwardCard award={award} key={`award-${award?.title}`} />
                  ))}
                </ProfileFlex>
              </DetailSection>
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

export default IndividualProfile;
