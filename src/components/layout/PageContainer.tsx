import React from 'react';
import styled from 'styled-components';
import Container from 'react-bootstrap/Container';

const PageContainer: React.FC<{ className?: string }> = ({
  children,
  className
}) => <StyledContainer className={className}>{children}</StyledContainer>;

const StyledContainer = styled(Container)`
  margin-top: calc(7% + 130px);
  margin-bottom: 20%;
`;

export default PageContainer;
