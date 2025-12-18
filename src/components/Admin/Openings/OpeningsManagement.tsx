/**
 * OpeningsManagement - Placeholder for openings/roles management
 *
 * Future: Will display all job openings, allow moderation, and manage matches.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { PageTitle, PageSubtitle } from '../shared/Typography';
import EmptyState from '../shared/EmptyState';
import { faBriefcase } from '@fortawesome/free-solid-svg-icons';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const OpeningsManagement: React.FC = () => {
  const { hasPermission } = useAdminAuth();

  // Permission check
  if (!hasPermission('openings', 'view')) {
    return <Navigate to="/staff/admin" replace />;
  }

  return (
    <Container>
      <PageTitle>Openings Management</PageTitle>
      <PageSubtitle>View and manage all role opportunities</PageSubtitle>

      <EmptyState
        icon={faBriefcase}
        title="Coming Soon"
        description="The Openings Management feature is currently under development. This will allow you to view all job openings, moderate content, and manage artist-role matches."
      />
    </Container>
  );
};

export default OpeningsManagement;
