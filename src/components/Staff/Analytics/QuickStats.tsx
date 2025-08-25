import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';
import { colors, fonts } from '../../../theme/styleVars';
import { AnalyticsData } from '../../../hooks/useAnalyticsData';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ accent: string }>`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-left: 4px solid ${(props) => props.accent};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }

  .stat-label {
    font-family: ${fonts.montserrat};
    color: ${colors.grayishBlue};
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
  }

  .stat-value {
    font-family: ${fonts.montserrat};
    color: ${colors.slate};
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .stat-description {
    color: ${colors.grayishBlue};
    font-size: 0.875rem;
  }

  .stat-change {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-top: 0.5rem;

    &.positive {
      background: rgba(130, 178, 154, 0.1);
      color: ${colors.mint};
    }

    &.neutral {
      background: rgba(0, 0, 0, 0.05);
      color: ${colors.grayishBlue};
    }
  }
`;

const SectionTitle = styled.h2`
  font-family: ${fonts.montserrat};
  color: ${colors.slate};
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${colors.lightestGrey};
`;

type QuickStatsProps = {
  data: AnalyticsData;
};

const QuickStats: React.FC<QuickStatsProps> = ({ data }) => {
  const { userMetrics } = data;

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return '0';
    return ((value / total) * 100).toFixed(1);
  };

  const statsCards = [
    {
      label: 'Total Users',
      value: userMetrics.totalUsers.toLocaleString(),
      description: 'Registered accounts',
      accent: colors.mint,
      change: `+${userMetrics.newUsersThisMonth} this month`,
      changeType: 'positive'
    },
    {
      label: 'Individual Artists',
      value: userMetrics.individualArtists.toLocaleString(),
      description: `${calculatePercentage(userMetrics.individualArtists, userMetrics.totalUsers)}% of users`,
      accent: colors.salmon,
      change: null,
      changeType: 'neutral'
    },
    {
      label: 'Theater Companies',
      value: userMetrics.theaterCompanies.toLocaleString(),
      description: `${calculatePercentage(userMetrics.theaterCompanies, userMetrics.totalUsers)}% of users`,
      accent: colors.cornflower,
      change: null,
      changeType: 'neutral'
    },
    {
      label: 'Active This Month',
      value: userMetrics.activeUsersThisMonth.toLocaleString(),
      description: `${calculatePercentage(userMetrics.activeUsersThisMonth, userMetrics.totalUsers)}% engagement`,
      accent: colors.butter,
      change: 'Based on logins',
      changeType: 'neutral'
    }
  ];

  return (
    <>
      <SectionTitle>Overview</SectionTitle>
      <StatsGrid>
        {statsCards.map((stat, index) => (
          <StatCard key={index} accent={stat.accent}>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-description">{stat.description}</div>
            {stat.change && (
              <div className={`stat-change ${stat.changeType}`}>
                {stat.change}
              </div>
            )}
          </StatCard>
        ))}
      </StatsGrid>
    </>
  );
};

export default QuickStats;
