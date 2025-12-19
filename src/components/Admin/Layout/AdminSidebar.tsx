/**
 * AdminSidebar - Navigation sidebar for admin interface
 *
 * Displays navigation links to different admin sections based on user's role and permissions.
 * Only shows sections the user has permission to access.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faChartBar,
  faUsers,
  faBriefcase,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '../../../hooks/useAdminAuth';
import { colors, fonts } from '../../../theme/styleVars';
import { hasAnyPermissionOn } from '../../../utils/adminPermissions';

/**
 * Sidebar container
 */
const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: ${colors.slate};
  color: white;
`;

/**
 * Logo/branding area
 */
const SidebarHeader = styled.div`
  padding: 2rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    font-family: ${fonts.montserrat};
    font-size: 1.5rem;
    font-weight: 700;
    margin: 0;
    color: ${colors.mint};
    letter-spacing: 0.05em;
  }

  p {
    font-family: ${fonts.mainFont};
    font-size: 0.875rem;
    margin: 0.5rem 0 0 0;
    color: rgba(255, 255, 255, 0.6);
  }
`;

/**
 * Navigation menu area
 */
const NavMenu = styled.nav`
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
`;

/**
 * Navigation section (group of related links)
 */
const NavSection = styled.div`
  margin-bottom: 1.5rem;

  &:last-child {
    margin-bottom: 0;
  }
`;

/**
 * Section title
 */
const SectionTitle = styled.div`
  padding: 1rem 1.5rem 0.5rem;
  font-family: ${fonts.montserrat};
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(255, 255, 255, 0.5);
`;

/**
 * Navigation link
 */
const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.875rem 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.25s ease;
  border-left: 3px solid transparent;
  font-family: ${fonts.mainFont};
  font-size: 0.9375rem;
  font-weight: 500;

  &:hover {
    background-color: rgba(130, 178, 154, 0.1);
    color: ${colors.mint};
    padding-left: 1.75rem;
  }

  &.active {
    background-color: rgba(130, 178, 154, 0.15);
    color: ${colors.mint};
    border-left-color: ${colors.mint};
    font-weight: 600;
  }

  svg {
    width: 20px;
    height: 20px;
  }

  span {
    margin-left: 0.75rem;
  }
`;

/**
 * Footer area with user info
 */
const SidebarFooter = styled.div`
  padding: 1rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-family: ${fonts.mainFont};
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.7);

  .role-badge {
    display: inline-block;
    padding: 0.375rem 0.75rem;
    background-color: ${colors.mint};
    color: white;
    border-radius: 6px;
    font-family: ${fonts.montserrat};
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 0.5rem;
  }
`;

/**
 * AdminSidebar Component
 */
const AdminSidebar: React.FC = () => {
  const { adminRole, permissions } = useAdminAuth();

  // Get role display name
  const getRoleLabel = (role: string | null): string => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'moderator':
        return 'Moderator';
      case 'staff':
        return 'Staff';
      default:
        return 'User';
    }
  };

  return (
    <SidebarContainer>
      <SidebarHeader>
        <h2>CAG Admin</h2>
        <p>Management Console</p>
      </SidebarHeader>

      <NavMenu>
        {/* Dashboard - always visible to all admins */}
        <NavSection>
          <StyledNavLink to="/admin" end>
            <FontAwesomeIcon icon={faChartLine} />
            <span>Dashboard</span>
          </StyledNavLink>
        </NavSection>

        {/* Analytics - visible to all staff */}
        {permissions?.analytics.view && (
          <NavSection>
            <SectionTitle>Analytics</SectionTitle>
            <StyledNavLink to="/admin/analytics">
              <FontAwesomeIcon icon={faChartBar} />
              <span>Analytics</span>
            </StyledNavLink>
          </NavSection>
        )}

        {/* User Management - visible to those who can manage users */}
        {hasAnyPermissionOn(adminRole, 'users') && (
          <NavSection>
            <SectionTitle>User Management</SectionTitle>
            <StyledNavLink to="/admin/users">
              <FontAwesomeIcon icon={faUsers} />
              <span>All Users</span>
            </StyledNavLink>
          </NavSection>
        )}

        {/* Openings Management - visible to those with openings permissions */}
        {hasAnyPermissionOn(adminRole, 'openings') && (
          <NavSection>
            <SectionTitle>Current Openings</SectionTitle>
            <StyledNavLink to="/admin/openings">
              <FontAwesomeIcon icon={faBriefcase} />
              <span>All Openings</span>
            </StyledNavLink>
          </NavSection>
        )}

        {/* Events Management - visible to those with events permissions */}
        {hasAnyPermissionOn(adminRole, 'events') && (
          <NavSection>
            <SectionTitle>Events</SectionTitle>
            <StyledNavLink to="/admin/events">
              <FontAwesomeIcon icon={faCalendarAlt} />
              <span>All Events</span>
            </StyledNavLink>
          </NavSection>
        )}
      </NavMenu>

      <SidebarFooter>
        <div>Logged in as Admin</div>
        {adminRole && (
          <div className="role-badge">{getRoleLabel(adminRole)}</div>
        )}
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default AdminSidebar;
