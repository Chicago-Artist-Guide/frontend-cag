import React from 'react';
import { Navigate } from 'react-router-dom';
import { useStaffAuth } from '../../../hooks/useStaffAuth';
import styled from 'styled-components';
import { colors } from '../../../theme/styleVars';

const UnauthorizedMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 2rem;
  text-align: center;

  h2 {
    color: ${colors.slate};
    margin-bottom: 1rem;
  }

  p {
    color: ${colors.grayishBlue};
  }
`;

type StaffRouteProps = {
  children: React.ReactNode;
};

const StaffRoute: React.FC<StaffRouteProps> = ({ children }) => {
  const { isStaff } = useStaffAuth();

  if (!isStaff) {
    return (
      <UnauthorizedMessage>
        <h2>Access Restricted</h2>
        <p>This area is only accessible to authorized CAG staff members.</p>
      </UnauthorizedMessage>
    );
  }

  return <>{children}</>;
};

export default StaffRoute;
