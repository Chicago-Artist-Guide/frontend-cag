import React from 'react';
import styled from 'styled-components';
import { colors } from '../../../../theme/styleVars';
import { Container } from 'styled-bootstrap-grid';
import { hasNonEmptyValues } from '../../../../utils/hasNonEmptyValues';

const OffStageSkills: React.FC<{
  offstage_roles_general?: Array<string>;
  offstage_roles_production?: Array<string>;
  offstage_roles_scenic_and_properties?: Array<string>;
  offstage_roles_lighting?: Array<string>;
  offstage_roles_sound?: Array<string>;
  offstage_roles_hair_makeup_costumes?: Array<string>;
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
      {hasNonEmptyValues(
        offstage_roles_general?.map((role) => ({ value: role })) || []
      ) && (
        <>
          <Bold>General</Bold>
          <Flex>
            {offstage_roles_general?.map((skill: string) => (
              <SkillBadge>{skill}</SkillBadge>
            ))}
          </Flex>
        </>
      )}
      {hasNonEmptyValues(
        offstage_roles_production?.map((role) => ({ value: role })) || []
      ) && (
        <>
          <Bold>Production</Bold>
          <Flex>
            {offstage_roles_production?.map((skill: string) => (
              <SkillBadge>{skill}</SkillBadge>
            ))}
          </Flex>
        </>
      )}
      {hasNonEmptyValues(
        offstage_roles_scenic_and_properties?.map((role) => ({
          value: role
        })) || []
      ) && (
        <>
          <Bold>Scenic</Bold>
          <Flex>
            {offstage_roles_scenic_and_properties?.map((skill: string) => (
              <SkillBadge>{skill}</SkillBadge>
            ))}
          </Flex>
        </>
      )}
      {hasNonEmptyValues(
        offstage_roles_lighting?.map((role) => ({ value: role })) || []
      ) && (
        <>
          <Bold>Lighting</Bold>
          <Flex>
            {offstage_roles_lighting?.map((skill: string) => (
              <SkillBadge>{skill}</SkillBadge>
            ))}
          </Flex>
        </>
      )}
      {hasNonEmptyValues(
        offstage_roles_sound?.map((role) => ({ value: role })) || []
      ) && (
        <>
          <Bold>Sound</Bold>
          <Flex>
            {offstage_roles_sound?.map((skill: string) => (
              <SkillBadge>{skill}</SkillBadge>
            ))}
          </Flex>
        </>
      )}
      {hasNonEmptyValues(
        offstage_roles_hair_makeup_costumes?.map((role) => ({ value: role })) ||
          []
      ) && (
        <>
          <Bold>Hair, Makeup and Costumes</Bold>
          <Flex>
            {offstage_roles_hair_makeup_costumes?.map((skill: string) => (
              <SkillBadge>{skill}</SkillBadge>
            ))}
          </Flex>
        </>
      )}
    </Container>
  );
};

const Bold = styled.p`
  font-weight: 500;
  font-size: 20px;
  margin-top: 25px;
`;

const SkillBadge = styled.div`
  color: ${colors.white};
  background-color: ${colors.mint};
  padding: 5px 15px 5px;
  text-align: center;
  border-radius: 20px;
  margin-right: 10px;
  margin-left: 10px;
`;

const Flex = styled.div`
  display: flex;
  margin: 20px 0px 20px;
`;

export default OffStageSkills;
