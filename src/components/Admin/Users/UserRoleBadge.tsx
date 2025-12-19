/**
 * UserRoleBadge - Display admin role with color coding
 *
 * Color-coded badge showing user's admin role with tooltip description.
 */

import React from 'react';
import styled from 'styled-components';
import { colors } from '../../../theme/styleVars';
import { AdminRole } from '../../../types/admin';

interface UserRoleBadgeProps {
  role: Exclude<AdminRole, null>;
}

/**
 * Badge container
 */
const Badge = styled.span<{ $roleColor: string }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-family: 'Montserrat', sans-serif;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: ${(props) => props.$roleColor};
  color: white;
  cursor: help;
`;

/**
 * Get color for role
 */
const getRoleColor = (role: Exclude<AdminRole, null>): string => {
  switch (role) {
    case 'super_admin':
      return colors.salmon;
    case 'admin':
      return colors.cornflower;
    case 'moderator':
      return colors.mint;
    case 'staff':
      return colors.grayishBlue;
  }
};

/**
 * Get display label for role
 */
const getRoleLabel = (role: Exclude<AdminRole, null>): string => {
  switch (role) {
    case 'super_admin':
      return 'Super Admin';
    case 'admin':
      return 'Admin';
    case 'moderator':
      return 'Moderator';
    case 'staff':
      return 'Staff';
  }
};

/**
 * Get description for role
 */
const getRoleDescription = (role: Exclude<AdminRole, null>): string => {
  switch (role) {
    case 'super_admin':
      return 'Full system access - can manage all resources and assign admin roles';
    case 'admin':
      return 'Can manage users, companies, and openings';
    case 'moderator':
      return 'Can moderate content and approve companies';
    case 'staff':
      return 'Read-only access to analytics and reports';
  }
};

/**
 * UserRoleBadge Component
 */
const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  return (
    <Badge $roleColor={getRoleColor(role)} title={getRoleDescription(role)}>
      {getRoleLabel(role)}
    </Badge>
  );
};

export default UserRoleBadge;
