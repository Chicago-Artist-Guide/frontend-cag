import React from 'react';
import styled from 'styled-components';
import { Role } from '../Profile/Company/types';
import { colors, fonts } from '../../theme/styleVars';

interface PublicRoleCardProps {
  role: Role;
}

const PublicRoleCard: React.FC<PublicRoleCardProps> = ({ role }) => {
  return (
    <RoleCardContainer>
      <RoleName>{role.role_name}</RoleName>
      <RoleStatus>{role.role_status}</RoleStatus>

      {role.description && (
        <RoleDescription>{role.description}</RoleDescription>
      )}

      <RoleDetails>
        {role.role_rate && (
          <DetailItem>
            <DetailLabel>Rate:</DetailLabel>
            <DetailValue>
              {role.role_rate}{' '}
              {role.role_rate_unit && `per ${role.role_rate_unit}`}
            </DetailValue>
          </DetailItem>
        )}
      </RoleDetails>
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

export default PublicRoleCard;
