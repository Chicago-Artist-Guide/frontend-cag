import React from 'react';
import { Container } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import { colors } from '../../../../theme/styleVars';

const SpecialSkills: React.FC<
  React.PropsWithChildren<{
    checkboxes: string[];
    manual: string[];
  }>
> = ({ checkboxes, manual }) => {
  const skills = checkboxes.concat(manual);
  return (
    <Container>
      <div className="mx-0 mb-[20px] mt-[20px] flex">
        {skills.map((skill: string) => (
          <SkillBadge key={`skills-primary-${skill}`}>{skill}</SkillBadge>
        ))}
      </div>
    </Container>
  );
};

const SkillBadge = styled.div`
  color: ${colors.white};
  background-color: ${colors.salmon};
  padding: 5px 15px 5px;
  text-align: center;
  border-radius: 20px;
  margin-right: 10px;
`;
export default SpecialSkills;
