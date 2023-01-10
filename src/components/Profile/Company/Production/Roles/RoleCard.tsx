import { faEdit } from '@fortawesome/free-regular-svg-icons';
import React from 'react';
import { Row } from 'react-bootstrap';
import styled from 'styled-components';
import { Button } from '../../../../../genericComponents';
import { colors, fonts } from '../../../../../theme/styleVars';
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
          <div className="d-flex flex-column flex-row-reverse">
            <div
              className="d-flex flex-row flex-shrink-1 mt-1"
              style={{ gap: '1em' }}
            >
              <RoleButton
                onClick={onEdit}
                text="Edit"
                type="button"
                variant="primary"
                icon={faEdit}
              />
              <RoleButton text="View Matches" type="button" variant="primary" />
            </div>
          </div>
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
`;

export default RoleCard;
