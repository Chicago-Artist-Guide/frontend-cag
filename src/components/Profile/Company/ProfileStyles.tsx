import { Col } from 'react-bootstrap';
import styled from 'styled-components';
import { breakpoints, colors, fonts } from '../../../theme/styleVars';

export const LeftCol = styled(Col)`
  @media (min-width: ${breakpoints.lg}) {
    max-width: 362px;
  }
`;

export const RightCol = styled(Col)`
  @media (max-width: ${breakpoints.lg}) {
    margin-top: 40px;
  }
`;

export const Title = styled.h1`
  text-transform: uppercase;
  font-family: ${fonts.montserrat};
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 76px;
`;

export const DetailsColTitle = styled.h2`
  font-family: ${fonts.montserrat};
  font-weight: bold;
  font-size: 18px;
  line-height: 24px;

  &::after {
    content: '';
    margin-top: 8px;
    display: block;
    height: 8px;
    background: linear-gradient(
      90deg,
      ${colors.yellow} 0%,
      ${colors.mint} 100%
    );
    border-radius: 4px;
  }
`;

export const DetailsCard = styled.div`
  margin-top: 47px;
  background: ${colors.white};
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  padding: 25px 21px;
`;

export const DetailsCardItem = styled.h6`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.07em;
  margin-top: 5px;
`;

export const AdditionalPhotos = styled.div`
  margin-top: 20px;

  @media (min-width: ${breakpoints.lg}) {
    max-width: 332px;
  }
`;
