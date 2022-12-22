import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import Image from 'react-bootstrap/Image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';
import { colors, fonts } from '../../../theme/styleVars';
import Ribbon from '../../../images/icons-profile/ribbon.svg';

const AddAwardButton: React.FC<{
  onClick?: () => void;
}> = ({ onClick }) => {
  return (
    <Button
      className="d-flex flex-column justify-content-center align-items-center ml-1"
      onClick={onClick}
    >
      <MainIcon src={Ribbon} />
      <div className="d-flex align-items-center mt-2">
        <Icon icon={faPlus} />
        <Text>Add New</Text>
      </div>
    </Button>
  );
};

const Button = styled.div`
  cursor: pointer;
  background: ${colors.white};
  box-shadow: 0px 0px 8px 4px rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  height: 159px;
  width: 196px;
`;

const MainIcon = styled(Image)`
  color: ${colors.peach};
`;

const Icon = styled(FontAwesomeIcon)`
  color: ${colors.cornflower};
  margin-right: 5px;
`;

const Text = styled.span`
  font-family: ${fonts.lora};
  color: ${colors.italicColor}
  font-style: italic;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.4px;
`;

export default AddAwardButton;
