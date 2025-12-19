/**
 * EventsManagement - Manage CAG events
 *
 * Displays all events that appear on the /events page.
 * Includes search, filtering, and CRUD operations.
 */

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapMarkerAlt,
  faCalendarAlt,
  faClock,
  faPlus
} from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { useEvents } from '../../../hooks/useEvents';
import {
  Event,
  EventSearchFilters,
  EventPagination
} from '../../../types/event';
import { PageTitle, PageSubtitle } from '../shared/Typography';
import LoadingSpinner from '../shared/LoadingSpinner';
import EventDetailsModal from './EventDetailsModal';
import EventFormModal from './EventFormModal';
import { colors } from '../../../theme/styleVars';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 2rem;
`;

const HeaderContent = styled.div``;

const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  background: ${colors.mint};
  color: white;

  &:hover {
    background: ${colors.cornflower};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  svg {
    font-size: 0.875rem;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${colors.lightGrey};
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 2rem;

  &:focus {
    outline: 2px solid ${colors.mint};
    outline-offset: 2px;
  }
`;

const FiltersRow = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const FilterSelect = styled.select`
  padding: 0.5rem 1rem;
  border: 1px solid ${colors.lightGrey};
  border-radius: 8px;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;

  &:focus {
    outline: 2px solid ${colors.mint};
    outline-offset: 2px;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  position: relative;
  padding: 2rem 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 4px;
    background: linear-gradient(180deg, ${colors.mint}, ${colors.cornflower});
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }

  .label {
    font-family: 'Montserrat', sans-serif;
    font-size: 0.75rem;
    font-weight: 700;
    color: ${colors.grayishBlue};
    margin-bottom: 0.5rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .value {
    font-family: 'Montserrat', sans-serif;
    font-size: 2.5rem;
    font-weight: 700;
    color: ${colors.slate};
  }
`;

const EventGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const EventCard = styled.div`
  background: white;
  border: 1px solid ${colors.lightGrey};
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: ${colors.mint};
  }

  .event-image {
    width: 100%;
    height: 160px;
    object-fit: cover;
    background: ${colors.bodyBg};
  }

  .event-content {
    padding: 1.5rem;
  }

  .event-name {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.125rem;
    font-weight: 600;
    color: ${colors.slate};
    margin-bottom: 0.75rem;
  }

  .event-details {
    font-size: 0.875rem;
    color: ${colors.slate};
    line-height: 1.5;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .meta {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    font-size: 0.75rem;
    color: ${colors.grayishBlue};
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid ${colors.bodyBg};

    .meta-item {
      display: flex;
      align-items: center;
      gap: 0.25rem;

      svg {
        color: ${colors.mint};
      }
    }
  }

  .badges {
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
  }

  .badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: capitalize;

    &.status-published {
      background: rgba(130, 178, 154, 0.1);
      color: ${colors.mint};
    }

    &.status-draft {
      background: rgba(76, 113, 128, 0.1);
      color: ${colors.cornflower};
    }

    &.status-cancelled {
      background: rgba(225, 123, 96, 0.1);
      color: ${colors.salmon};
    }

    &.timeframe-upcoming {
      background: rgba(130, 178, 154, 0.1);
      color: ${colors.mint};
    }

    &.timeframe-past {
      background: ${colors.bodyBg};
      color: ${colors.grayishBlue};
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: ${colors.grayishBlue};
`;

/**
 * Check if event is upcoming
 */
function isUpcoming(event: Event): boolean {
  try {
    const eventDate = new Date(event.date);
    if (isNaN(eventDate.getTime())) return false;
    return eventDate >= new Date();
  } catch {
    return false;
  }
}

