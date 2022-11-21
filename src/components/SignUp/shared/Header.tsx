import React from 'react';
import styled from 'styled-components';
import { Title, TitleThree, TitleTwo } from '../../layout';

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
`;

export default SignUpHeader;
