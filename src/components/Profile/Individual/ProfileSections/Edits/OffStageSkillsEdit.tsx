import React from 'react';
import styled from 'styled-components';
import { colors } from '../../../../../theme/styleVars';
import { Container } from 'styled-bootstrap-grid';
import { hasNonEmptyValues } from '../../../../../utils/hasNonEmptyValues';

const OffStageSkillsEdit: React.FC<{
  offstage_roles_general?: string[];
  offstage_roles_production?: string[];
  offstage_roles_scenic_and_properties?: string[];
  offstage_roles_lighting?: string[];
  offstage_roles_sound?: string[];
  offstage_roles_hair_makeup_costumes?: string[];
}> = ({
  offstage_roles_general,
  offstage_roles_production,
  offstage_roles_scenic_and_properties,
  offstage_roles_lighting,
  offstage_roles_sound,
  offstage_roles_hair_makeup_costumes
}) => {
  return (
    <Container>
      <Bold>General</Bold>

      <Bold>Production</Bold>

      <Bold>Scenic</Bold>

      <Bold>Lighting</Bold>

      <Bold>Sound</Bold>

      <Bold>Hair, Makeup and Costumes</Bold>
    </Container>
  );
};

const Bold = styled.p`
  font-weight: 500;
  font-size: 20px;
  margin-top: 25px;
`;

export default OffStageSkillsEdit;
