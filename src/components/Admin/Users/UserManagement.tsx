/**
 * UserManagement - Main container for user management interface
 *
 * Displays list of all users with search, filtering, and management capabilities.
 */

import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { useUsers } from '../../../hooks/useUsers';
import {
  UserSearchFilters,
  UserPagination,
  CombinedUserData
} from '../../../types/user';
import { PageTitle, PageSubtitle } from '../shared/Typography';
import LoadingSpinner from '../shared/LoadingSpinner';
import UserDetailsModal from './UserDetailsModal';
import UserEditModal from './UserEditModal';
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

const UserGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const UserCard = styled.div`
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

  .avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${colors.mint}, ${colors.cornflower});
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: 700;
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .name {
    font-size: 1.125rem;
    font-weight: 600;
    color: ${colors.slate};
    margin-bottom: 0.25rem;
  }

  .email {
    font-size: 0.875rem;
    color: ${colors.grayishBlue};
    margin-bottom: 0.5rem;
  }

  .type {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: ${colors.bodyBg};
    border-radius: 4px;
    font-size: 0.75rem;
    text-transform: capitalize;
  }

  .role-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    background: ${colors.mint};
    color: white;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    margin-left: 0.5rem;
  }
`;

const UserManagement: React.FC = () => {
  const { hasPermission } = useAdminAuth();

  // Permission check
  if (!hasPermission('users', 'view')) {
    return <Navigate to="/staff/admin" replace />;
  }

  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserSearchFilters>({
    searchTerm: '',
    accountType: 'all',
    adminRole: 'all',
    completedProfile: 'all',
    sortBy: 'created',
    sortOrder: 'desc'
  });

  const [pagination, setPagination] = useState<UserPagination>({
    page: 1,
    pageSize: 20,
    totalUsers: 0,
    totalPages: 0
  });

  const [selectedUser, setSelectedUser] = useState<CombinedUserData | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { users, loading, error, totalUsers, refreshUsers } = useUsers(
    filters,
    pagination
  );

  // Debounce search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setTimeout(() => {
      setFilters((prev) => ({ ...prev, searchTerm: value }));
    }, 300);
  };

  // Handle user card click
  const handleUserClick = (user: CombinedUserData) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  // Handle edit click
  const handleEditClick = () => {
    setShowDetailsModal(false);
    setShowEditModal(true);
  };

  // Handle edit success
  const handleEditSuccess = () => {
    refreshUsers();
  };

  // Handle modal close
  const handleCloseModals = () => {
    setShowDetailsModal(false);
    setShowEditModal(false);
    setSelectedUser(null);
  };

  // Get user initials for avatar
  const getInitials = (user: CombinedUserData): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.theater_name) {
      return user.theater_name.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return '??';
  };

  // Get display name
  const getDisplayName = (user: CombinedUserData): string => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.theater_name) {
      return user.theater_name;
    }
    if (user.email) {
      return user.email;
    }
    return 'Unknown User';
  };

  // Get role label
  const getRoleLabel = (role: string): string => {
    const labels: Record<string, string> = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      moderator: 'Moderator',
      staff: 'Staff'
    };
    return labels[role] || role;
  };

  // Count by type
  const individualCount = users.filter((u) => u.type === 'individual').length;
  const companyCount = users.filter((u) => u.type === 'company').length;

  return (
    <Container>
      <PageTitle>User Management</PageTitle>
      <PageSubtitle>View and manage all user accounts</PageSubtitle>

      <SearchBar
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={(e) => handleSearch(e.target.value)}
      />

      <StatsGrid>
        <StatCard>
          <div className="label">Total Users</div>
          <div className="value">{loading ? '-' : totalUsers}</div>
        </StatCard>
        <StatCard>
          <div className="label">Individual Artists</div>
          <div className="value">{loading ? '-' : individualCount}</div>
        </StatCard>
        <StatCard>
          <div className="label">Theater Companies</div>
          <div className="value">{loading ? '-' : companyCount}</div>
        </StatCard>
      </StatsGrid>

      {loading && <LoadingSpinner message="Loading users..." />}

      {error && (
        <div style={{ color: colors.salmon, padding: '2rem' }}>{error}</div>
      )}

      {!loading && !error && (
        <UserGrid>
          {users.map((user) => (
            <UserCard key={user.uid} onClick={() => handleUserClick(user)}>
              <div className="avatar">{getInitials(user)}</div>
              <div className="name">{getDisplayName(user)}</div>
              <div className="email">{user.email || 'No email'}</div>
              <div>
                <span className="type">{user.type}</span>
                {user.admin_role && (
                  <span className="role-badge">
                    {getRoleLabel(user.admin_role)}
                  </span>
                )}
              </div>
            </UserCard>
          ))}
        </UserGrid>
      )}

      {!loading && !error && users.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem',
            color: colors.grayishBlue
          }}
        >
          No users found matching your search.
        </div>
      )}

      {/* Modals */}
      {selectedUser && showDetailsModal && (
        <UserDetailsModal
          user={selectedUser}
          onClose={handleCloseModals}
          onEdit={handleEditClick}
        />
      )}

      {selectedUser && showEditModal && (
        <UserEditModal
          user={selectedUser}
          onClose={handleCloseModals}
          onSuccess={handleEditSuccess}
        />
      )}
    </Container>
  );
};

export default UserManagement;
