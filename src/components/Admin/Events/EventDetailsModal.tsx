/**
 * EventDetailsModal - View full event information
 *
 * Displays all event details including moderation info.
 * Logs event_view action for audit trail.
 */

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { isUpcomingEventDate } from '../../../utils/dates';
import {
  faTimes,
  faMapMarkerAlt,
  faCalendarAlt,
  faClock,
  faDollarSign,
  faExternalLinkAlt,
  faEdit,
  faImage
} from '@fortawesome/free-solid-svg-icons';
import { colors } from '../../../theme/styleVars';
import { Event } from '../../../types/event';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { useAdminActions } from '../../../hooks/useAdminActions';

interface EventDetailsModalProps {
  event: Event;
  onClose: () => void;
  onEdit?: (event: Event) => void;
}

const Modal = styled.div`
  background: white;
  border-radius: 16px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
`;

const EventImage = styled.div`
  width: 100%;
  height: 200px;
  background: ${colors.bodyBg};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .placeholder {
    color: ${colors.lightGrey};
    font-size: 3rem;
  }
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

  .event-name {
    font-family: var(--font-montserrat), sans-serif;
    font-size: 1.75rem;
    font-weight: 700;
    color: ${colors.slate};
    margin-bottom: 0.5rem;
  }

  .event-datetime {
    font-size: 1.125rem;
    color: ${colors.grayishBlue};
    display: flex;
    gap: 1rem;
    align-items: center;

    svg {
      color: ${colors.mint};
    }
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
const Section = styled.div`
  margin-bottom: 2rem;

  .section-title {
    font-family: var(--font-montserrat), sans-serif;
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
      font-family: var(--font-montserrat), sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      color: ${colors.grayishBlue};
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.25rem;
    }

    .value {
      font-family: var(--font-open-sans), sans-serif;
      font-size: 1rem;
      color: ${colors.slate};
      line-height: 1.6;
    }
  }
