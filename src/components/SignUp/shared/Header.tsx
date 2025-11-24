import React from 'react';
import styled from 'styled-components';
import { Title, TitleThree, TitleTwo } from '../../layout';
import { breakpoints } from '../../../theme/styleVars';

type Props = {
  pre?: string;
  title?: string;
  subtitle?: string;
};

const SignUpHeader: React.FC<Props> = ({ pre, title, subtitle }) => {
  return (
    <PaddingHeader className="header">
      {pre && <TitleThree>{pre}</TitleThree>}
      <Title>{title}</Title>
      {subtitle && <TitleTwo>{subtitle}</TitleTwo>}
    </PaddingHeader>
  );
};

const PaddingHeader = styled.div`
  padding: 40px 0px;

  @media (max-width: ${breakpoints.md}) {
    padding: 24px 0px;
  }
`;

export default SignUpHeader;
