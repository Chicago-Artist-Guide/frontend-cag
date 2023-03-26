import { Col, Form } from 'react-bootstrap';
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

  &:hover:not(.disabled) {
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

  &.disabled {
    opacity: 0.5;
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

export const CAGFormControl = styled(Form.Control)`
  border-radius: 4px;
  padding: 8px 13px 8px 13px;
`;

export const CAGFormSelect = styled(Form.Select)`
  border-radius: 4px;
  padding: 8px 13px 8px 13px;
`;

export const CAGFormGroup = styled(Form.Group)`
  margin: 25px 0 0;
  display: flex;
  flex-direction: column;
`;

export const CAGLabel = styled(Form.Label)`
  color: ${colors.mainFont};
  font-family: ${fonts.mainFont};
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.5px;
  text-align: left;
`;

export const CAGError = styled.span`
  color: red;
  font-size: 12px;
`;

export const CAGHelperText = styled.div`
  font-size: 11px;
  font-style: italic;
  margin-left: 5px;
  margin-top: 8px;
`;
