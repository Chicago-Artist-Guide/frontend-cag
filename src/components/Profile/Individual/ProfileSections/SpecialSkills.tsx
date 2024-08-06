import React from 'react';
import styled from 'styled-components';
import { colors } from '../../../../theme/styleVars';
import { Container } from 'styled-bootstrap-grid';

const SpecialSkills: React.FC<{
  checkboxes: string[];
  manual: string[];
}> = ({ checkboxes, manual }) => {
  const skills = checkboxes.concat(manual);
  return (
    <Container>
      <Flex>
        {skills.map((skill: string) => (
          <SkillBadge key={`skills-primary-${skill}`}>{skill}</SkillBadge>
        ))}
      </Flex>
    </Container>
  );
};

const SkillBadge = styled.div`
  color: ${colors.white};
  background-color: ${colors.orange};
  padding: 5px 15px 5px;
  text-align: center;
  border-radius: 20px;
  margin-right: 10px;
`;

const Flex = styled.div`
  display: flex;
  margin: 20px 0px 20px;
`;

const Bold = styled.p`
  font-weight: bolder;
  font-size: 20px;
`;

export default SpecialSkills;
