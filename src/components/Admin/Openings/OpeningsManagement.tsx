/**
 * OpeningsManagement - Manage CAG job openings
 *
 * Displays all CAG-specific job postings (staff, volunteers, board positions)
 * that appear on the /get-involved page. Includes search, filtering, and moderation.
 */

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBriefcase,
  faMapMarkerAlt,
  faDollarSign
} from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { useOpenings } from '../../../hooks/useOpenings';
import {
  OpeningSearchFilters,
  OpeningPagination,
  RoleOpportunity
} from '../../../types/opening';
import { PageTitle, PageSubtitle } from '../shared/Typography';
import LoadingSpinner from '../shared/LoadingSpinner';
import OpeningDetailsModal from './OpeningDetailsModal';
import OpeningEditModal from './OpeningEditModal';
import { colors } from '../../../theme/styleVars';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
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

const OpeningGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const OpeningCard = styled.div`
  background: white;
  border: 1px solid ${colors.lightGrey};
  border-radius: 12px;
  padding: 1.5rem;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: translateY(-2px);
    border-color: ${colors.mint};
  }

  .role-name {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.125rem;
    font-weight: 600;
    color: ${colors.slate};
    margin-bottom: 0.5rem;
  }

  .production-name {
    font-size: 0.875rem;
    color: ${colors.grayishBlue};
    margin-bottom: 1rem;
  }

  .description {
    font-size: 0.875rem;
    color: ${colors.slate};
    line-height: 1.5;
    margin-bottom: 1rem;
    display: -webkit-box;
    -webkit-line-clamp: 3;
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

    &.type {
      background: ${colors.bodyBg};
      color: ${colors.slate};
    }

    &.status-open {
      background: rgba(130, 178, 154, 0.1);
      color: ${colors.mint};
    }

    &.status-closed {
      background: rgba(225, 123, 96, 0.1);
      color: ${colors.salmon};
    }
  }
`;

const OpeningsManagement: React.FC = () => {
  const { hasPermission } = useAdminAuth();

  // Permission check
  if (!hasPermission('openings', 'view')) {
    return <Navigate to="/staff/admin" replace />;
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<OpeningSearchFilters>({
    searchTerm: '',
    roleType: 'all',
    status: 'all',
    location: 'all',
    sortBy: 'created',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState<OpeningPagination>({
    page: 1,
    pageSize: 20,
    totalOpenings: 0,
    totalPages: 0
  });

  const { openings, loading, error, totalOpenings, refreshOpenings } =
    useOpenings(filters, pagination);

  const [selectedOpening, setSelectedOpening] =
    useState<RoleOpportunity | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Debounce search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setTimeout(() => {
      setFilters((prev) => ({ ...prev, searchTerm: value }));
    }, 300);
  };

  // Handle opening card click
  const handleOpeningClick = (opening: RoleOpportunity) => {
    setSelectedOpening(opening);
    setShowDetailsModal(true);
  };

  // Handle edit from details modal
  const handleEditClick = (opening: RoleOpportunity) => {
    setShowDetailsModal(false);
    setSelectedOpening(opening);
    setShowEditModal(true);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    refreshOpenings();
  };

  // Count by status
  const openCount = openings.filter(
    (o) => o.status === 'open' || !o.status
  ).length;
  const closedCount = openings.filter((o) => o.status === 'closed').length;

  return (
    <Container>
      <PageTitle>CAG Job Openings</PageTitle>
      <PageSubtitle>
        Manage staff, volunteer, and board positions for /get-involved page
      </PageSubtitle>

      <SearchBar
        type="text"
        placeholder="Search by position title or department..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <StatsGrid>
        <StatCard>
          <div className="label">Total Positions</div>
          <div className="value">{loading ? '-' : totalOpenings}</div>
        </StatCard>
        <StatCard>
          <div className="label">Open Positions</div>
          <div className="value">{loading ? '-' : openCount}</div>
        </StatCard>
        <StatCard>
          <div className="label">Closed Positions</div>
          <div className="value">{loading ? '-' : closedCount}</div>
        </StatCard>
      </StatsGrid>

      {loading && <LoadingSpinner message="Loading job openings..." />}

      {error && (
        <div style={{ color: colors.salmon, padding: '2rem' }}>{error}</div>
      )}

      {!loading && !error && (
        <OpeningGrid>
          {openings.map((opening) => (
            <OpeningCard
              key={opening.id}
              onClick={() => handleOpeningClick(opening)}
            >
              <div className="role-name">{opening.roleName}</div>
              <div className="production-name">{opening.productionName}</div>
              {opening.description && (
                <div className="description">{opening.description}</div>
              )}

              <div className="badges">
                {opening.roleType && (
                  <span className="badge type">{opening.roleType}</span>
                )}
                <span className={`badge status-${opening.status || 'open'}`}>
                  {opening.status || 'open'}
                </span>
              </div>

              <div className="meta">
                {opening.location && (
                  <div className="meta-item">
                    <FontAwesomeIcon icon={faMapMarkerAlt} />
                    {opening.location}
                  </div>
                )}
                {opening.pay && (
                  <div className="meta-item">
                    <FontAwesomeIcon icon={faDollarSign} />
                    {opening.pay}
                  </div>
                )}
              </div>
            </OpeningCard>
          ))}
        </OpeningGrid>
      )}

      {!loading && !error && openings.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem',
            color: colors.grayishBlue
          }}
        >
          No job openings found matching your search.
        </div>
      )}

      {/* Modals */}
      {showDetailsModal && selectedOpening && (
        <OpeningDetailsModal
          opening={selectedOpening}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedOpening(null);
          }}
          onEdit={handleEditClick}
        />
      )}

      {showEditModal && selectedOpening && (
        <OpeningEditModal
          opening={selectedOpening}
          onClose={() => {
            setShowEditModal(false);
            setSelectedOpening(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
    </Container>
  );
};

export default OpeningsManagement;
