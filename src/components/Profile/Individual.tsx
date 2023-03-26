import React, { useEffect, useState } from 'react';
import Badge from 'react-bootstrap/Badge';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useProfileContext } from '../../context/ProfileContext';
import Button from '../../genericComponents/Button';
import { fonts, colors } from '../../theme/styleVars';
import PageContainer from '../layout/PageContainer';
import DetailSection from './shared/DetailSection';
import type {
  PastPerformances,
  ProfileAwards,
  UpcomingPerformances
} from '../SignUp/Individual/types';
import {
  RightCol,
  ShowCard,
  ShowImage,
  ShowName,
  ShowDescription,
  ShowStatus as ShowDates
} from './Company/Production/ActiveProduction';
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
  const PageWrapper = previewMode ? Container : PageContainer;

  const hideShowUpLink = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setShowUp2Link(false);
  };

  useEffect(() => {
    setShowUp2Link(previewMode || !profile?.completed_profile_2);
  }, [profile]);

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
              />
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
            <DetailsColTitle>Personal Details</DetailsColTitle>
            <p>
              Age Range: {profile?.age_ranges?.join(', ')}
              <br />
              Height:{' '}
              {profile?.height_no_answer ? (
                'N/A'
              ) : (
                <>
                  {profile?.height_ft}’-{profile?.height_in}”
                </>
              )}
              <br />
              Gender Identity: {profile?.gender_identity}
              <br />
              Ethnicity: {profile?.ethnicities?.join(', ')}
              <br />
              Union: {profile?.union_status || profile?.union_other}
              <br />
              Agency: {profile?.agency}
            </p>
          </DetailsCard>
        </Col>
        <Col lg={8}>
          <div>
            <HeaderNamePronouns>
              <h2>
                {account.first_name} {account.last_name}
              </h2>
              <p>{profile?.pronouns || profile?.pronouns_other}</p>
            </HeaderNamePronouns>
            {profile?.profile_tagline && <h3>{profile?.profile_tagline}</h3>}
            <p>{profile?.bio}</p>
          </div>
          <div>
            <DetailSection title="Training">
              {profile?.completed_profile_2 && (
                <p>
                  <strong>{profile?.training_institution}</strong>
                  <br />
                  {profile?.training_city}, {profile?.training_state}
                  <br />
                  <em>{profile?.training_degree}</em>
                  <br />
                  <span>{profile?.training_details}</span>
                </p>
              )}
            </DetailSection>
            <DetailSection title="Upcoming Features">
              {profile?.upcoming_performances?.length &&
                profile?.upcoming_performances.map(
                  (perf: UpcomingPerformances) => (
                    <IndividualUpcomingShow
                      key={`upcoming-shows-${perf.id}-${perf.industryCode}`}
                      show={perf}
                    />
                  )
                )}
            </DetailSection>
            <DetailSection title="Past Performances">
              {profile?.past_performances?.length &&
                profile?.past_performances.map((perf: PastPerformances) => (
                  <IndividualCredits
                    key={`credits-shows-${perf.id}`}
                    show={perf}
                  />
                ))}
            </DetailSection>
            <DetailSection title="Special Skills">
              <ProfileFlex>
                {profile?.additional_skills_checkboxes?.length &&
                  profile?.additional_skills_checkboxes.map((skill: string) => (
                    <Badge
                      pill
                      bg="primary"
                      key={`skills-primary-${skill}`}
                      text="white"
                    >
                      {skill}
                    </Badge>
                  ))}
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
            <DetailSection title="Awards & Recognition">
              <ProfileFlex>
                {profile?.awards?.length &&
                  profile?.awards.map((award: ProfileAwards) => (
                    <AwardCard award={award} key={`award-${award?.title}`} />
                  ))}
              </ProfileFlex>
            </DetailSection>
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

const PreviewCard = styled.div`
  height: auto;
  display: block;
  padding: 26px 12% 26px 32px;
  background: ${colors.lightPink};
  border-radius: 8px;
  margin-bottom: 45px;

  h2 {
    font-family: ${fonts.montserrat};
    font-weight: 700;
    font-size: 28px;
    line-height: 36px;
    text-transform: uppercase;
  }

  p {
    font-family: ${fonts.montserrat};
    font-weight: 500;
    font-size: 24px;
    line-height: 32px;
  }

  div {
    display: flex;
    align-items: center;
  }

  a {
    font-family: ${fonts.montserrat};
    font-weight: 700;
    font-size: 14px;
    line-height: 16px;
    text-transform: uppercase;
    color: ${colors.dark};
    margin-left: 21px;
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

export default IndividualProfile;
