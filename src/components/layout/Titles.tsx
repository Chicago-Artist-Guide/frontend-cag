import React from 'react';
import styled from 'styled-components';
import { fonts } from '../../theme/styleVars';

const Title = (props: any) => {
  const { children, ...rest } = props;
  return <h1 {...rest}>{children}</h1>;
};

const TitleTwo = (props: any) => {
  const { children, ...rest } = props;
  return <TitleH2 {...rest}>{children}</TitleH2>;
};

const Tagline = (props: any) => {
  const { children, ...rest } = props;
  return <TaglineH2 {...rest}>{children}</TaglineH2>;
};

const TaglineTwo = (props: any) => {
  const { children, ...rest } = props;
  return <TaglineH3 {...rest}>{children}</TaglineH3>;
};

const TitleThree = (props: any) => {
  const { children, ...rest } = props;
  return <TitleH3 {...rest}>{children}</TitleH3>;
};

const TitleH2 = styled.h2`
  font-family: ${fonts.lora};
  font-size: 1.75rem;
  font-weight: 400;
`;

const TaglineH2 = styled(TitleH2 as any)`
  margin-bottom: 40px;
`;
const TaglineH3 = styled(TitleH2 as any)`
  margin-top: 40px;
  font-size: 0.8rem;
`;

const TitleH3 = styled.h3`
  font-size: 1.25rem;
  font-weight: bold;
`;

export { Tagline, TaglineTwo, Title, TitleThree, TitleTwo };
