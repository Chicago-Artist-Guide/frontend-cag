/**
 * UserDetailsModal - Display detailed user information
 *
 * Shows full user account and profile data with option to edit.
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faEdit } from '@fortawesome/free-solid-svg-icons';
import { colors } from '../../../theme/styleVars';
import { CombinedUserData } from '../../../types/user';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { useAdminActions } from '../../../hooks/useAdminActions';
import UserRoleBadge from './UserRoleBadge';
import AdminButton from '../shared/AdminButton';

interface UserDetailsModalProps {
  user: CombinedUserData;
  onClose: () => void;
  onEdit?: () => void;
}

/**
 * Modal overlay
 */
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

/**
 * Modal container
 */
const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 700px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

/**
 * Modal header
 */
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

/**
 * Close button
 */
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

/**
 * Modal body
 */
const Body = styled.div`
  padding: 2rem;
`;

/**
 * Section
 */
const Section = styled.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Section title
 */
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

/**
 * Info grid
 */
const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0.75rem;
`;

/**
 * Label
 */
const Label = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.875rem;
  font-weight: 600;
  color: ${colors.grayishBlue};
`;

/**
 * Value
 */
const Value = styled.div`
  font-family: 'Open Sans', sans-serif;
  font-size: 0.875rem;
  color: ${colors.slate};
  word-break: break-word;
`;

/**
 * Footer
 */
const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid ${colors.lightGrey};
`;

/**
 * Format date
 */
const formatDate = (timestamp: any): string => {
  if (!timestamp) return 'N/A';
  try {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (err) {
    return 'Invalid date';
  }
};

/**
 * UserDetailsModal Component
 */
const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  onClose,
  onEdit
}) => {
  const { hasPermission } = useAdminAuth();
  const { logAction } = useAdminActions();

  // Log view action
  useEffect(() => {
    logAction({
      action_type: 'user_view',
      target_type: 'user',
      target_id: user.uid,
      target_name: user.email || user.theater_name || 'Unknown'
    });
  }, [user.uid]);

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

  const canEdit = hasPermission('users', 'edit');

  return (
    <Overlay onClick={handleOverlayClick}>
      <Modal>
        <Header>
          <h2>User Details</h2>
          <CloseButton onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </CloseButton>
        </Header>

        <Body>
          {/* Account Information */}
          <Section>
            <SectionTitle>Account Information</SectionTitle>
            <InfoGrid>
              <Label>User ID:</Label>
              <Value>{user.uid}</Value>

              <Label>Email:</Label>
              <Value>{user.email || 'No email'}</Value>

              <Label>Account Type:</Label>
              <Value style={{ textTransform: 'capitalize' }}>{user.type}</Value>

              <Label>Created:</Label>
              <Value>{formatDate(user.createdAt)}</Value>

              <Label>Last Login:</Label>
              <Value>{formatDate(user.last_login)}</Value>

              <Label>Profile Status:</Label>
              <Value>
                {user.completed_profile ? '✓ Complete' : '○ Incomplete'}
              </Value>
            </InfoGrid>
          </Section>

          {/* Profile Data */}
          {user.type === 'individual' && (
            <Section>
              <SectionTitle>Profile Data</SectionTitle>
              <InfoGrid>
                <Label>First Name:</Label>
                <Value>{user.first_name || 'Not set'}</Value>

                <Label>Last Name:</Label>
                <Value>{user.last_name || 'Not set'}</Value>

                <Label>Preferred Name:</Label>
                <Value>{user.preferred_name || 'Not set'}</Value>

                <Label>Pronouns:</Label>
                <Value>{user.pronouns || 'Not set'}</Value>

                <Label>Location:</Label>
                <Value>{user.location || 'Not set'}</Value>
              </InfoGrid>
            </Section>
          )}

          {user.type === 'company' && (
            <Section>
              <SectionTitle>Company Data</SectionTitle>
              <InfoGrid>
                <Label>Theater Name:</Label>
                <Value>{user.theater_name || 'Not set'}</Value>

                <Label>Location:</Label>
                <Value>{user.location || 'Not set'}</Value>
              </InfoGrid>
            </Section>
          )}

          {/* Admin Information */}
          {user.admin_role && (
            <Section>
              <SectionTitle>Admin Information</SectionTitle>
              <InfoGrid>
                <Label>Role:</Label>
                <Value>
                  <UserRoleBadge role={user.admin_role} />
                </Value>

                <Label>Active:</Label>
                <Value>{user.admin_active !== false ? 'Yes' : 'No'}</Value>

                <Label>Assigned:</Label>
                <Value>{formatDate(user.admin_role_assigned_at)}</Value>

                <Label>Assigned By:</Label>
                <Value>{user.admin_role_assigned_by || 'N/A'}</Value>

                {user.admin_role_notes && (
                  <>
                    <Label>Notes:</Label>
                    <Value>{user.admin_role_notes}</Value>
                  </>
                )}
              </InfoGrid>
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
              Edit User
            </AdminButton>
          )}
        </Footer>
      </Modal>
    </Overlay>
  );
};

export default UserDetailsModal;
