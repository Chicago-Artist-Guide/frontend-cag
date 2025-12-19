import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';
import { colors, fonts } from '../../../theme/styleVars';
import { useAnalyticsData } from '../../../hooks/useAnalyticsData';
import UserDemographics from './UserDemographics';
import EngagementMetrics from './EngagementMetrics';
import QuickStats from './QuickStats';
import PageContainer from '../../layout/PageContainer';
import { Title, Tagline } from '../../layout/Titles';

const DashboardHeader = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  margin-top: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  font-size: 1.2rem;
  color: ${colors.grayishBlue};
`;

const ErrorState = styled.div`
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 8px;
  padding: 1.5rem;
  margin: 2rem 0;
  color: #856404;
`;

const RefreshButton = styled.button`
  background: ${colors.mint};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  font-family: ${fonts.montserrat};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${colors.darkPrimary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(130, 178, 154, 0.3);
  }
`;

const LastUpdated = styled.div`
  text-align: right;
  color: ${colors.grayishBlue};
  font-size: 0.9rem;
  margin-top: 1rem;
`;

const AnalyticsDashboard: React.FC = () => {
  const analyticsData = useAnalyticsData();
  const { loading, error } = analyticsData;

  const handleRefresh = () => {
    window.location.reload();
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <PageContainer>
      <Row>
        <Col lg={12}>
          <Title>ANALYTICS DASHBOARD</Title>
          <Tagline>
            Track user engagement and demographics for Chicago Artist Guide
          </Tagline>
        </Col>
      </Row>

      <DashboardHeader>
        <Row className="align-items-center">
          <Col md={8}>
            <div style={{ fontSize: '1.2rem', color: colors.slate }}>
              Welcome to the CAG Admin Analytics Portal
            </div>
          </Col>
          <Col md={4} className="text-md-right">
            <RefreshButton onClick={handleRefresh}>Refresh Data</RefreshButton>
            <LastUpdated>Last updated: {currentDate}</LastUpdated>
          </Col>
        </Row>
      </DashboardHeader>

      {loading && <LoadingState>Loading analytics data...</LoadingState>}

      {error && (
        <ErrorState>
          <strong>Note:</strong> {error}
          <br />
          <small>
            This typically means you need to be logged in with proper
            permissions to view analytics data.
          </small>
        </ErrorState>
      )}

      {!loading && !error && (
        <>
          <QuickStats data={analyticsData} />

          <Row className="mt-4">
            <Col lg={12}>
              <UserDemographics data={analyticsData.demographics} />
            </Col>
          </Row>

          <Row className="mt-4">
            <Col lg={12}>
              <EngagementMetrics data={analyticsData.engagement} />
            </Col>
          </Row>
        </>
      )}
    </PageContainer>
  );
};

export default AnalyticsDashboard;
