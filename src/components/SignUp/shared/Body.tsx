import React from 'react';
import { Col, ColProps } from 'react-bootstrap';
import styled from 'styled-components';

type Props = ColProps & {
  children: React.ReactNode;
};

const SignUpBody: React.FC<Props> = ({ children, ...rest }) => {
  return <StyledCol {...rest}>{children}</StyledCol>;
};

const StyledCol = styled(Col)`
  padding: 0;
`;

export default SignUpBody;
