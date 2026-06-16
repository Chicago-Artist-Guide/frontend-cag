import React from 'react';
import { Container } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import { colors } from '../../../../theme/styleVars';
import { hasNonEmptyValues } from '../../../../utils/hasNonEmptyValues';

const OffStageSkills: React.FC<
  React.PropsWithChildren<{
    offstage_roles_general?: Array<string>;
    offstage_roles_production?: Array<string>;
    offstage_roles_scenic_and_properties?: Array<string>;
    offstage_roles_lighting?: Array<string>;
    offstage_roles_sound?: Array<string>;
    offstage_roles_hair_makeup_costumes?: Array<string>;
  }>
> = ({
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
          <p className="mt-[25px] text-[20px] font-medium">General</p>
          <div className="mx-0 mb-[20px] mt-[20px] flex">
            {offstage_roles_general?.map((skill: string) => (
              <SkillBadge key={skill}>{skill}</SkillBadge>
            ))}
          </div>
        </>
      )}
      {hasNonEmptyValues(
        offstage_roles_production?.map((role) => ({ value: role })) || []
      ) && (
        <>
          <p className="mt-[25px] text-[20px] font-medium">Production</p>
          <div className="mx-0 mb-[20px] mt-[20px] flex">
            {offstage_roles_production?.map((skill: string) => (
              <SkillBadge key={skill}>{skill}</SkillBadge>
            ))}
          </div>
        </>
      )}
      {hasNonEmptyValues(
        offstage_roles_scenic_and_properties?.map((role) => ({
          value: role
        })) || []
      ) && (
        <>
          <p className="mt-[25px] text-[20px] font-medium">Scenic</p>
          <div className="mx-0 mb-[20px] mt-[20px] flex">
            {offstage_roles_scenic_and_properties?.map((skill: string) => (
              <SkillBadge key={skill}>{skill}</SkillBadge>
            ))}
          </div>
        </>
      )}
      {hasNonEmptyValues(
        offstage_roles_lighting?.map((role) => ({ value: role })) || []
      ) && (
        <>
          <p className="mt-[25px] text-[20px] font-medium">Lighting</p>
          <div className="mx-0 mb-[20px] mt-[20px] flex">
            {offstage_roles_lighting?.map((skill: string) => (
              <SkillBadge key={skill}>{skill}</SkillBadge>
            ))}
          </div>
        </>
      )}
      {hasNonEmptyValues(
        offstage_roles_sound?.map((role) => ({ value: role })) || []
      ) && (
        <>
          <p className="mt-[25px] text-[20px] font-medium">Sound</p>
          <div className="mx-0 mb-[20px] mt-[20px] flex">
            {offstage_roles_sound?.map((skill: string) => (
              <SkillBadge key={skill}>{skill}</SkillBadge>
            ))}
          </div>
        </>
      )}
      {hasNonEmptyValues(
        offstage_roles_hair_makeup_costumes?.map((role) => ({ value: role })) ||
          []
      ) && (
        <>
          <p className="mt-[25px] text-[20px] font-medium">
            Hair, Makeup and Costumes
          </p>
          <div className="mx-0 mb-[20px] mt-[20px] flex">
            {offstage_roles_hair_makeup_costumes?.map((skill: string) => (
              <SkillBadge key={skill}>{skill}</SkillBadge>
            ))}
          </div>
        </>
      )}
    </Container>
  );
};
const SkillBadge = styled.div`
  color: ${colors.white};
  background-color: ${colors.mint};
  padding: 5px 15px 5px;
  text-align: center;
  border-radius: 20px;
  margin-right: 10px;
  margin-left: 10px;
`;
export default OffStageSkills;
