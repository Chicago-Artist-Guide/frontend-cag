/**
 * CompanyManagement - Main container for theatre company management
 *
 * Displays list of all theatre companies with search, filtering, and management.
 * Also shows pending theatre sign-up requests that can be approved/rejected.
 */

import React, { useState, useRef, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faInbox } from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import {
  useCompanies,
  useTheatreRequests,
  CompanySearchFilters,
  CompanyPagination,
  CompanyData,
  TheatreRequest
} from '../../../hooks/useCompanies';
import { PageTitle, PageSubtitle } from '../shared/Typography';
import LoadingSpinner from '../shared/LoadingSpinner';
import AdminButton from '../shared/AdminButton';
import CompanyCard from './CompanyCard';
import CompanyDetailsModal from './CompanyDetailsModal';
import CompanyEditModal from './CompanyEditModal';
import CompanyCreateModal from './CompanyCreateModal';
import TheatreRequestCard from './TheatreRequestCard';
import TheatreRequestModal from './TheatreRequestModal';
import { colors } from '../../../theme/styleVars';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
`;

const TitleSection = styled.div``;

const SearchBar = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid ${colors.lightGrey};
  border-radius: 8px;
  font-size: 1rem;
  margin-bottom: 1.5rem;

  &:focus {
    outline: 2px solid ${colors.mint};
    outline-offset: 2px;
  }
`;

const TabRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 2px solid ${colors.lightGrey};
  padding-bottom: 0;
`;

const Tab = styled.button<{ $active?: boolean }>`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: ${(props) => (props.$active ? colors.mint : colors.grayishBlue)};
  cursor: pointer;
  border-bottom: 3px solid
    ${(props) => (props.$active ? colors.mint : 'transparent')};
  margin-bottom: -2px;
  transition: all 0.2s ease;

  &:hover {
    color: ${colors.mint};
  }
`;

const TabBadge = styled.span`
  background: ${colors.salmon};
  color: white;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 0.125rem 0.5rem;
  border-radius: 10px;
  margin-left: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .label {
    font-size: 0.875rem;
    color: ${colors.grayishBlue};
    margin-bottom: 0.5rem;
    text-transform: uppercase;
  }

  .value {
    font-size: 2rem;
    font-weight: 700;
    color: ${colors.slate};
  }
`;

const CompanyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const RequestsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem;
  color: ${colors.grayishBlue};

  svg {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
    color: ${colors.slate};
  }
`;

const ErrorMessage = styled.div`
  color: ${colors.salmon};
  padding: 2rem;
  text-align: center;
`;

