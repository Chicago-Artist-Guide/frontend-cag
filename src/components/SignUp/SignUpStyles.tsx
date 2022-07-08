import { Col } from 'react-bootstrap';
import styled from 'styled-components';
import { cardHeight, colors, fonts } from '../../theme/styleVars';

export const StyledCard = styled(Col)`
  width: 273px;
  height: ${cardHeight};
  margin-left: 14px;
  margin-right: 6px;
  box-shadow: 2px 2px 10px rgba(0, 0, 29, 0.1);
  border-radius: 8px;
  background-color: ${colors.bodyBg};
  backdrop-filter: blur(15px);
  padding: 30px 20px 50px 20px;
  transition: all 0.1s ease-in-out;

  p {
    font-size: 20px;
    line-height: 24px;
    /* or 150% */
    letter-spacing: 0.5px;

    /* Inside Auto Layout */
    flex: none;
    order: 2;
    flex-grow: 0;
    margin: 12px 0px;
  }

  &:hover {
    scale: 1.05;
    cursor: pointer;

    &.blue-shadow-hover {
      box-shadow: 2px 2px 10px rgba(53, 86, 105, 0.65);
      &.selected {
        background: rgba(53, 86, 105, 0.65);
      }
    }

    &.green-shadow-hover {
      box-shadow: 2px 2px 10px rgba(149, 189, 168, 0.99);
      &.selected {
        background: rgba(149, 189, 168, 0.99);
      }
    }

    &.red-shadow-hover {
      box-shadow: 2px 2px 10px rgba(229, 143, 120, 0.65);
      &.selected {
        background: rgba(229, 143, 120, 0.65);
      }
    }
  }

  &.selected {
    &.blue-shadow-hover {
      background: rgba(53, 86, 105, 0.65);
    }

    &.green-shadow-hover {
      background: rgba(149, 189, 168, 0.99);
    }

    &.red-shadow-hover {
      background: rgba(229, 143, 120, 0.65);
    }
  }

  label {
    display: none;
  }
`;

export const CardHeading = styled.h3`
  width: 225px;
  font: ${fonts.montserrat}
  font-weight: 500;
  font-size: 24px;
  line-height: 28px;
  /* identical to box height, or 117% */
  letter-spacing: 0.07em;
  margin: 12px 0px;
`;

export const CardText = styled.div`
  height: calc(${cardHeight} / 2);
  margin-top: 5px;
  overflow: hidden;
`;

export const SelectDirections = styled.p`
  text-align: left;
  font-size: 14px/18px;
  letter-spacing: 0.14px;
  font: ${fonts.montserrat};
`;
