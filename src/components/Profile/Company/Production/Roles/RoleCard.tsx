import { faEdit } from '@fortawesome/free-regular-svg-icons';
import React from 'react';
import { Row } from 'react-bootstrap';
import styled from 'styled-components';
import { Button } from '../../../../../components/shared';
import { breakpoints, colors, fonts } from '../../../../../theme/styleVars';
import { LeftCol, RightCol } from '../../ProfileStyles';
import { Role } from '../../types';

const RoleCard: React.FC<{
  role: Role;
  onEdit: () => void;
  onViewMatches: () => void;
}> = ({ role, onEdit, onViewMatches }) => {
  return (
    <RolesCard>
      <Row>
        <LeftCol>
          <RoleName>{role.role_name}</RoleName>
          <RoleStatus>{role.role_status}</RoleStatus>
        </LeftCol>
        <RightCol>
          <RoleButtonContainer className="d-flex flex-column flex-md-row-reverse">
            <RoleButton
              onClick={onEdit}
              text="Edit"
              type="button"
              variant="primary"
              icon={faEdit}
            />
            <RoleButton
              onClick={onViewMatches}
              text="View Matches"
              type="button"
              variant="primary"
            />
          </RoleButtonContainer>
        </RightCol>
      </Row>
    </RolesCard>
  );
};

const RolesCard = styled.div`
  margin-top: 25px;
  background: ${colors.white};
  box-shadow: 0 0 8px 4px ${colors.black05a};
  border-radius: 8px;
  padding: 25px 25px;
  max-width: 871px;
`;

const RoleStatus = styled.h3`
  height: 14px;
  font-family: ${fonts.lora};
  font-style: italic;
  font-weight: 500;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.4px;
  color: ${colors.slate};
`;

const RoleName = styled.h2`
  font-family: ${fonts.montserrat};
  font-style: normal;
  font-weight: 500;
  font-size: 18px;
  line-height: 24px;
  letter-spacing: 0.07em;
`;

const RoleButton = styled(Button)`
  background: ${colors.slate};
  border-color: ${colors.slate};
  min-height: 44px;
`;

const RoleButtonContainer = styled.div`
  gap: 1em;
  margin-top: 1em;

  @media (max-width: ${breakpoints.md}) {
    flex-direction: column;
    gap: 12px;

    button {
      width: 100%;
    }
  }
`;

export default RoleCard;