const EventsManagement: React.FC = () => {
  const { hasPermission } = useAdminAuth();

  // Permission check
  if (!hasPermission('events', 'view')) {
    return <Navigate to="/admin" replace />;
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<EventSearchFilters>({
    searchTerm: '',
    status: 'all',
    timeframe: 'all',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  const [pagination] = useState<EventPagination>({
    page: 1,
    pageSize: 50,
    totalEvents: 0,
    totalPages: 0
  });

  const { events, loading, error, totalEvents, refreshEvents } = useEvents(
    filters,
    pagination
  );

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);

  // Debounce search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setTimeout(() => {
      setFilters((prev) => ({ ...prev, searchTerm: value }));
    }, 300);
  };

  // Handle add new event
  const handleAddClick = () => {
    setSelectedEvent(null);
    setShowFormModal(true);
  };

  // Handle event card click
  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowDetailsModal(true);
  };

  // Handle edit from details modal
  const handleEditClick = (event: Event) => {
    setShowDetailsModal(false);
    setSelectedEvent(event);
    setShowFormModal(true);
  };

  // Handle form success (add or edit)
  const handleFormSuccess = () => {
    refreshEvents();
  };

  // Count by status
  const publishedCount = events.filter(
    (e) => e.status === 'published' || !e.status
  ).length;
  const draftCount = events.filter((e) => e.status === 'draft').length;
  const upcomingCount = events.filter(isUpcoming).length;

  return (
    <Container>
      <HeaderRow>
        <HeaderContent>
          <PageTitle>Events</PageTitle>
          <PageSubtitle>
            Manage events that appear on the /events page
          </PageSubtitle>
        </HeaderContent>
        {hasPermission('events', 'edit') && (
          <AddButton onClick={handleAddClick}>
            <FontAwesomeIcon icon={faPlus} />
            Add Event
          </AddButton>
        )}
      </HeaderRow>

      <SearchBar
        type="text"
        placeholder="Search by event name, location, or details..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <FiltersRow>
        <FilterSelect
          value={filters.status}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              status: e.target.value as EventSearchFilters['status']
            }))
          }
        >
          <option value="all">All Statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="cancelled">Cancelled</option>
        </FilterSelect>

        <FilterSelect
          value={filters.timeframe}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              timeframe: e.target.value as EventSearchFilters['timeframe']
            }))
          }
        >
          <option value="all">All Events</option>
          <option value="upcoming">Upcoming</option>
          <option value="past">Past</option>
        </FilterSelect>

        <FilterSelect
          value={filters.sortBy}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              sortBy: e.target.value as EventSearchFilters['sortBy']
            }))
          }
        >
          <option value="date">Sort by Date</option>
          <option value="name">Sort by Name</option>
          <option value="created">Sort by Created</option>
        </FilterSelect>

        <FilterSelect
          value={filters.sortOrder}
          onChange={(e) =>
            setFilters((prev) => ({
              ...prev,
              sortOrder: e.target.value as EventSearchFilters['sortOrder']
            }))
          }
        >
          <option value="desc">Descending</option>
          <option value="asc">Ascending</option>
        </FilterSelect>
      </FiltersRow>

      <StatsGrid>
        <StatCard>
          <div className="label">Total Events</div>
          <div className="value">{loading ? '-' : totalEvents}</div>
        </StatCard>
        <StatCard>
          <div className="label">Published</div>
          <div className="value">{loading ? '-' : publishedCount}</div>
        </StatCard>
        <StatCard>
          <div className="label">Drafts</div>
          <div className="value">{loading ? '-' : draftCount}</div>
        </StatCard>
        <StatCard>
          <div className="label">Upcoming</div>
          <div className="value">{loading ? '-' : upcomingCount}</div>
        </StatCard>
      </StatsGrid>

      {loading && <LoadingSpinner message="Loading events..." />}

      {error && (
        <div style={{ color: colors.salmon, padding: '2rem' }}>{error}</div>
      )}

      {!loading && !error && (
        <EventGrid>
          {events.map((event) => (
            <EventCard key={event.id} onClick={() => handleEventClick(event)}>
              {event.image && (
                <img
                  src={event.image}
                  alt={event.name}
                  className="event-image"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="event-content">
                <div className="event-name">{event.name}</div>
                {event.details && (
                  <div className="event-details">{event.details}</div>
                )}

                <div className="badges">
                  <span
                    className={`badge status-${event.status || 'published'}`}
                  >
                    {event.status || 'published'}
                  </span>
                  <span
                    className={`badge timeframe-${isUpcoming(event) ? 'upcoming' : 'past'}`}
                  >
                    {isUpcoming(event) ? 'upcoming' : 'past'}
                  </span>
                </div>

                <div className="meta">
                  {event.date && (
                    <div className="meta-item">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                      {event.date}
                    </div>
                  )}
                  {event.time && (
                    <div className="meta-item">
                      <FontAwesomeIcon icon={faClock} />
                      {event.time}
                    </div>
                  )}
                  {event.location && (
                    <div className="meta-item">
                      <FontAwesomeIcon icon={faMapMarkerAlt} />
                      {event.location}
                    </div>
                  )}
                </div>
              </div>
            </EventCard>
          ))}
        </EventGrid>
      )}

      {!loading && !error && events.length === 0 && (
        <EmptyState>No events found matching your search.</EmptyState>
      )}

      {/* Modals */}
      {showDetailsModal && selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedEvent(null);
          }}
          onEdit={handleEditClick}
        />
      )}

      {showFormModal && (
        <EventFormModal
          event={selectedEvent}
          onClose={() => {
            setShowFormModal(false);
            setSelectedEvent(null);
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </Container>
  );
};

export default EventsManagement;
