import React from 'react';
import styled from 'styled-components';
import { Row, Col, ProgressBar } from 'react-bootstrap';
import { colors, fonts } from '../../../theme/styleVars';

const EngagementSection = styled.div`
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  font-family: ${fonts.montserrat};
  color: ${colors.slate};
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 2rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid ${colors.lightestGrey};
`;

const MetricCard = styled.div`
  background: ${colors.bodyBg};
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-left: 4px solid ${colors.mint};

  h4 {
    font-family: ${fonts.montserrat};
    color: ${colors.slate};
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .metric-value {
    font-size: 2rem;
    font-weight: 700;
    color: ${colors.mint};
    margin-bottom: 0.5rem;
  }

  .metric-label {
    color: ${colors.grayishBlue};
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .progress {
    height: 10px;
    background-color: ${colors.lightestGrey};

    .progress-bar {
      background-color: ${colors.mint};
    }
  }
`;

const InsightCard = styled.div`
  background: linear-gradient(135deg, ${colors.mint}10, ${colors.salmon}10);
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 2rem;
  border: 1px solid ${colors.lightGrey};

  h4 {
    font-family: ${fonts.montserrat};
    color: ${colors.slate};
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 1rem;

    &:before {
      content: '💡';
      margin-right: 0.5rem;
    }
  }

  ul {
    margin: 0;
    padding-left: 1.5rem;

    li {
      color: ${colors.grayishBlue};
      margin-bottom: 0.5rem;
    }
  }
`;

const EngagementGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

type EngagementProps = {
  data: {
    profileCompletionRate: number;
    messagesThisMonth: number;
    productionsActive: number;
    averageProfileViews: number;
  };
};

const EngagementMetrics: React.FC<EngagementProps> = ({ data }) => {
  const metrics = [
    {
      title: 'Profile Completion Rate',
      value: `${data.profileCompletionRate}%`,
      label: 'of users have completed profiles',
      progress: data.profileCompletionRate,
      color: colors.mint
    },
    {
      title: 'Monthly Messages',
      value: data.messagesThisMonth.toLocaleString(),
      label: 'messages sent in the last 30 days',
      progress: Math.min((data.messagesThisMonth / 1000) * 100, 100),
      color: colors.salmon
    },
    {
      title: 'Active Productions',
      value: data.productionsActive,
      label: 'productions currently casting',
      progress: Math.min((data.productionsActive / 50) * 100, 100),
      color: colors.cornflower
    },
    {
      title: 'Average Profile Views',
      value: data.averageProfileViews,
      label: 'views per profile this month',
      progress: Math.min((data.averageProfileViews / 100) * 100, 100),
      color: colors.butter
    }
  ];

  // Generate insights based on data
  const generateInsights = () => {
    const insights = [];

    if (data.profileCompletionRate < 50) {
      insights.push(
        'Profile completion is below 50% - consider sending reminder emails or simplifying the onboarding process'
      );
    } else if (data.profileCompletionRate > 75) {
      insights.push(
        'Excellent profile completion rate! Users are engaged with the platform'
      );
    }

    if (data.messagesThisMonth > 500) {
      insights.push(
        'High message activity indicates strong user engagement and networking'
      );
    }

    if (data.productionsActive < 10) {
      insights.push(
        'Low number of active productions - consider outreach to theater companies'
      );
    }

    if (data.averageProfileViews < 20) {
      insights.push(
        'Profile views are low - consider implementing features to increase profile discoverability'
      );
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <EngagementSection>
      <SectionTitle>Engagement Metrics</SectionTitle>

      <EngagementGrid>
        {metrics.map((metric, index) => (
          <MetricCard key={index}>
            <h4>{metric.title}</h4>
            <div className="metric-value">{metric.value}</div>
            <div className="metric-label">{metric.label}</div>
            <ProgressBar
              now={metric.progress}
              style={{ backgroundColor: colors.lightestGrey }}
            />
          </MetricCard>
        ))}
      </EngagementGrid>

      {insights.length > 0 && (
        <InsightCard>
          <h4>Key Insights & Recommendations</h4>
          <ul>
            {insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        </InsightCard>
      )}
    </EngagementSection>
  );
};

export default EngagementMetrics;