const CompanyManagement: React.FC = () => {
  const { hasPermission, permissions } = useAdminAuth();

  // Permission check
  if (!hasPermission('companies', 'view')) {
    return <Navigate to="/admin" replace />;
  }

  // Tab state
  const [activeTab, setActiveTab] = useState<'companies' | 'requests'>(
    'companies'
  );

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CompanySearchFilters>({
    searchTerm: '',
    status: 'all',
    profileComplete: 'all',
    sortBy: 'created',
    sortOrder: 'desc'
  });

  const [pagination] = useState<CompanyPagination>({
    page: 1,
    pageSize: 50
  });

  // Debounce timer ref
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Modal state
  const [selectedCompany, setSelectedCompany] = useState<CompanyData | null>(
    null
  );
  const [selectedRequest, setSelectedRequest] = useState<TheatreRequest | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);

  // Data hooks
  const { companies, loading, error, totalCompanies, refreshCompanies } =
    useCompanies(filters, pagination);
  const {
    requests,
    loading: requestsLoading,
    refreshRequests
  } = useTheatreRequests();

  // Debounce search - properly clear previous timeout
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);

    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for filter update
    searchTimeoutRef.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, searchTerm: value }));
    }, 300);
  }, []);

  // Company card click
  const handleCompanyClick = (company: CompanyData) => {
    setSelectedCompany(company);
    setShowDetailsModal(true);
  };

  // Request card click
  const handleRequestClick = (request: TheatreRequest) => {
    setSelectedRequest(request);
    setShowRequestModal(true);
  };

  // Edit from details modal
  const handleEditClick = () => {
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  // Close all modals
  const handleCloseModals = () => {
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowCreateModal(false);
    setShowRequestModal(false);
    setSelectedCompany(null);
    setSelectedRequest(null);
  };

  // Success handlers
  const handleEditSuccess = () => {
    refreshCompanies();
    handleCloseModals();
  };

  const handleCreateSuccess = () => {
    refreshCompanies();
    handleCloseModals();
  };

  const handleRequestAction = () => {
    refreshRequests();
    refreshCompanies();
    handleCloseModals();
  };

  // Stats - only calculate when not loading
  const activeCount = loading ? 0 : companies.filter((c) => !c.disabled).length;
  const disabledCount = loading
    ? 0
    : companies.filter((c) => c.disabled).length;

  const canCreate = permissions?.companies.edit;
  const canApprove = permissions?.companies.approve;

  return (
    <Container>
      <HeaderRow>
        <TitleSection>
          <PageTitle>Theatre Companies</PageTitle>
          <PageSubtitle>
            Manage theatre company accounts and sign-up requests
          </PageSubtitle>
        </TitleSection>
        {canCreate && (
          <AdminButton
            variant="primary"
            icon={faPlus}
            onClick={() => setShowCreateModal(true)}
          >
            Add Company
          </AdminButton>
        )}
      </HeaderRow>

      <TabRow>
        <Tab
          $active={activeTab === 'companies'}
          onClick={() => setActiveTab('companies')}
        >
          Companies
        </Tab>
        {canApprove && (
          <Tab
            $active={activeTab === 'requests'}
            onClick={() => setActiveTab('requests')}
          >
            Pending Requests
            {requests.length > 0 && <TabBadge>{requests.length}</TabBadge>}
          </Tab>
        )}
      </TabRow>

      {activeTab === 'companies' && (
        <>
          <SearchBar
            type="text"
            placeholder="Search by company name, email, or contact..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />

          <StatsGrid>
            <StatCard>
              <div className="label">Total Companies</div>
              <div className="value">{loading ? '-' : totalCompanies}</div>
            </StatCard>
            <StatCard>
              <div className="label">Active</div>
              <div className="value">{loading ? '-' : activeCount}</div>
            </StatCard>
            <StatCard>
              <div className="label">Disabled</div>
              <div className="value">{loading ? '-' : disabledCount}</div>
            </StatCard>
            {canApprove && (
              <StatCard>
                <div className="label">Pending Requests</div>
                <div className="value">
                  {requestsLoading ? '-' : requests.length}
                </div>
              </StatCard>
            )}
          </StatsGrid>

          {loading && <LoadingSpinner message="Loading companies..." />}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          {!loading && !error && companies.length > 0 && (
            <CompanyGrid>
              {companies.map((company) => (
                <CompanyCard
                  key={company.accountId}
                  company={company}
                  onClick={() => handleCompanyClick(company)}
                />
              ))}
            </CompanyGrid>
          )}

          {!loading && !error && companies.length === 0 && (
            <EmptyState>
              <h3>No companies found</h3>
              <p>
                {searchTerm
                  ? 'Try adjusting your search terms.'
                  : 'No theatre companies have been registered yet.'}
              </p>
            </EmptyState>
          )}
        </>
      )}

      {activeTab === 'requests' && canApprove && (
        <>
          {requestsLoading && <LoadingSpinner message="Loading requests..." />}

          {!requestsLoading && requests.length > 0 && (
            <RequestsList>
              {requests.map((request) => (
                <TheatreRequestCard
                  key={request.id}
                  request={request}
                  onClick={() => handleRequestClick(request)}
                />
              ))}
            </RequestsList>
          )}

          {!requestsLoading && requests.length === 0 && (
            <EmptyState>
              <FontAwesomeIcon icon={faInbox} />
              <h3>No pending requests</h3>
              <p>All theatre sign-up requests have been processed.</p>
            </EmptyState>
          )}
        </>
      )}

      {/* Modals */}
      {selectedCompany && showDetailsModal && (
        <CompanyDetailsModal
          company={selectedCompany}
          onClose={handleCloseModals}
          onEdit={handleEditClick}
        />
      )}

      {selectedCompany && showEditModal && (
        <CompanyEditModal
          company={selectedCompany}
          onClose={handleCloseModals}
          onSuccess={handleEditSuccess}
        />
      )}

      {showCreateModal && (
        <CompanyCreateModal
          onClose={handleCloseModals}
          onSuccess={handleCreateSuccess}
        />
      )}

      {selectedRequest && showRequestModal && (
        <TheatreRequestModal
          request={selectedRequest}
          onClose={handleCloseModals}
          onSuccess={handleRequestAction}
        />
      )}
    </Container>
  );
};

export default CompanyManagement;
