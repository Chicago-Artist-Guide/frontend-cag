import React from 'react';
import styled from 'styled-components';
import { Row, Col } from 'react-bootstrap';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { colors, fonts } from '../../../theme/styleVars';

// Type assertions for React 16 compatibility
const ResponsiveContainerFixed = ResponsiveContainer as any;
const PieChartFixed = PieChart as any;
const BarChartFixed = BarChart as any;
const CellFixed = Cell as any;
const XAxisFixed = XAxis as any;
const YAxisFixed = YAxis as any;

const DemographicsSection = styled.div`
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

const ChartContainer = styled.div`
  margin-bottom: 3rem;

  h3 {
    font-family: ${fonts.montserrat};
    color: ${colors.slate};
    font-size: 1.25rem;
    font-weight: 600;
    margin-bottom: 1.5rem;
  }
`;

const ChartGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const DataTable = styled.div`
  background: ${colors.bodyBg};
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;

  table {
    width: 100%;

    th {
      font-family: ${fonts.montserrat};
      font-weight: 600;
      color: ${colors.slate};
      padding: 0.5rem;
      text-align: left;
      border-bottom: 2px solid ${colors.lightGrey};
    }

    td {
      padding: 0.5rem;
      color: ${colors.grayishBlue};
      border-bottom: 1px solid ${colors.lightestGrey};
    }

    tr:last-child td {
      border-bottom: none;
    }
  }
`;

const CHART_COLORS = [
  colors.mint,
  colors.salmon,
  colors.cornflower,
  colors.butter,
  colors.darkGreyBlue,
  colors.peach,
  '#8B5CF6',
  '#EC4899',
  '#10B981',
  '#F59E0B'
];

type DemographicsProps = {
  data: {
    genderIdentity: Record<string, number>;
    ageRanges: Record<string, number>;
    ethnicities: Record<string, number>;
    unionStatus: Record<string, number>;
    skills: Record<string, number>;
    locations: Record<string, number>;
  };
};

const UserDemographics: React.FC<DemographicsProps> = ({ data }) => {
  // Transform data for charts
  const transformData = (obj: Record<string, number>) => {
    return Object.entries(obj)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  };

  const genderData = transformData(data.genderIdentity);
  const ageData = transformData(data.ageRanges);
  const ethnicityData = transformData(data.ethnicities).slice(0, 10); // Top 10
  const unionData = transformData(data.unionStatus);
  const topSkills = transformData(data.skills).slice(0, 15); // Top 15 skills

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            background: 'white',
            padding: '10px',
            border: `1px solid ${colors.lightGrey}`,
            borderRadius: '8px'
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>{label}</p>
          <p style={{ margin: 0, color: colors.mint }}>
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <DemographicsSection>
      <SectionTitle>User Demographics</SectionTitle>

      <ChartGrid>
        {/* Gender Identity Pie Chart */}
        <ChartContainer>
          <h3>Gender Identity</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${((percent || 0) * 100).toFixed(0)}%`
                }
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>

        {/* Age Ranges Bar Chart */}
        <ChartContainer>
          <h3>Age Ranges</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={ageData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={colors.lightestGrey}
              />
              <XAxis
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={100}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill={colors.mint} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </ChartGrid>

      {/* Ethnicities Bar Chart */}
      <ChartContainer>
        <h3>Top Ethnicities</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={ethnicityData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke={colors.lightestGrey} />
            <XAxis type="number" />
            <YAxis
              dataKey="name"
              type="category"
              width={150}
              tick={{ fontSize: 12 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="value" fill={colors.salmon} radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Union Status */}
      <ChartContainer>
        <h3>Union Affiliation</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={unionData}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.lightestGrey} />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={120}
              tick={{ fontSize: 11 }}
            />
            <YAxis />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill={colors.cornflower}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      {/* Top Skills Table */}
      <ChartContainer>
        <h3>Top Skills & Specializations</h3>
        <DataTable>
          <table>
            <thead>
              <tr>
                <th>Skill</th>
                <th>Artists</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {topSkills.map((skill, index) => {
                const total = topSkills.reduce((sum, s) => sum + s.value, 0);
                const percentage = ((skill.value / total) * 100).toFixed(1);
                return (
                  <tr key={index}>
                    <td>{skill.name}</td>
                    <td>{skill.value}</td>
                    <td>{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </DataTable>
      </ChartContainer>
    </DemographicsSection>
  );
};

export default UserDemographics;
