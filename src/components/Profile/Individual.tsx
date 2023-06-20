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
import { useProfileContext } from '../../context/ProfileContext';
import { Button, Checkbox, InputField } from '../../genericComponents';
import { fonts, colors } from '../../theme/styleVars';
import PageContainer from '../layout/PageContainer';
import DetailSection from './shared/DetailSection';
import {
  ageRanges,
  ethnicityTypes,
  genders,
  PastPerformances,
  ProfileAwards,
  pronouns,
  UpcomingPerformances,
  IndividualWebsite
} from '../SignUp/Individual/types';
import type { EditModeSections } from './types';
import {
  RightCol,
  ShowCard,
  ShowImage,
  ShowName,
  ShowDescription,
  ShowStatus as ShowDates
} from './Company/Production/ActiveProduction';
import { hasNonEmptyValues } from '../../utils/hasNonEmptyValues';
import { PreviewCard } from './shared/styles';
import Ribbon from '../../images/icons-profile/ribbon.svg';

const IndividualUpcomingShow: React.FC<{
  show: UpcomingPerformances;
}> = ({ show }) => {
  return (
    <ShowCard>
      <Row>
        <Col lg={4}>
          <ShowImage src={show?.imageUrl} fluid />
        </Col>
        <RightCol lg={8}>
          <div className="d-flex flex-column" style={{ height: '100%' }}>
            <div className="flex-grow-1">
              <ShowName>{show?.title}</ShowName>
              <ShowDescription>{show?.synopsis}</ShowDescription>
              <ShowDescription>
                <strong>Industry Code:</strong> {show?.industryCode}
                <br />
                <strong>Website:</strong>{' '}
                <a href={show?.url} target="_blank">
                  {show?.url}
                </a>
              </ShowDescription>
            </div>
          </div>
        </RightCol>
      </Row>
    </ShowCard>
  );
};

const IndividualCredits: React.FC<{
  show: PastPerformances;
}> = ({ show }) => {
  return (
    <ShowCard>
      <Row>
        <Col lg={6}>
          <ShowName>{show?.title}</ShowName>
          <ShowDates>
            ({show?.startDate} - {show?.endDate})
          </ShowDates>
          <ShowDescription>
            {show?.group}
            <br />
            {show?.location}
          </ShowDescription>
        </Col>
        <Col lg={6}>
          <ShowDescription>
            <strong>Role:</strong> {show?.role}
            <br />
            <strong>Director:</strong> {show?.director}
            <br />
            <strong>Musical Director:</strong> {show?.musicalDirector}
            <br />
            <strong>Recognition:</strong> {show?.recognition}
          </ShowDescription>
        </Col>
      </Row>
      <Row>
        <Col lg={8}>
          <ShowDescription>
            <a href={show?.url} target="_blank">
              Visit Website &gt;
            </a>
          </ShowDescription>
        </Col>
      </Row>
    </ShowCard>
  );
};

const AwardCard: React.FC<{
  award: ProfileAwards;
}> = ({ award }) => {
  return (
    <AwardCardFlex>
      <Row>
        <Col lg={4}>
          <AwardIconImage src={Ribbon} fluid />
        </Col>
        <Col lg={8}>
          <AwardTitle>{award?.title}</AwardTitle>
          <AwardP>{award?.year}</AwardP>
          <AwardP>{award?.description}</AwardP>
          <AwardP>
            <a href={award?.url} target="_blank">
              View Website
            </a>
          </AwardP>
        </Col>
      </Row>
    </AwardCardFlex>
  );
};

