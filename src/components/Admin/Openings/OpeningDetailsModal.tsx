/**
 * OpeningDetailsModal - View full opening information
 *
 * Displays all opening details including moderation info.
 * Logs user_view action for audit trail.
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTimes,
  faMapMarkerAlt,
  faDollarSign,
  faExternalLinkAlt,
  faEdit
} from '@fortawesome/free-solid-svg-icons';
import { colors } from '../../../theme/styleVars';
import { RoleOpportunity } from '../../../types/opening';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { useAdminActions } from '../../../hooks/useAdminActions';

interface OpeningDetailsModalProps {
  opening: RoleOpportunity;
  onClose: () => void;
  onEdit?: (opening: RoleOpportunity) => void;
}

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  border-bottom: 1px solid ${colors.lightGrey};

  .title-section {
    flex: 1;
  }

  .role-name {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: ${colors.slate};
    margin-bottom: 0.5rem;
  }

  .production-name {
    font-size: 1.125rem;
    color: ${colors.grayishBlue};
  }

  .close-button {
    background: none;
    border: none;
    color: ${colors.grayishBlue};
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.25rem;
    transition: color 0.2s ease;

    &:hover {
      color: ${colors.slate};
    }
  }
`;

const Content = styled.div`
  padding: 2rem;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  .section-title {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.875rem;
    font-weight: 700;
    color: ${colors.grayishBlue};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: 1rem;
  }

  .field {
    margin-bottom: 1rem;

    .label {
      font-family: 'Montserrat', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      color: ${colors.grayishBlue};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .value {
      font-family: 'Open Sans', sans-serif;
      font-size: 1rem;
      color: ${colors.slate};
      line-height: 1.6;
    }
  }
`;

const BadgeGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Badge = styled.span<{ variant?: string }>`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;

  ${(props) => {
    switch (props.variant) {
      case 'open':
        return `
          background: rgba(130, 178, 154, 0.1);
          color: ${colors.mint};
        `;
      case 'closed':
        return `
          background: rgba(225, 123, 96, 0.1);
          color: ${colors.salmon};
        `;
      case 'type':
        return `
          background: ${colors.bodyBg};
          color: ${colors.slate};
        `;
      default:
        return `
          background: ${colors.bodyBg};
          color: ${colors.grayishBlue};
        `;
    }
  }}
`;

const LinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${colors.mint};
  color: white;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  text-decoration: none;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: 20px;
  transition: all 0.2s ease;
  margin-right: 1rem;

  &:hover {
    background: ${colors.cornflower};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  svg {
    font-size: 0.875rem;
  }
`;

const EditButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  color: ${colors.mint};
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border: 2px solid ${colors.mint};
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${colors.mint};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  svg {
    font-size: 0.875rem;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: ${colors.bodyBg};
  border-radius: 8px;
  margin-top: 1rem;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
    color: ${colors.grayishBlue};

    svg {
      color: ${colors.mint};
    }

    .meta-value {
      color: ${colors.slate};
      font-weight: 500;
    }
  }
`;

const OpeningDetailsModal: React.FC<OpeningDetailsModalProps> = ({
  opening,
  onClose,
  onEdit
}) => {
  const { hasPermission } = useAdminAuth();
  const { logAction } = useAdminActions();

  // Log view action
  useEffect(() => {
    logAction({
      action_type: 'opening_view',
      target_type: 'opening',
      target_id: opening.id,
      target_name: `${opening.roleName} - ${opening.productionName}`
    });
  }, [opening.id, opening.roleName, opening.productionName, logAction]);

  const formatDate = (timestamp: any) => {
    if (!timestamp?.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Overlay onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <Header>
          <div className="title-section">
            <div className="role-name">{opening.roleName}</div>
            <div className="production-name">{opening.productionName}</div>
          </div>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </Header>

        <Content>
          {/* Status and Type Badges */}
          <Section>
            <BadgeGroup>
              {opening.roleType && (
                <Badge variant="type">{opening.roleType}</Badge>
              )}
              <Badge variant={opening.status || 'open'}>
                {opening.status || 'open'}
              </Badge>
            </BadgeGroup>
          </Section>

          {/* Description */}
          {opening.description && (
            <Section>
              <div className="section-title">Description</div>
              <div className="field">
                <div className="value">{opening.description}</div>
              </div>
            </Section>
          )}

          {/* Location and Pay */}
          {(opening.location || opening.pay) && (
            <Section>
              <div className="section-title">Details</div>
              <MetaInfo>
                {opening.location && (
                  <div className="meta-item">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span className="meta-value">{opening.location}</span>
                  </div>
                )}
                {opening.pay && (
                  <div className="meta-item">
                    <FontAwesomeIcon icon={faDollarSign} />
                    <span className="meta-value">{opening.pay}</span>
                  </div>
                )}
              </MetaInfo>
            </Section>
          )}

          {/* Links */}
          {(opening.googleFormUrl || opening.moreInfoUrl) && (
            <Section>
              <div className="section-title">Links</div>
              {opening.googleFormUrl && (
                <LinkButton
                  href={opening.googleFormUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Application Form
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </LinkButton>
              )}
              {opening.moreInfoUrl && (
                <LinkButton
                  href={opening.moreInfoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  More Info
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </LinkButton>
              )}
            </Section>
          )}

          {/* Metadata */}
          <Section>
            <div className="section-title">Metadata</div>
            <div className="field">
              <div className="label">Production ID</div>
              <div className="value">{opening.productionId || 'N/A'}</div>
            </div>
            <div className="field">
              <div className="label">Posted By</div>
              <div className="value">{opening.account_id || 'N/A'}</div>
            </div>
            <div className="field">
              <div className="label">Created</div>
              <div className="value">{formatDate(opening.createdAt)}</div>
            </div>
            {opening.updatedAt && (
              <div className="field">
                <div className="label">Updated</div>
                <div className="value">{formatDate(opening.updatedAt)}</div>
              </div>
            )}
          </Section>

          {/* Moderation Info */}
          {opening.moderated && (
            <Section>
              <div className="section-title">Moderation Info</div>
              <div className="field">
                <div className="label">Moderated</div>
                <div className="value">Yes</div>
              </div>
              {opening.moderatedBy && (
                <div className="field">
                  <div className="label">Moderated By</div>
                  <div className="value">{opening.moderatedBy}</div>
                </div>
              )}
              {opening.moderatedAt && (
                <div className="field">
                  <div className="label">Moderated At</div>
                  <div className="value">{formatDate(opening.moderatedAt)}</div>
                </div>
              )}
              {opening.moderationNotes && (
                <div className="field">
                  <div className="label">Moderation Notes</div>
                  <div className="value">{opening.moderationNotes}</div>
                </div>
              )}
            </Section>
          )}

          {/* Edit Button */}
          {hasPermission('openings', 'edit') && onEdit && (
            <Section>
              <EditButton onClick={() => onEdit(opening)}>
                <FontAwesomeIcon icon={faEdit} />
                Edit Opening
              </EditButton>
            </Section>
          )}
        </Content>
      </Modal>
    </Overlay>
  );
};

export default OpeningDetailsModal;
