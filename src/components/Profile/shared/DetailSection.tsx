import React from 'react';
import styled from 'styled-components';
import { colors, fonts } from '../../../theme/styleVars';

const DetailSection: React.FC<
  React.PropsWithChildren<{ title: string; children: React.ReactNode }>
> = ({ title, children }) => {
  return (
    <div className="mt-[39px]">
      <DetailSectionTitle>{title}</DetailSectionTitle>
      {children}
    </div>
  );
};
const DetailSectionTitle = styled.h3`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 500;
  font-size: 24px;
  line-height: 32px;
  letter-spacing: 0.07em;
  color: ${colors.mainFont};
`;

export default DetailSection;
