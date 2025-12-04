import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';
import { breakpoints, colors, fonts } from '../../../../../theme/styleVars';

const RoleSection: React.FC<{
  title: string;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ title, onClick, children }) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center flex-column flex-md-row mb-3">
        <RoleSectionTitle>{title}</RoleSectionTitle>
        <Button
          className="d-flex align-items-center ml-md-3 mt-md-0 mt-2"
          onClick={handleClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              if (onClick) {
                onClick();
              }
            }
          }}
        >
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
  transition: opacity 0.2s;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }

  @media (max-width: ${breakpoints.md}) {
    padding: 12px 16px;
    min-height: 44px;
    border-radius: 8px;
    background: ${colors.white};
    box-shadow: 0 0 4px 2px ${colors.black05a};
    margin-left: 0;
    width: 100%;
    touch-action: manipulation;
    -webkit-touch-callout: none;
  }
`;

const Icon = styled(FontAwesomeIcon)`
  color: ${colors.cornflower};
  margin-right: 5px;

  @media (max-width: ${breakpoints.md}) {
    margin-right: 8px;
    font-size: 18px;
  }
`;

const Text = styled.span`
  font-family: ${fonts.lora};
  font-style: italic;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.4px;

  @media (max-width: ${breakpoints.md}) {
    font-size: 16px;
    line-height: 20px;
    font-weight: 600;
  }
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
