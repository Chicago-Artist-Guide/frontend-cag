import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Role } from '../Profile/Company/types';
import { Button } from '../shared';
import { colors, fonts } from '../../theme/styleVars';
import { parseLocalDate } from '../../utils/dates';

interface PublicRoleCardProps {
  role: Role;
  // Optional list-mode props for the /roles browse page (DEV-496/497).
  // When productionId is set, the card renders production context at the
  // top and links to the production detail page. Theatre attribution is
  // intentionally omitted on the unauth surface — see comment in
  // PublicShows/api.ts about the email leak from the accounts collection.
  productionId?: string;
  productionName?: string;
  auditionStart?: string;
  auditionEnd?: string;
}

const formatDate = (value?: string) => {
  if (!value) {
    return '';
  }
  const parsed = parseLocalDate(value);
  if (!parsed) {
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

// Format pay rate as "$NNN Unit" matching the CompanyMatchCard pattern.
// role_rate_unit values already include "Per" (e.g. "Per Week", "Per Hour",
// "Per Show", "Total"), so no "per" prefix is added here.
const formatRate = (
  rate?: number,
  unit?: 'Total' | 'Per Week' | 'Per Hour' | 'Per Show'
): string => {
  if (rate == null) {
    return '';
  }
  const rateStr = `$${rate}`;
  return unit ? `${rateStr} ${unit}` : rateStr;
};

const PublicRoleCard: React.FC<
  React.PropsWithChildren<PublicRoleCardProps>
> = ({ role, productionId, productionName, auditionStart, auditionEnd }) => {
  const isListMode = !!productionId;
  const auditionWindow = formatAuditionWindow(auditionStart, auditionEnd);
  const displayRoleName =
    role.role_name || role.offstage_role || 'Untitled Role';
  const rateDisplay = formatRate(role.role_rate, role.role_rate_unit);

  return (
    <RoleCardContainer>
      {isListMode && productionName && (
        <ProductionLine>
          <ProductionLink to={`/shows/${productionId}`}>
            {productionName}
          </ProductionLink>
        </ProductionLine>
      )}

      <RoleName>{displayRoleName}</RoleName>

      {role.description && (
        <p className="mb-[15px] line-clamp-3 font-montserrat text-sm">
          {role.description}
        </p>
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
        {rateDisplay && (
          <div className="mb-[5px] mr-[15px] flex">
            <DetailLabel>Rate:</DetailLabel>
            <DetailValue>{rateDisplay}</DetailValue>
          </div>
        )}
        {auditionWindow && (
          <div className="mb-[5px] mr-[15px] flex">
            <DetailLabel>Auditions:</DetailLabel>
            <DetailValue>{auditionWindow}</DetailValue>
          </div>
        )}
      </div>

      {isListMode && productionId && (
        <div className="mt-[12px]">
          <Link to={`/shows/${productionId}`}>
            <ViewButton
              text="View Production"
              type="button"
              variant="primary"
            />
          </Link>
        </div>
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

const RoleName = styled.h4`
  font-family: ${fonts.montserrat};
  font-weight: 600;
  font-size: 18px;
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

const ViewButton = styled(Button)`
  font-family: ${fonts.montserrat};
  font-weight: 600;
`;

export default PublicRoleCard;
