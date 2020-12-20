import React from 'react';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';

const PageContainer: React.FC<{ className?: string }> = ({ children, className }) => (
  <StyledContainer className={className}>{children}</StyledContainer>
);

const StyledContainer = styled(Container)`
  margin-top: 7%;
  margin-bottom: 7%;
`;

export default PageContainer;