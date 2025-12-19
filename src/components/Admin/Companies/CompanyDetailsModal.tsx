/**
 * CompanyDetailsModal - Display detailed company information
 *
 * Shows full company account and profile data with option to edit.
 */

import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faEdit,
  faExternalLinkAlt,
  faBan,
  faCheckCircle
} from '@fortawesome/free-solid-svg-icons';
import { colors } from '../../../theme/styleVars';
import { CompanyData } from '../../../hooks/useCompanies';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { useAdminActions } from '../../../hooks/useAdminActions';
import AdminButton from '../shared/AdminButton';

interface CompanyDetailsModalProps {
  company: CompanyData;
  onClose: () => void;
  onEdit?: () => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  border-bottom: 1px solid ${colors.lightGrey};

  h2 {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${colors.slate};
    margin: 0;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${colors.grayishBlue};
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.bodyBg};
    color: ${colors.slate};
  }

  svg {
    font-size: 1.25rem;
  }
`;

const Body = styled.div`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-family: 'Montserrat', sans-serif;
  font-size: 1rem;
  font-weight: 700;
  color: ${colors.slate};
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid ${colors.bodyBg};
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0.75rem;
`;

const Label = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.grayishBlue};
`;

const Value = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.875rem;
  color: ${colors.slate};
  word-break: break-word;

  a {
    color: ${colors.mint};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const StatusBadge = styled.span<{ $status: 'active' | 'disabled' }>`
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;

  ${(props) =>
    props.$status === 'active'
      ? `background: ${colors.mint}20; color: ${colors.mint};`
      : `background: ${colors.salmon}20; color: ${colors.salmon};`}
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid ${colors.lightGrey};
`;

const formatDate = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (err) {
    return 'Invalid date';
  }
};

const CompanyDetailsModal: React.FC<CompanyDetailsModalProps> = ({
  company,
  onClose,
  onEdit
}) => {
  const { hasPermission } = useAdminAuth();
  const { logAction } = useAdminActions();
  const hasLoggedViewRef = useRef(false);

  // Log view action - only once per modal open
  useEffect(() => {
    if (!hasLoggedViewRef.current) {
      logAction({
        action_type: 'company_view',
        target_type: 'company',
        target_id: company.accountId,
        target_name: company.theater_name
      });
      hasLoggedViewRef.current = true;
    }
  }, [company.accountId, company.theater_name, logAction]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Handle overlay click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const canEdit = hasPermission('companies', 'edit');

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <h2>Company Details</h2>
          <CloseButton onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </Header>

        <Body>
          {/* Account Information */}
          <Section>
            <SectionTitle>Account Information</SectionTitle>
            <InfoGrid>
              <Label>Account ID:</Label>
              <Value>{company.accountId}</Value>

              <Label>Email:</Label>
              <Value>{company.email || 'No email'}</Value>

              <Label>Status:</Label>
              <Value>
                <StatusBadge $status={company.disabled ? 'disabled' : 'active'}>
                  <FontAwesomeIcon
                    icon={company.disabled ? faBan : faCheckCircle}
                  />
                  {company.disabled ? 'Disabled' : 'Active'}
                </StatusBadge>
              </Value>

              <Label>Created:</Label>
              <Value>{formatDate(company.createdAt)}</Value>

              <Label>Profile Status:</Label>
              <Value>
                {company.complete_profile ? '✓ Complete' : '○ Incomplete'}
              </Value>
            </InfoGrid>
          </Section>

          {/* Company Information */}
          <Section>
            <SectionTitle>Company Information</SectionTitle>
            <InfoGrid>
              <Label>Company Name:</Label>
              <Value>{company.theater_name}</Value>

              {company.website && (
                <>
                  <Label>Website:</Label>
                  <Value>
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {company.website}{' '}
                      <FontAwesomeIcon icon={faExternalLinkAlt} size="xs" />
                    </a>
                  </Value>
                </>
              )}

              <Label>Location:</Label>
              <Value>{company.location || 'Not set'}</Value>

              <Label>Company Size:</Label>
              <Value>{company.number_of_members || 'Not set'}</Value>

              {company.equity_status && (
                <>
                  <Label>Equity Status:</Label>
                  <Value>{company.equity_status}</Value>
                </>
              )}

              {company.business_type && (
                <>
                  <Label>Business Type:</Label>
                  <Value>{company.business_type}</Value>
                </>
              )}
            </InfoGrid>
          </Section>

          {/* Contact Information */}
          <Section>
            <SectionTitle>Contact Information</SectionTitle>
            <InfoGrid>
              <Label>Primary Contact:</Label>
              <Value>{company.primary_contact || 'Not set'}</Value>

              <Label>Contact Email:</Label>
              <Value>{company.primary_contact_email || 'Not set'}</Value>
            </InfoGrid>
          </Section>

          {/* Statistics */}
          <Section>
            <SectionTitle>Activity</SectionTitle>
            <InfoGrid>
              <Label>Productions:</Label>
              <Value>{company.productions_count || 0} productions</Value>
            </InfoGrid>
          </Section>

          {/* Description */}
          {company.description && (
            <Section>
              <SectionTitle>Description</SectionTitle>
              <Value style={{ whiteSpace: 'pre-wrap' }}>
                {company.description}
              </Value>
            </Section>
          )}
        </Body>

        <Footer>
          <AdminButton variant="secondary" onClick={onClose}>
            Close
          </AdminButton>
          {canEdit && onEdit && (
            <AdminButton variant="primary" onClick={onEdit}>
              <FontAwesomeIcon
                icon={faEdit}
                style={{ marginRight: '0.5rem' }}
              />
              Edit Company
            </AdminButton>
          )}
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default CompanyDetailsModal;
