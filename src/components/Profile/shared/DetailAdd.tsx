import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';
import { colors, fonts } from '../../../theme/styleVars';

const DetailAdd: React.FC<{ text: string; onClick?: () => void }> = ({
  text,
  onClick
}) => {
  return (
    <Button className="d-flex align-items-center ml-1" onClick={onClick}>
      <Icon icon={faPlus} />
      <Text>{text}</Text>
    </Button>
  );
};

const Button = styled.div`
  cursor: pointer;
`;

const Icon = styled(FontAwesomeIcon)`
  color: ${colors.primary};
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

export default DetailAdd;
