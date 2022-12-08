import React, { useState } from 'react';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Image from 'react-bootstrap/Image';
import Row from 'react-bootstrap/Row';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';
import { useProfileContext } from '../../context/ProfileContext';
import Button from '../../genericComponents/Button';
import { fonts, colors } from '../../theme/styleVars';
import PageContainer from '../layout/PageContainer';

const IndividualProfile: React.FC<{
  previewMode?: boolean;
}> = ({ previewMode = false }) => {
  const history = useHistory();
  const {
    account: { data: account },
    profile: { data: profile }
  } = useProfileContext();
  const [showSignUp2Link, setShowUp2Link] = useState(
    previewMode || !profile?.completed_profile_2
  );
  const PageWrapper = previewMode ? Container : PageContainer;

  const hideShowUpLink = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    setShowUp2Link(false);
  };

  return (
    <>
      <PageWrapper>
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
              <h3>Actor, Magician, Singer</h3>
              <p>{profile?.bio}</p>
            </div>
            <div>
              <h4>Training</h4>
              <h4>Past Performances</h4>
              <h4>Upcoming Features</h4>
              <h4>Special Skills</h4>
              <h4>Awards &amp; Recognition</h4>
            </div>
          </Col>
        </Row>
      </PageWrapper>
      {showSignUp2Link && (
        <PreviewCard>
          <h2>Your Profile is looking great!</h2>
          <p>
            We can walk you through the remaining steps or you can take it from
            here
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
      )}
    </>
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
  position: fixed;
  right: 0;
  bottom: 33%;
  transform: translateY(-50%);
  width: 39%;
  height: auto;
  display: block;
  padding: 26px 12% 26px 32px;
  background: ${colors.lightPink};
  border-radius: 8px 0 0 8px;

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

export default IndividualProfile;
