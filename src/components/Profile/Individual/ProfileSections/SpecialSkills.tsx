import React from 'react';
import { Container } from 'styled-bootstrap-grid';
import styled from 'styled-components';
import { colors } from '../../../../theme/styleVars';

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
  background-color: ${colors.salmon};
  padding: 5px 15px 5px;
  text-align: center;
  border-radius: 20px;
  margin-right: 10px;
`;

const Flex = styled.div`
  display: flex;
  margin: 20px 0px 20px;
`;

export default SpecialSkills;
