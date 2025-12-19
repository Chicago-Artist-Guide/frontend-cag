/**
 * CompanyCard - Display card for a theatre company in the admin grid
 */

import React from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTheaterMasks,
  faCheckCircle,
  faBan
} from '@fortawesome/free-solid-svg-icons';
import { CompanyData } from '../../../hooks/useCompanies';
import { colors } from '../../../theme/styleVars';

interface CompanyCardProps {
  company: CompanyData;
  onClick: () => void;
}

const Card = styled.div<{ $disabled?: boolean }>`
  background: white;
  border: 1px solid ${colors.lightGrey};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;
  opacity: ${(props) => (props.$disabled ? 0.7 : 1)};

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: ${colors.mint};
  }
`;

const Avatar = styled.div<{ $hasImage?: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 8px;
  background: ${(props) =>
    props.$hasImage
      ? 'transparent'
      : `linear-gradient(135deg, ${colors.mint}, ${colors.cornflower})`};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  margin-bottom: 1rem;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Name = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${colors.slate};
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Email = styled.div`
  font-size: 0.875rem;
  color: ${colors.grayishBlue};
  margin-bottom: 0.75rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
`;

const Badge = styled.span<{
  $variant?: 'success' | 'warning' | 'error' | 'default';
}>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;

  ${(props) => {
    switch (props.$variant) {
      case 'success':
        return `background: ${colors.mint}20; color: ${colors.mint};`;
      case 'warning':
        return `background: ${colors.banana}40; color: ${colors.darkGrey};`;
      case 'error':
        return `background: ${colors.salmon}20; color: ${colors.salmon};`;
      default:
        return `background: ${colors.bodyBg}; color: ${colors.grayishBlue};`;
    }
  }}
`;

const Stats = styled.div`
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: ${colors.grayishBlue};

  span {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
`;

const CompanyCard: React.FC<CompanyCardProps> = ({ company, onClick }) => {
  // Get initials for avatar
  const getInitials = (): string => {
    if (company.theater_name) {
      const words = company.theater_name.split(' ');
      if (words.length >= 2) {
        return `${words[0][0]}${words[1][0]}`.toUpperCase();
      }
      return company.theater_name.substring(0, 2).toUpperCase();
    }
    return 'TC';
  };

  return (
    <Card onClick={onClick} $disabled={company.disabled}>
      <Avatar $hasImage={!!company.profile_image_url}>
        {company.profile_image_url ? (
          <img src={company.profile_image_url} alt={company.theater_name} />
        ) : (
          <FontAwesomeIcon icon={faTheaterMasks} />
        )}
      </Avatar>
      <Name title={company.theater_name}>{company.theater_name}</Name>
      <Email title={company.email}>{company.email || 'No email'}</Email>

      <BadgeRow>
        {company.disabled ? (
          <Badge $variant="error">
            <FontAwesomeIcon icon={faBan} /> Disabled
          </Badge>
        ) : (
          <Badge $variant="success">
            <FontAwesomeIcon icon={faCheckCircle} /> Active
          </Badge>
        )}
        {company.complete_profile ? (
          <Badge $variant="success">Profile Complete</Badge>
        ) : (
          <Badge $variant="warning">Incomplete</Badge>
        )}
      </BadgeRow>

      <Stats>
        <span>{company.productions_count || 0} productions</span>
        {company.primary_contact && (
          <span>Contact: {company.primary_contact}</span>
        )}
      </Stats>
    </Card>
  );
};

export default CompanyCard;
