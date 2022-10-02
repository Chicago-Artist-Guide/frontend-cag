import React from 'react';
import styled from 'styled-components';
import { Title, TitleTwo } from '../../layout';

type Props = {
  title?: string;
  subtitle?: string;
};

const SignUpHeader: React.FC<Props> = ({ title, subtitle }) => {
  return (
    <PaddingHeader className="header">
      <Title>{title}</Title>
      <TitleTwo>{subtitle}</TitleTwo>
    </PaddingHeader>
  );
};

const PaddingHeader = styled.div`
  padding: 40px 0px;
`;

export default SignUpHeader;
