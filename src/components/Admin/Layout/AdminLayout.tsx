/**
 * AdminLayout - Main layout wrapper for admin interface
 *
 * Provides a consistent layout structure for all admin pages with:
 * - Left sidebar navigation
 * - Top header with breadcrumbs and user info
 * - Main content area with role-based access protection
 */

import React, { Suspense } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';
import { colors } from '../../../theme/styleVars';

/**
 * Layout container using CSS Grid for flexible layout
 */
const LayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  grid-template-rows: 60px 1fr;
  grid-template-areas:
    'sidebar header'
    'sidebar main';
  min-height: 100vh;
  background-color: ${colors.bodyBg};
`;

/**
 * Sidebar area - fixed position
 */
const SidebarArea = styled.div`
  grid-area: sidebar;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  background-color: ${colors.slate};
  box-shadow: 2px 0 4px rgba(0, 0, 0, 0.1);
`;

/**
 * Header area - sticky at top
 */
const HeaderArea = styled.div`
  grid-area: header;
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

/**
 * Main content area - scrollable
 */
const MainArea = styled.main`
  grid-area: main;
  padding: 2rem;
  overflow-y: auto;
`;

/**
 * Loading spinner component
 */
const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  font-size: 1.2rem;
  color: ${colors.grayishBlue};
`;

/**
 * Unauthorized access message
 */
const UnauthorizedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;

  h2 {
    color: ${colors.slate};
    margin-bottom: 1rem;
    font-size: 2rem;
  }

  p {
    color: ${colors.grayishBlue};
    margin-bottom: 2rem;
    max-width: 500px;
  }

  a {
    color: ${colors.primary};
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;

/**
 * AdminLayout Component
 *
 * Protects admin routes and provides consistent layout structure.
 * Only accessible to users with admin privileges.
 */
const AdminLayout: React.FC = () => {
  const { isAdmin, loading, adminRole, permissions } = useAdminAuth();

  console.log('[AdminLayout] Render', {
    isAdmin,
    loading,
    adminRole,
    hasPermissions: !!permissions
  });

  // Show loading state while checking admin status
  if (loading) {
    console.log('[AdminLayout] Showing loading state');
    return (
      <LoadingContainer>
        <div>Loading admin interface...</div>
      </LoadingContainer>
    );
  }

  // Redirect non-admin users to home page
  if (!isAdmin) {
    console.log('[AdminLayout] ❌ Access denied - user is not admin');
    return (
      <UnauthorizedContainer>
        <h2>Access Restricted</h2>
        <p>
          This area is only accessible to authorized CAG staff members with
          admin privileges. If you believe you should have access, please
          contact your administrator.
        </p>
        <a href="/home">Return to Home</a>
      </UnauthorizedContainer>
    );
  }

  console.log('[AdminLayout] ✅ Access granted - rendering admin interface');

  // Render admin layout with sidebar, header, and content area
  return (
    <LayoutContainer>
      <SidebarArea>
        <AdminSidebar />
      </SidebarArea>
      <HeaderArea>
        <AdminHeader />
      </HeaderArea>
      <MainArea>
        <Suspense fallback={<div>Loading...</div>}>
          <Outlet />
        </Suspense>
      </MainArea>
    </LayoutContainer>
  );
};

export default AdminLayout;
