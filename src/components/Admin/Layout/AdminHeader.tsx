/**
 * AdminHeader - Top header bar for admin interface
 *
 * Displays breadcrumbs, page title, and quick actions.
 * Provides context about current location in the admin interface.
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useUserContext } from '../../../context/UserContext';
import { colors, fonts } from '../../../theme/styleVars';

/**
 * Header container
 */
const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  height: 60px;
  background-color: white;
  border-bottom: 1px solid ${colors.lightGrey || '#e5e7eb'};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.04);
`;

/**
 * Breadcrumb navigation
 */
const Breadcrumbs = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-family: ${fonts.mainFont};
  font-size: 0.875rem;
  color: ${colors.grayishBlue};

  a {
    color: ${colors.cornflower};
    text-decoration: none;
    transition: all 0.2s ease;
    font-weight: 500;

    &:hover {
      color: ${colors.mint};
      text-decoration: none;
    }
  }

  .separator {
    color: ${colors.lightGrey};
    margin: 0 0.25rem;
    font-weight: 300;
  }

  .current {
    color: ${colors.slate};
    font-weight: 600;
  }
`;

/**
 * Right side actions
 */
const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

/**
 * User info display
 */
const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: ${colors.bodyBg};
  }

  .user-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(
      135deg,
      ${colors.mint} 0%,
      ${colors.cornflower} 100%
    );
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-family: ${fonts.montserrat};
    font-weight: 700;
    font-size: 0.875rem;
    box-shadow: 0 2px 8px rgba(130, 178, 154, 0.3);
  }

  .user-details {
    display: flex;
    flex-direction: column;

    .user-name {
      font-family: ${fonts.mainFont};
      font-size: 0.875rem;
      font-weight: 600;
      color: ${colors.slate};
      line-height: 1.2;
    }

    .user-email {
      font-family: ${fonts.mainFont};
      font-size: 0.75rem;
      color: ${colors.grayishBlue};
      line-height: 1.2;
    }
  }
`;

/**
 * Link button for quick actions
 */
const LinkButton = styled(Link)`
  padding: 0.625rem 1.25rem;
  background-color: white;
  border: 2px solid ${colors.mint};
  border-radius: 20px;
  color: ${colors.mint};
  text-decoration: none;
  font-family: ${fonts.montserrat};
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${colors.mint};
    border-color: ${colors.mint};
    color: white;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(130, 178, 154, 0.3);
    text-decoration: none;
  }
`;

/**
 * Generate breadcrumbs from current path
 */
const generateBreadcrumbs = (pathname: string) => {
  // Remove leading/trailing slashes and split
  const segments = pathname.split('/').filter((s) => s);

  // Build breadcrumb items
  const breadcrumbs = [];

  // Always start with Admin
  breadcrumbs.push({
    label: 'Admin',
    path: '/staff/admin'
  });

  // Map segments to readable names
  const segmentNames: Record<string, string> = {
    staff: 'Staff',
    admin: 'Admin',
    users: 'Users',
    companies: 'Companies',
    openings: 'Openings',
    analytics: 'Analytics',
    requests: 'Requests',
    roles: 'Admin Roles',
    productions: 'Productions',
    moderate: 'Moderate',
    matches: 'Matches'
  };

  // Build path incrementally
  let currentPath = '';
  segments.forEach((segment, index) => {
    // Skip 'staff' as it's not part of breadcrumb display
    if (segment === 'staff') return;
    // Skip 'admin' as we already added it
    if (segment === 'admin' && index <= 1) return;

    currentPath += `/${segment}`;
    breadcrumbs.push({
      label: segmentNames[segment] || segment,
      path: `/staff${currentPath}`
    });
  });

  return breadcrumbs;
};

/**
 * AdminHeader Component
 */
const AdminHeader: React.FC = () => {
  const location = useLocation();
  const { currentUser } = useUserContext();

  const breadcrumbs = generateBreadcrumbs(location.pathname);

  // Get user initials for avatar
  const getUserInitials = (email: string | null | undefined): string => {
    if (!email) return '?';
    return email.substring(0, 1).toUpperCase();
  };

  return (
    <HeaderContainer>
      <Breadcrumbs>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && <span className="separator">/</span>}
            {index === breadcrumbs.length - 1 ? (
              <span className="current">{crumb.label}</span>
            ) : (
              <Link to={crumb.path}>{crumb.label}</Link>
            )}
          </React.Fragment>
        ))}
      </Breadcrumbs>

      <HeaderActions>
        <LinkButton to="/home">View Site</LinkButton>
        {currentUser && (
          <UserInfo>
            <div className="user-avatar">
              {getUserInitials(currentUser.email)}
            </div>
            <div className="user-details">
              <div className="user-name">
                {currentUser.displayName || 'Admin User'}
              </div>
              <div className="user-email">{currentUser.email}</div>
            </div>
          </UserInfo>
        )}
      </HeaderActions>
    </HeaderContainer>
  );
};

export default AdminHeader;
