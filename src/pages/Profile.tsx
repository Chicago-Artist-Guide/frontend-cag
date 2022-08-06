import React from 'react';
import { useHistory } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import styled from 'styled-components';
import PageContainer from '../components/layout/PageContainer';
import Button from '../genericComponents/Button';
import { colors, fonts } from '../theme/styleVars';

const Profile: React.FC<{
  previewMode?: boolean;
}> = ({ previewMode = false }) => {
  const history = useHistory();

  return (
    <>
      <PageContainer>
        <Row>
          <Col lg={12}>
            <Title>YOUR PROFILE</Title>
          </Col>
        </Row>
        <Row>
          <Col lg={4}>
            <ProfileImage
              src="https://firebasestorage.googleapis.com/v0/b/chicago-artist-guide-dev.appspot.com/o/files%2Falex.jpg?alt=media&token=a576a7b2-c2c7-4f52-aa1e-504af4a50deb"
              fluid
            />
            <DetailsCard>
              <DetailsColTitle>Personal Details</DetailsColTitle>
              <p>
                Age Range: 18-29
                <br />
                Height: 5’-3”
                <br />
                Gender Identity: Nonbinary
                <br />
                Ethnicity: Native American
                <br />
                Union: None
                <br />
                Agency: Chi Stars Agency
              </p>
            </DetailsCard>
          </Col>
          <Col lg={8}>
            <div>
              <div>
                <h2>Alex Jewell</h2>
                <p>they/them</p>
              </div>
              <h3>Actor, Magician, Singer</h3>
              <p>
                Classically trained, Camilla has played roles from Shakespeare
                to Tennessee Williams, working in major American repertory
                theaters, On- and Off-Broadway, as well as in dozens of contract
                and recurring roles for daytime and primetime TV.
              </p>
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
      </PageContainer>
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
          <a href="#">remind me later</a>
        </div>
      </PreviewCard>
    </>
  );
};

const Title = styled.h1`
  font-family: ${fonts.montserrat};
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 100px;
`;

const ProfileImage = styled(Image)`
  display: block;
  box-shadow: 0px 0px 8px 4px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
`;

const DetailsCard = styled.div`
  margin-top: 47px;
  background: white;
  box-shadow: 0px 0px 8px 4px rgba(0, 0, 0, 0.05);
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
    background: linear-gradient(90deg, #efc93d 0%, #82b29a 100%);
    border-radius: 4px;
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
  background: #f7beb2;
  border-radius: 8px 0px 0px 8px;

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
    color: #3b4448;
    margin-left: 21px;
  }
`;

export default Profile;
