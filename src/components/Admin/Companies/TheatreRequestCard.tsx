/**
 * TheatreRequestCard - Display card for a pending theatre sign-up request
 */

import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt, faClock } from '@fortawesome/free-solid-svg-icons';
import { TheatreRequest } from '../../../hooks/useCompanies';
import { colors } from '../../../theme/styleVars';

interface TheatreRequestCardProps {
  request: TheatreRequest;
  onClick: () => void;
}

const Card = styled.div`
  background: white;
  border: 1px solid ${colors.lightGrey};
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    border-color: ${colors.mint};
  }
`;

const MainInfo = styled.div`
  flex: 1;
`;

const CompanyName = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${colors.slate};
  margin: 0 0 0.5rem 0;
`;

const InfoRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: 0.875rem;
  color: ${colors.grayishBlue};

  span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  a {
    color: ${colors.mint};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const BadgeRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
`;

const Badge = styled.span<{ $variant?: 'equity' | 'business' }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;

  ${(props) => {
    if (props.$variant === 'equity') {
      return `background: ${colors.cornflower}20; color: ${colors.cornflower};`;
    }
    return `background: ${colors.bodyBg}; color: ${colors.grayishBlue};`;
  }}
`;

const ActionArea = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
`;

const DateLabel = styled.span`
  font-size: 0.75rem;
  color: ${colors.grayishBlue};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ViewButton = styled.button`
  padding: 0.5rem 1rem;
  background: ${colors.mint};
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.darkPrimary};
  }
`;

const formatDate = (timestamp: any): string => {
  if (!timestamp) return 'Unknown date';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (err) {
    return 'Unknown date';
  }
};

const TheatreRequestCard: React.FC<TheatreRequestCardProps> = ({
  request,
  onClick
}) => {
  const handleWebsiteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card onClick={onClick}>
      <MainInfo>
        <CompanyName>{request.theatreCompanyName}</CompanyName>
        <InfoRow>
          <span>Contact: {request.contactPerson}</span>
          <span>{request.contactEmail}</span>
          {request.theatreWebsite && (
            <a
              href={request.theatreWebsite}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleWebsiteClick}
            >
              Website <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
            </a>
          )}
        </InfoRow>
        <BadgeRow>
          <Badge $variant="equity">{request.companyType}</Badge>
          <Badge>{request.businessType}</Badge>
        </BadgeRow>
      </MainInfo>

      <ActionArea>
        <DateLabel>
          <FontAwesomeIcon icon={faClock} />
          {formatDate(request.createdAt)}
        </DateLabel>
        <ViewButton onClick={onClick}>Review</ViewButton>
      </ActionArea>
    </Card>
  );
};

export default TheatreRequestCard;
