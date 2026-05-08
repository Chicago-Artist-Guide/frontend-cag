import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Role } from '../Profile/Company/types';
import { colors, fonts } from '../../theme/styleVars';

interface PublicRoleCardProps {
  role: Role;
  // Optional list-mode props for the /roles browse page (DEV-496/497).
  // When productionId is set, the card renders production/theatre context
  // at the top and a "View Role" link to the show detail page.
  productionId?: string;
  productionName?: string;
  theatreName?: string;
  auditionStart?: string;
  auditionEnd?: string;
}

const formatDate = (value?: string) => {
  if (!value) {
    return '';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }
  return parsed.toLocaleDateString();
};

const formatAuditionWindow = (start?: string, end?: string) => {
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e) {
    return `${s} – ${e}`;
  }
  return s || e || '';
};

const PublicRoleCard: React.FC<
  React.PropsWithChildren<PublicRoleCardProps>
> = ({
  role,
  productionId,
  productionName,
  theatreName,
  auditionStart,
  auditionEnd
}) => {
  const isListMode = !!productionId;
  const auditionWindow = formatAuditionWindow(auditionStart, auditionEnd);
  const displayRoleName =
    role.role_name || role.offstage_role || 'Untitled Role';

  return (
    <RoleCardContainer>
      {isListMode && productionName && (
        <ProductionLine>
          <ProductionLink to={`/shows/${productionId}`}>
            {productionName}
          </ProductionLink>
          {theatreName && (
            <>
              <Separator>·</Separator>
              <TheatreName>{theatreName}</TheatreName>
            </>
          )}
        </ProductionLine>
      )}

      <RoleName>{displayRoleName}</RoleName>
      {role.role_status && <RoleStatus>{role.role_status}</RoleStatus>}

      {role.description && (
        <RoleDescription>{role.description}</RoleDescription>
      )}

      <div className="flex flex-wrap gap-[10px]">
        {role.type && (
          <div className="mb-[5px] mr-[15px] flex">
            <DetailLabel>Stage:</DetailLabel>
            <DetailValue>{role.type}</DetailValue>
          </div>
        )}
        {Array.isArray(role.union) && role.union.length > 0 && (
          <div className="mb-[5px] mr-[15px] flex">
            <DetailLabel>Union:</DetailLabel>
            <DetailValue>{role.union.join(', ')}</DetailValue>
          </div>
        )}
        {role.role_rate && (
          <div className="mb-[5px] mr-[15px] flex">
            <DetailLabel>Rate:</DetailLabel>
            <DetailValue>
              {role.role_rate}
              {role.role_rate_unit && ` per ${role.role_rate_unit}`}
            </DetailValue>
          </div>
        )}
        {auditionWindow && (
          <div className="mb-[5px] mr-[15px] flex">
            <DetailLabel>Auditions:</DetailLabel>
            <DetailValue>{auditionWindow}</DetailValue>
          </div>
        )}
      </div>

      {isListMode && (
        <ViewRoleLink to={`/shows/${productionId}`}>View Role →</ViewRoleLink>
      )}
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

const ProductionLine = styled.div`
  font-family: ${fonts.montserrat};
  font-size: 13px;
  color: ${colors.grayishBlue};
  margin-bottom: 6px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
`;

const ProductionLink = styled(Link)`
  color: ${colors.cornflower};
  font-weight: 600;
  text-decoration: none;

  &:hover {
    color: ${colors.mint};
    text-decoration: underline;
  }
`;

const Separator = styled.span`
  margin: 0 6px;
`;

const TheatreName = styled.span`
  font-weight: 500;
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

const ViewRoleLink = styled(Link)`
  display: inline-block;
  margin-top: 12px;
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 14px;
  color: ${colors.cornflower};
  text-decoration: none;

  &:hover {
    color: ${colors.mint};
    text-decoration: underline;
  }
`;

export default PublicRoleCard;
