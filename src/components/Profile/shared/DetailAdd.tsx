import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React from 'react';
import styled from 'styled-components';
import { breakpoints, colors, fonts } from '../../../theme/styleVars';

const DetailAdd: React.FC<{
  text: string;
  onClick?: () => void;
}> = ({ text, onClick }) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button
      className="d-flex align-items-center ml-1"
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
      <Text>{text}</Text>
    </Button>
  );
};

const Button = styled.div`
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  &:hover {
    opacity: 0.8;
  }

  &:active {
    opacity: 0.6;
  }

  /* Medium screens: white button */
  @media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md}) {
    padding: 12px 16px;
    min-height: 44px;
    border-radius: 8px;
    background: ${colors.white};
    box-shadow: 0 0 4px 2px ${colors.black05a};
    margin-left: 0;
    margin-top: 8px;
    touch-action: manipulation;
    -webkit-touch-callout: none;
    border: 1px solid ${colors.lightGrey};
    justify-content: center;
    width: 100%;

    &:hover {
      opacity: 1;
      background: ${colors.lightestGrey};
      border-color: ${colors.lighterGrey};
      box-shadow: 0 2px 8px 2px ${colors.black05a};
      transform: translateY(-1px);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 1px 4px 1px ${colors.black05a};
    }
  }

  /* Small screens: enhanced white button */
  @media (max-width: ${breakpoints.sm}) {
    padding: 14px 20px;
    min-height: 48px;
    border-radius: 12px;
    background: ${colors.white};
    border: 1px solid ${colors.lightGrey};
    box-shadow: 0 2px 8px 4px ${colors.black05a};
    margin-left: 0;
    margin-top: 8px;
    touch-action: manipulation;
    -webkit-touch-callout: none;
    justify-content: center;
    width: 100%;

    &:hover {
      background: ${colors.lightestGrey};
      border-color: ${colors.lighterGrey};
      box-shadow: 0 4px 12px 4px ${colors.black05a};
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
      box-shadow: 0 2px 6px 2px ${colors.black05a};
    }
  }
`;

const Icon = styled(FontAwesomeIcon)`
  color: ${colors.cornflower};
  margin-right: 5px;
  transition: all 0.2s ease;

  /* Medium screens: keep cornflower color */
  @media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md}) {
    margin-right: 8px;
    font-size: 18px;
  }

  /* Small screens: dark grey icon */
  @media (max-width: ${breakpoints.sm}) {
    color: ${colors.darkGrey};
    font-size: 20px;
    margin-right: 10px;
  }
`;

const Text = styled.span`
  font-family: ${fonts.lora};
  font-style: italic;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.4px;
  color: ${colors.italicColor};
  transition: color 0.2s ease;

  /* Medium screens: dark grey, normal style */
  @media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md}) {
    font-size: 16px;
    line-height: 20px;
    font-weight: 600;
    color: ${colors.darkGrey};
    font-style: normal;
  }

  /* Small screens: dark grey, uppercase, bold */
  @media (max-width: ${breakpoints.sm}) {
    font-family: ${fonts.montserrat};
    font-size: 16px;
    font-weight: 700;
    color: ${colors.darkGrey};
    text-transform: uppercase;
    letter-spacing: 0.1em;
    font-style: normal;
  }
`;

export default DetailAdd;
