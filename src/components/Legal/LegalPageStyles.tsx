'use client';

import styled from 'styled-components';
import { fonts } from '../../theme/styleVars';
import PageContainer from '../layout/PageContainer';

export const TermsContainer = styled(PageContainer)`
  h3 {
    font-size: 20px;
  }
`;

export const PrivacyContainer = styled(PageContainer)`
  h3 {
    font-size: 20px;
  }
  background: transparent !important;
`;

export const BodyText = styled.div`
  color: #595959 !important;
  font-size: 14px !important;
  margin-top: 20px;
`;

export const Subtitle = styled.div`
  color: #595959 !important;
  font-size: 14px !important;
  font-weight: bold;
`;

export const Heading1 = styled.div`
  font-size: 19px !important;
  color: #000000 !important;
  font-weight: bold;
  margin-top: 40px;
`;

export const Heading2 = styled.div`
  font-size: 17px !important;
  color: #000000 !important;
  font-weight: bold;
  margin-top: 20px;
`;

export const NavLink = styled.a`
  font-size: 14px !important;
  word-break: break-word !important;
`;

export const LegalList = styled.ul`
  font-family: ${fonts.mainFont};
  font-size: 16px;
  font-weight: 400;
  letter-spacing: 0.5px;
  line-height: 24px;
  margin-bottom: 1rem;
  margin-top: 0;
`;
