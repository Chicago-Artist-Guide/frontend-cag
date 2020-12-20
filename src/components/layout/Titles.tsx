import React from 'react';
import styled from 'styled-components';
import { fonts } from '../../theme/styleVars';

const Title = (props: any) => {
  const { children, ...rest } = props;
  return <TitleH1 {...rest}>{children}</TitleH1>;
};

const TitleTwo = (props: any) => {
  const { children, ...rest } = props;
  return <TitleH2 {...rest}>{children}</TitleH2>;
};

const Tagline = (props: any) => {
  const { children, ...rest } = props;
  return <TaglineH2 {...rest}>{children}</TaglineH2>;
};

const TitleThree = (props: any) => {
  const { children, ...rest } = props;
  return <TitleH3 {...rest}>{children}</TitleH3>;
};


const TitleH1 = styled.h1`
  font-size: 3rem;
  font-weight: bold;
  letter-spacing: 3.36px;
`;

const TitleH2 = styled.h2`
  font-family: ${fonts.lora};
  font-size: 1.75rem;
`;

const TaglineH2 = styled(TitleH2 as any)`
  margin-bottom: 40px;
`;

const TitleH3 = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
`;

export { Tagline, Title, TitleThree, TitleTwo };