import React from 'react';
import styled from 'styled-components';
import { colors } from '../../../../theme/styleVars';
import { Container } from 'styled-bootstrap-grid';

const OffStageSkills: React.FC<{
  offstage_roles_general: string[];
  offstage_roles_production: string[];
  offstage_roles_scenic_and_properties: string[];
  offstage_roles_lighting: string[];
  offstage_roles_sound: string[];
  offstage_roles_hair_makeup_costumes: string[];
}> = ({
  offstage_roles_general,
  offstage_roles_production,
  offstage_roles_scenic_and_properties,
  offstage_roles_lighting,
  offstage_roles_sound,
  offstage_roles_hair_makeup_costumes
}) => {
  const sections = [
    {
      id: 1,
      roles: offstage_roles_general,
      title: 'General'
    },
    {
      id: 2,
      roles: offstage_roles_production,
      title: 'Production'
    },
    {
      id: 3,
      roles: offstage_roles_scenic_and_properties,
      title: 'Scenic'
    },
    {
      id: 4,
      roles: offstage_roles_lighting,
      title: 'Lighting'
    },
    {
      id: 5,
      roles: offstage_roles_sound,
      title: 'Sound'
    },
    {
      id: 6,
      roles: offstage_roles_hair_makeup_costumes,
      title: 'Hair and Makeup'
    }
  ];

  return (
    <Container>
      {sections.map((section) => (
        <div>
          <Bold>{section.title}</Bold>
          <ul>
            {section.roles.map((skill) => (
              <li>{skill}</li>
            ))}
          </ul>
        </div>
      ))}
    </Container>
  );
};

const Bold = styled.p`
  font-weight: 500;
  font-size: 20px;
  margin-top: 25px;
`;

export default OffStageSkills;