`;
const Badge = styled.span<{ variant?: string }>`
  display: inline-block;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-family: var(--font-montserrat), sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: capitalize;

  ${(props) => {
    switch (props.variant) {
      case 'published':
        return `
          background: rgba(130, 178, 154, 0.1);
          color: ${colors.mint};
        `;
      case 'draft':
        return `
          background: rgba(76, 113, 128, 0.1);
          color: ${colors.cornflower};
        `;
      case 'cancelled':
        return `
          background: rgba(225, 123, 96, 0.1);
          color: ${colors.salmon};
        `;
      case 'upcoming':
        return `
          background: rgba(130, 178, 154, 0.1);
          color: ${colors.mint};
        `;
      case 'past':
        return `
          background: ${colors.bodyBg};
          color: ${colors.grayishBlue};
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
  font-family: var(--font-montserrat), sans-serif;
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
  font-family: var(--font-montserrat), sans-serif;
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

/**
 * Check if event is upcoming. Delegates to the shared dates util so the
 * local-time fix and "today is still upcoming" semantics stay consistent
 * with the public /events page and EventsManagement.
 */
function isUpcoming(event: Event): boolean {
  return isUpcomingEventDate(event.date);
}

const EventDetailsModal: React.FC<
  React.PropsWithChildren<EventDetailsModalProps>
> = ({ event, onClose, onEdit }) => {
  const { hasPermission } = useAdminAuth();
  const { logAction } = useAdminActions();

  // Log view action
  useEffect(() => {
    logAction({
      action_type: 'event_view',
      target_type: 'event',
      target_id: event.id,
      target_name: event.name
    });
  }, [event.id, event.name, logAction]);

  const formatDate = (timestamp: { toDate?: () => Date } | undefined) => {
    if (!timestamp?.toDate) return 'N/A';
    return timestamp.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const upcoming = isUpcoming(event);

  return (
    <div
      onClick={onClose}
      className="z-1000 fixed bottom-0 left-0 right-0 top-0 flex items-center justify-center bg-[rgba(0,_0,_0,_0.5)] p-[1rem]"
    >
      <Modal onClick={(e) => e.stopPropagation()}>
        {/* Event Image */}
        <EventImage>
          {event.image ? (
            <img
              src={event.image}
              alt={event.name}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="placeholder">
              <FontAwesomeIcon icon={faImage} />
            </div>
          )}
        </EventImage>

        <Header>
          <div className="title-section">
            <div className="event-name">{event.name}</div>
            <div className="event-datetime">
              {event.date && (
                <>
                  <FontAwesomeIcon icon={faCalendarAlt} />
                  {event.date}
                </>
              )}
              {event.time && (
                <>
                  <FontAwesomeIcon icon={faClock} />
                  {event.time}
                </>
              )}
            </div>
          </div>
          <button className="close-button" onClick={onClose}>
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </Header>

        <div className="p-[2rem]">
          {/* Status Badges */}
          <Section>
            <div className="flex flex-wrap gap-[0.5rem]">
              <Badge variant={event.status || 'published'}>
                {event.status || 'published'}
              </Badge>
              <Badge variant={upcoming ? 'upcoming' : 'past'}>
                {upcoming ? 'upcoming' : 'past'}
              </Badge>
            </div>
          </Section>

          {/* Details */}
          {event.details && (
            <Section>
              <div className="section-title">Details</div>
              <div className="field">
                <div className="value">{event.details}</div>
              </div>
            </Section>
          )}

          {/* Location and Price */}
          {(event.location || event.price) && (
            <Section>
              <div className="section-title">Event Info</div>
              <MetaInfo>
                {event.location && (
                  <div className="meta-item">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    <span className="meta-value">{event.location}</span>
                  </div>
                )}
                {event.price && (
                  <div className="meta-item">
                    <FontAwesomeIcon icon={faDollarSign} />
                    <span className="meta-value">{event.price}</span>
                  </div>
                )}
              </MetaInfo>
            </Section>
          )}

          {/* External Link */}
          {event.externalUrl && (
            <Section>
              <div className="section-title">Links</div>
              <LinkButton
                href={event.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Event Page / Tickets
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </LinkButton>
            </Section>
          )}

          {/* Image URL */}
          {event.image && (
            <Section>
              <div className="section-title">Image</div>
              <div className="field">
                <div className="label">Image URL</div>
                <div className="value" style={{ wordBreak: 'break-all' }}>
                  {event.image}
                </div>
              </div>
            </Section>
          )}

          {/* Metadata */}
          <Section>
            <div className="section-title">Metadata</div>
            {event.createdBy && (
              <div className="field">
                <div className="label">Created By</div>
                <div className="value">{event.createdBy}</div>
              </div>
            )}
            <div className="field">
              <div className="label">Created</div>
              <div className="value">{formatDate(event.createdAt)}</div>
            </div>
            {event.updatedAt && (
              <div className="field">
                <div className="label">Updated</div>
                <div className="value">{formatDate(event.updatedAt)}</div>
              </div>
            )}
          </Section>

          {/* Moderation Info */}
          {event.moderated && (
            <Section>
              <div className="section-title">Moderation Info</div>
              <div className="field">
                <div className="label">Moderated</div>
                <div className="value">Yes</div>
              </div>
              {event.moderatedBy && (
                <div className="field">
                  <div className="label">Moderated By</div>
                  <div className="value">{event.moderatedBy}</div>
                </div>
              )}
              {event.moderatedAt && (
                <div className="field">
                  <div className="label">Moderated At</div>
                  <div className="value">{formatDate(event.moderatedAt)}</div>
                </div>
              )}
              {event.moderationNotes && (
                <div className="field">
                  <div className="label">Moderation Notes</div>
                  <div className="value">{event.moderationNotes}</div>
                </div>
              )}
            </Section>
          )}

          {/* Edit Button */}
          {hasPermission('events', 'edit') && onEdit && (
            <Section>
              <EditButton onClick={() => onEdit(event)}>
                <FontAwesomeIcon icon={faEdit} />
                Edit Event
              </EditButton>
            </Section>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EventDetailsModal;
