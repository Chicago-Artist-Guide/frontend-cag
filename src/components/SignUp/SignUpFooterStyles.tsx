import styled from 'styled-components';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import { colors, fonts } from '../../theme/styleVars';

export const PageFooterRow = styled(Row)`
  padding-top: 100px;
`;

export const ButtonCol = styled(Col)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
`;

export const Pagination = styled.ul`
  align-items: center;
  display: flex;
  height: 100%;
  justify-content: center;
  margin: 0;
  padding: 0;
  width: 100%;

  li {
    list-style-type: none;
    display: flex;
    align-items: center;
    justify-content: center;

    span {
      background-color: ${colors.paginationGray};
      border-radius: 50%;
      height: 32px;
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: ${fonts.montserrat};
      font-size: 12px;
    }

    &:after {
      content: "";
      width: 28px;
      height: 1px;
      background-color: ${colors.italicColor};
      display: block;
    }

    &:last-child:after {
      display: none;
    }

    &.complete span {
      background: ${colors.banana};
    }

    &.active span {
      background-color: ${colors.butter};
    }
  }
`;
