import React from 'react';
import { Link } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PageContainer from '../components/layout/PageContainer';
import { Tagline } from '../components/layout/Titles';

const Profile: React.FC<{
  previewMode?: boolean;
}> = ({ previewMode = false }) => {
  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <Tagline>Your Profile</Tagline>
          {previewMode && (
            <>
              <p>Preview Mode</p>
              <Link to="/sign-up-2">Continue to Sign Up 2</Link>
            </>
          )}
        </Col>
      </Row>
    </PageContainer>
  );
};

export default Profile;
