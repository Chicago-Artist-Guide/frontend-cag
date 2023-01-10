import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';
import { fonts, colors } from '../../../../../theme/styleVars';

const RoleSection: React.FC<{
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ title, onClick, children }) => {
  return (
    <div>
      <div className="d-flex align-items-center mb-3">
        <RoleSectionTitle>{title}</RoleSectionTitle>
        <Button className="d-flex align-items-center ml-3" onClick={onClick}>
          <Icon icon={faPlus} />
          <Text>Add a new role</Text>
        </Button>
      </div>
      {children}
    </div>
  );
};

const Button = styled.div`
  cursor: pointer;
`;

const Icon = styled(FontAwesomeIcon)`
  color: ${colors.cornflower};
  margin-right: 5px;
`;

const Text = styled.span`
  font-family: ${fonts.lora};
  font-style: italic;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.4px;
`;

const RoleSectionTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 32px;
  letter-spacing: 0.07em;
  margin-bottom: 0;
  color: ${colors.mainFont};
`;

export default RoleSection;
