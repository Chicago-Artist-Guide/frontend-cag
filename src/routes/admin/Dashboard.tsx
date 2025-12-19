/**
 * Admin Dashboard - Landing page for admin interface
 *
 * Provides quick stats, shortcuts to common actions, and an overview
 * of platform activity. Adapts based on user's admin role.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faChartLine,
  faUsers,
  faBriefcase,
  faCalendarAlt
} from '@fortawesome/free-solid-svg-icons';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { useAnalyticsData } from '../../hooks/useAnalyticsData';
import { colors } from '../../theme/styleVars';
import { hasAnyPermissionOn } from '../../utils/adminPermissions';

/**
 * Dashboard container
 */
const DashboardContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

/**
 * Section title (for Quick Actions heading)
 */
const SectionTitle = styled.h2`
  font-family: 'Montserrat', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: ${colors.slate};
  margin-bottom: 0.5rem;
  margin-top: 2rem;
`;

/**
 * Section subtitle
 */
const SectionSubtitle = styled.p`
  font-family: 'Open Sans', sans-serif;
  font-size: 1rem;
  color: ${colors.grayishBlue};
  margin-bottom: 2rem;
`;

/**
 * Welcome card
 */
const WelcomeCard = styled.div`
  position: relative;
  background: linear-gradient(
    135deg,
    ${colors.mint} 0%,
    ${colors.cornflower} 100%
  );
  color: white;
  padding: 2.5rem 2rem;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;

  /* Subtle pattern overlay */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(
        circle at 20% 50%,
        rgba(255, 255, 255, 0.1) 0%,
        transparent 50%
      ),
      radial-gradient(
        circle at 80% 80%,
        rgba(255, 255, 255, 0.08) 0%,
        transparent 50%
      );
    pointer-events: none;
  }

  h2 {
    font-family: 'Montserrat', sans-serif;
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 1;
  }

  p {
    font-family: 'Open Sans', sans-serif;
    font-size: 1.125rem;
    opacity: 0.95;
    margin-bottom: 1.5rem;
    position: relative;
    z-index: 1;
  }

  .role-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
    backdrop-filter: blur(10px);
    position: relative;
    z-index: 1;
  }
`;

/**
 * Quick actions grid
 */
const QuickActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

/**
 * Quick action card
 */
const QuickActionCard = styled(Link)`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 2rem 1.75rem;
  background-color: white;
  border-radius: 16px;
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;

  /* Top gradient accent bar */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(90deg, ${colors.mint}, ${colors.cornflower});
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &:hover {
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);

    &::before {
      transform: scaleX(1);
    }

    .icon-container {
      transform: scale(1.1);
    }

    .title {
      color: ${colors.mint};
      transform: scale(1.02);
    }
  }

  .icon-container {
    width: 56px;
    height: 56px;
    border-radius: 12px;
    background: linear-gradient(135deg, ${colors.mint}, ${colors.cornflower});
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1.25rem;
    transition: transform 0.3s ease;

    svg {
      font-size: 1.5rem;
      color: white;
    }
  }

  .title {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.125rem;
    font-weight: 600;
    color: ${colors.slate};
    margin-bottom: 0.5rem;
    transition: all 0.3s ease;
  }

  .description {
    font-family: 'Open Sans', sans-serif;
    font-size: 0.875rem;
    color: ${colors.grayishBlue};
    line-height: 1.6;
  }
`;

/**
 * Stats grid
 */
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

/**
 * Stat card
 */
const StatCard = styled.div`
  position: relative;
  padding: 2rem 1.5rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;

  /* Left accent border */
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

  .change {
    font-family: 'Open Sans', sans-serif;
    font-size: 0.75rem;
    margin-top: 0.5rem;
    color: ${colors.mint};
  }
`;

/**
 * Recent activity section
 */
const RecentActivitySection = styled.div`
  margin-top: 2rem;

  h3 {
    font-size: 1.25rem;
    font-weight: 600;
    color: ${colors.slate};
    margin-bottom: 1rem;
  }
`;

/**
 * Activity list
 */
const ActivityList = styled.div`
  background-color: white;
  border: 1px solid ${colors.lightGrey || '#e5e7eb'};
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  .empty-state {
    text-align: center;
    padding: 2rem;
    color: ${colors.grayishBlue};
  }
`;

/**
 * Get role display name
 */
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

