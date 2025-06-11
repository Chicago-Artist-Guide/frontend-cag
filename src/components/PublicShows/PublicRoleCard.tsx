import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';
import { Role } from '../Profile/Company/types';
import { Button } from '../shared';
import { colors, fonts } from '../../theme/styleVars';

interface PublicRoleCardProps {
  role: Role;
  onShowInterest: () => void;
  isLoggedIn: boolean;
}

const PublicRoleCard: React.FC<PublicRoleCardProps> = ({
  role,
  onShowInterest,
  isLoggedIn
}) => {
  return (
    <RoleCardContainer>
      <Row>
        <Col lg={8}>
          <RoleName>{role.role_name}</RoleName>
          <RoleStatus>{role.role_status}</RoleStatus>

          {role.description && (
            <RoleDescription>{role.description}</RoleDescription>
          )}

          <RoleDetails>
            {role.gender_identity && role.gender_identity.length > 0 && (
              <DetailItem>
                <DetailLabel>Gender Identity:</DetailLabel>
                <DetailValue>{role.gender_identity.join(', ')}</DetailValue>
              </DetailItem>
            )}

            {role.age_range && role.age_range.length > 0 && (
              <DetailItem>
                <DetailLabel>Age Range:</DetailLabel>
                <DetailValue>{role.age_range.join(', ')}</DetailValue>
              </DetailItem>
            )}

            {role.ethnicity && role.ethnicity.length > 0 && (
              <DetailItem>
                <DetailLabel>Ethnicity:</DetailLabel>
                <DetailValue>{role.ethnicity.join(', ')}</DetailValue>
              </DetailItem>
            )}

            {role.union && (
              <DetailItem>
                <DetailLabel>Union:</DetailLabel>
                <DetailValue>{role.union}</DetailValue>
              </DetailItem>
            )}

            {role.role_rate && (
              <DetailItem>
                <DetailLabel>Rate:</DetailLabel>
                <DetailValue>
                  {role.role_rate}{' '}
                  {role.role_rate_unit && `per ${role.role_rate_unit}`}
                </DetailValue>
              </DetailItem>
            )}

            {role.additional_requirements &&
              role.additional_requirements.length > 0 && (
                <DetailItem>
                  <DetailLabel>Additional Requirements:</DetailLabel>
                  <DetailValue>
                    {role.additional_requirements.join(', ')}
                  </DetailValue>
                </DetailItem>
              )}

            {role.singing_details && (
              <DetailItem>
                <DetailLabel>Singing Style:</DetailLabel>
                <DetailValue>{role.singing_details}</DetailValue>
              </DetailItem>
            )}

            {role.dancing_details && (
              <DetailItem>
                <DetailLabel>Dancing Style:</DetailLabel>
                <DetailValue>{role.dancing_details}</DetailValue>
              </DetailItem>
            )}
          </RoleDetails>
        </Col>

        <Col
          lg={4}
          className="d-flex align-items-center justify-content-center"
        >
          <RoleButton
            onClick={onShowInterest}
            text={isLoggedIn ? 'Apply for Role' : 'Express Interest'}
            type="button"
            variant="primary"
          />
        </Col>
      </Row>
    </RoleCardContainer>
  );
};

const RoleCardContainer = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const RoleName = styled.h4`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 5px;
`;

const RoleStatus = styled.div`
  font-family: ${fonts.montserrat};
  font-weight: 500;
  font-size: 14px;
  color: ${colors.mint};
  margin-bottom: 10px;
`;

const RoleDescription = styled.p`
  font-family: ${fonts.montserrat};
  font-size: 14px;
  margin-bottom: 15px;
`;

const RoleDetails = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const DetailItem = styled.div`
  display: flex;
  margin-right: 15px;
  margin-bottom: 5px;
`;

const DetailLabel = styled.span`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 14px;
  margin-right: 5px;
`;

const DetailValue = styled.span`
  font-family: ${fonts.montserrat};
  font-size: 14px;
`;

const RoleButton = styled(Button)`
  width: 100%;
`;

export default PublicRoleCard;
