import styled from 'styled-components';
import { fonts, colors } from '../../../theme/styleVars';

export const PreviewCard = styled.div`
  height: auto;
  display: block;
  padding: 26px 12% 26px 32px;
  background: ${colors.blush};
  border-radius: 8px;
  margin-bottom: 45px;

  h2 {
    font-family: ${fonts.montserrat};
    font-weight: 700;
    font-size: 28px;
    line-height: 36px;
    text-transform: uppercase;
  }

  p {
    font-family: ${fonts.montserrat};
    font-weight: 500;
    font-size: 24px;
    line-height: 32px;
  }

  div {
    display: flex;
    align-items: center;
  }

  a {
    font-family: ${fonts.montserrat};
    font-weight: 700;
    font-size: 14px;
    line-height: 16px;
    text-transform: uppercase;
    color: ${colors.dark};
    margin-left: 21px;
  }
`;