/**
 * AdminDashboard Component
 */
const Dashboard: React.FC = () => {
  const { adminRole, permissions } = useAdminAuth();
  const analyticsData = useAnalyticsData();
  const { userMetrics, engagement, loading } = analyticsData;

  return (
    <DashboardContainer>
      {/* Welcome section */}
      <WelcomeCard>
        <h2>Welcome to CAG Admin</h2>
        <p>
          Manage users, companies, openings, and view analytics all in one
          place.
        </p>
        <div className="role-badge">{getRoleLabel(adminRole)}</div>
      </WelcomeCard>

      {/* Quick Stats */}
      <StatsGrid>
        <StatCard>
          <div className="label">Total Users</div>
          <div className="value">
            {loading ? '...' : userMetrics.totalUsers.toLocaleString()}
          </div>
          <div className="change">
            {loading
              ? 'Loading'
              : `+${userMetrics.newUsersThisMonth} this month`}
          </div>
        </StatCard>
        <StatCard>
          <div className="label">Individual Artists</div>
          <div className="value">
            {loading ? '...' : userMetrics.individualArtists.toLocaleString()}
          </div>
          <div className="change">
            {loading
              ? 'Loading'
              : `${userMetrics.totalUsers > 0 ? ((userMetrics.individualArtists / userMetrics.totalUsers) * 100).toFixed(1) : 0}% of users`}
          </div>
        </StatCard>
        <StatCard>
          <div className="label">Theater Companies</div>
          <div className="value">
            {loading ? '...' : userMetrics.theaterCompanies.toLocaleString()}
          </div>
          <div className="change">
            {loading
              ? 'Loading'
              : `${userMetrics.totalUsers > 0 ? ((userMetrics.theaterCompanies / userMetrics.totalUsers) * 100).toFixed(1) : 0}% of users`}
          </div>
        </StatCard>
        <StatCard>
          <div className="label">Active Productions</div>
          <div className="value">
            {loading ? '...' : engagement.productionsActive.toLocaleString()}
          </div>
          <div className="change">
            {loading ? 'Loading' : 'Currently active'}
          </div>
        </StatCard>
      </StatsGrid>

      {/* Quick Actions */}
      <SectionTitle>Quick Actions</SectionTitle>
      <SectionSubtitle>
        Common tasks and shortcuts based on your permissions
      </SectionSubtitle>

      <QuickActionsGrid>
        {/* Analytics - always visible to admins */}
        {permissions?.analytics.view && (
          <QuickActionCard to="/admin/analytics">
            <div className="icon-container">
              <FontAwesomeIcon icon={faChartLine} />
            </div>
            <div className="title">View Analytics</div>
            <div className="description">
              See platform statistics, user demographics, and engagement
              metrics.
            </div>
          </QuickActionCard>
        )}

        {/* User Management */}
        {hasAnyPermissionOn(adminRole, 'users') && (
          <QuickActionCard to="/admin/users">
            <div className="icon-container">
              <FontAwesomeIcon icon={faUsers} />
            </div>
            <div className="title">Manage Users</div>
            <div className="description">
              View and manage user accounts and profiles.
            </div>
          </QuickActionCard>
        )}

        {/* CAG Job Openings */}
        {hasAnyPermissionOn(adminRole, 'openings') && (
          <QuickActionCard to="/admin/openings">
            <div className="icon-container">
              <FontAwesomeIcon icon={faBriefcase} />
            </div>
            <div className="title">CAG Job Openings</div>
            <div className="description">
              Manage staff, volunteer, and board positions for /get-involved
              page.
            </div>
          </QuickActionCard>
        )}

        {/* Events */}
        {hasAnyPermissionOn(adminRole, 'events') && (
          <QuickActionCard to="/admin/events">
            <div className="icon-container">
              <FontAwesomeIcon icon={faCalendarAlt} />
            </div>
            <div className="title">Events</div>
            <div className="description">
              Manage events that appear on the /events page.
            </div>
          </QuickActionCard>
        )}
      </QuickActionsGrid>

      {/* Recent Activity (placeholder for future implementation) */}
      <RecentActivitySection>
        <h3>Recent Activity</h3>
        <ActivityList>
          <div className="empty-state">
            Activity tracking will be implemented in a future update.
          </div>
        </ActivityList>
      </RecentActivitySection>
    </DashboardContainer>
  );
};

export default Dashboard;