const IndividualProfile: React.FC<{
  previewMode?: boolean;
}> = ({ previewMode = false }) => {
  const history = useHistory();
  const {
    account: { data: account },
    profile: { data: profile }
  } = useProfileContext();
  const [showSignUp2Link, setShowUp2Link] = useState(false);
  const [editMode, setEditMode] = useState<EditModeSections>({
    personalDetails: false,
    headline: false
  });
  const [editProfile, setEditProfile] = useState(profile);
  const PageWrapper = previewMode ? Container : PageContainer;

  const hideShowUpLink = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setShowUp2Link(false);
  };

  useEffect(() => {
    setShowUp2Link(previewMode || !profile?.completed_profile_2);
    setEditProfile(profile);
  }, [profile]);

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

  const setProfileForm = (e: any, field: string, value: any) => {
    setEditProfile({
      ...editProfile,
      [field]: value
    });
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
      {profile?.completed_profile_2 && (
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
          <ProfileImage src={profile?.profile_image_url} fluid />
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
                      checked={profile?.age_ranges?.includes(ageRange)}
                      fieldType="checkbox"
                      key={`age-range-chk-${ageRange}`}
                      label={ageRange}
                      name="actorInfo2AgeRanges"
                      onChange={() => null}
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
                          value={profile?.height_ft}
                          name="actorInfo2HeightFt"
                          onChange={() => null}
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
                          value={profile?.height_in}
                          name="actorInfo2HeightIn"
                          onChange={() => null}
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
                          checked={profile?.height_no_answer}
                          fieldType="checkbox"
                          label="I do not wish to answer"
                          name="actorInfo2HeightNoAnswer"
                          onChange={() => null}
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
                    value={profile?.gender_identity}
                    name="actorInfo2Gender"
                    onChange={() => null}
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
                        checked={profile?.ethnicities.includes(eth.name)}
                        fieldType="checkbox"
                        key={`first-level-chk-${eth.name}`}
                        label={eth.name}
                        name="actorInfo1Ethnicities"
                        onChange={() => null}
                      />
                      {eth.values.length > 0 && (
                        <Checkbox style={{ paddingLeft: '1.25rem' }}>
                          {eth.values.map((ethV) => (
                            <Checkbox
                              checked={profile?.ethnicities.includes(ethV)}
                              fieldType="checkbox"
                              key={`${eth.name}-child-chk-${ethV}`}
                              label={ethV}
                              name="actorInfoEthnicities"
                              onChange={() => null}
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
                          value={profile?.union_status}
                          onChange={() => null}
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
                          defaultValue={profile?.union_other}
                          disabled={false}
                          name="demographicsUnionStatusOther"
                          onChange={() => null}
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
                            defaultValue={profile?.agency}
                            name="demographicsAgency"
                            onChange={() => null}
                            placeholder="Agency"
                          />
                        </Form.Group>
                      </PaddedCol>
                    </Row>
                  </Container>
                </Form.Group>
                <Button
                  onClick={() => null}
                  text="Save"
                  type="button"
                  variant="primary"
                />
              </div>
            ) : (
              <>
                <p>
                  {profile?.age_ranges?.length && (
                    <>
                      Age Range: {profile?.age_ranges?.join(', ')}
                      <br />
                    </>
                  )}
                  {(profile?.height_no_answer ||
                    (profile?.height_ft && profile?.height_ft !== '')) && (
                    <>
                      Height:{' '}
                      {profile?.height_no_answer ? (
                        'N/A'
                      ) : (
                        <>
                          {profile?.height_ft}’-{profile?.height_in}”
                        </>
                      )}
                      <br />
                    </>
                  )}
                  {profile?.gender_identity &&
                    profile?.gender_identity !== '' && (
                      <>
                        Gender Identity: {profile?.gender_identity}
                        <br />
                      </>
                    )}
                  {profile?.ethnicities.length && (
                    <>
                      Ethnicity: {profile?.ethnicities?.join(', ')}
                      <br />
                    </>
                  )}
                  {((profile?.union_status && profile?.union_status !== '') ||
                    (profile?.union_other && profile?.union_other !== '')) && (
                    <>
                      Union: {profile?.union_status || profile?.union_other}
                      <br />
                    </>
                  )}
                  {profile?.agency && profile?.agency !== '' && (
                    <>Agency: {profile?.agency}</>
                  )}
                </p>
                {hasNonEmptyValues(profile?.websites) && (
                  <p>
                    <strong>Websites:</strong>
                    <br />
                    {profile?.websites.map((w: IndividualWebsite) => (
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
                  onChange={() => null}
                  required={true}
                  requiredLabel="First name"
                  value={account.first_name}
                />
                <InputField
                  label="Last"
                  name="basicsLastName"
                  onChange={() => null}
                  required={true}
                  requiredLabel="Last name"
                  value={account.last_name}
                />
                <Form.Group className="form-group">
                  <Container>
                    <Row>
                      <PaddedCol lg="6">
                        <CAGLabel>Pronouns</CAGLabel>
                        <Form.Control
                          aria-label="pronouns"
                          as="select"
                          defaultValue={profile?.pronouns}
                          name="actorInfo1Pronouns"
                          onChange={() => null}
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
                          defaultValue={profile?.pronouns_other}
                          disabled={false}
                          name="actorInfo1PronounsOther"
                          onChange={() => null}
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
                          defaultValue={profile?.profile_tagline}
                          name="demographicsBioHeadline"
                          onChange={() => null}
                          placeholder="Profile Headline (ex: Actor, Musician, Dancer)"
                        />
                      </Form.Group>
                      <Form.Group className="form-group">
                        <Form.Control
                          as="textarea"
                          defaultValue={profile?.bio}
                          name="demographicsBio"
                          onChange={() => null}
                          rows={5}
                        />
                      </Form.Group>
                    </PaddedCol>
                  </Row>
                </Container>
                <Button
                  onClick={() => null}
                  text="Save"
                  type="button"
                  variant="primary"
                />
              </div>
            ) : (
              <>
                <HeaderNamePronouns>
                  <h2>
                    {account.first_name} {account.last_name}
                  </h2>
                  <p>{profile?.pronouns || profile?.pronouns_other}</p>
                </HeaderNamePronouns>
                {profile?.profile_tagline && (
                  <h3>{profile?.profile_tagline}</h3>
                )}
                {profile?.bio && <p>{profile?.bio}</p>}
              </>
            )}
          </div>
          <div>
            {profile?.completed_profile_2 && (
              <DetailSection title="Training">
                <p>
                  <strong>{profile?.training_institution}</strong>
                  <br />
                  {profile?.training_city}, {profile?.training_state}
                  <br />
                  <em>{profile?.training_degree}</em>
                  <br />
                  <span>{profile?.training_details}</span>
                </p>
              </DetailSection>
            )}
            {hasNonEmptyValues(profile?.upcoming_performances) && (
              <DetailSection title="Upcoming Features">
                {profile?.upcoming_performances.map(
                  (perf: UpcomingPerformances) => (
                    <IndividualUpcomingShow
                      key={`upcoming-shows-${perf.id}-${perf.industryCode}`}
                      show={perf}
                    />
                  )
                )}
              </DetailSection>
            )}
            {hasNonEmptyValues(profile?.past_performances) && (
              <DetailSection title="Past Performances">
                {profile?.past_performances.map((perf: PastPerformances) => (
                  <IndividualCredits
                    key={`credits-shows-${perf.id}`}
                    show={perf}
                  />
                ))}
              </DetailSection>
            )}
            {(profile?.additional_skills_checkboxes?.length ||
              profile?.additional_skills_manual?.length) && (
              <DetailSection title="Special Skills">
                <ProfileFlex>
                  {profile?.additional_skills_checkboxes?.length &&
                    profile?.additional_skills_checkboxes.map(
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
                  {profile?.additional_skills_manual?.length &&
                    profile?.additional_skills_manual.map((skill: string) => (
                      <Badge
                        pill
                        bg="secondary"
                        key={`skills-manual-${skill}`}
                        text="white"
                      >
                        {skill}
                      </Badge>
                    ))}
                </ProfileFlex>
              </DetailSection>
            )}
            {hasNonEmptyValues(profile?.awards) && (
              <DetailSection title="Awards & Recognition">
                <ProfileFlex>
                  {profile?.awards.map((award: ProfileAwards) => (
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

const AwardCardFlex = styled.div`
  flex: 1 1 50%;
  background: ${colors.white};
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  padding: 25px 21px;
`;

const AwardIconImage = styled(Image)`
  display: block;
  margin-left: auto;
  margin-right: auto;
  height: 100%;
`;

const AwardTitle = styled.h3`
  font-family: ${fonts.mainFont};
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`;

const AwardP = styled.p`
  font-size: 12px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: 0.25px;
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
