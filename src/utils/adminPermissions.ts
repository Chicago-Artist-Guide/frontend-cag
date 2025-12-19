/**
 * Admin permission utility functions
 *
 * SECURITY WARNING: These functions are for UI/UX purposes only!
 * They control what UI elements users see, NOT what actions they can perform.
 *
 * Real authorization MUST be enforced server-side through:
 * - Firestore security rules
 * - Cloud Functions
 * - Backend API endpoints
 *
 * Never rely on these client-side checks for security decisions.
 */

import {
  AdminRole,
  AdminResource,
  AdminPermissions,
  PermissionCheckResult,
  FlatPermissionKey,
  ROLE_PERMISSIONS,
  ADMIN_ROLE_LEVELS,
  EMPTY_PERMISSIONS,
  ADMIN_ROLE_METADATA,
  hasAdminPrivileges
} from '../types/admin';

/**
 * Gets the complete permissions object for a given admin role
 *
 * @param role - The admin role to get permissions for
 * @returns AdminPermissions object with boolean flags for each permission
 *
 * @example
 * const permissions = getPermissionsForRole('admin');
 * if (permissions.users.edit) {
 *   // Show edit user button
 * }
 */
export function getPermissionsForRole(role: AdminRole): AdminPermissions {
  if (!hasAdminPrivileges(role)) {
    return EMPTY_PERMISSIONS;
  }

  return ROLE_PERMISSIONS[role];
}

/**
 * Checks if a given role has a specific permission on a resource
 *
 * @param role - The admin role to check
 * @param resource - The resource type (users, companies, openings, analytics)
 * @param action - The specific action (view, edit, delete, etc.)
 * @returns PermissionCheckResult with allowed status and optional reason
 *
 * @example
 * const result = checkPermission('moderator', 'users', 'edit');
 * if (result.allowed) {
 *   // Allow the action
 * } else {
 *   console.log(result.reason); // "Moderators cannot edit users"
 * }
 */
export function checkPermission(
  role: AdminRole,
  resource: AdminResource,
  action: string
): PermissionCheckResult {
  if (!hasAdminPrivileges(role)) {
    return {
      allowed: false,
      reason: 'User does not have admin privileges'
    };
  }

  const permissions = ROLE_PERMISSIONS[role];
  const resourcePermissions = permissions[resource];

  if (!resourcePermissions) {
    return {
      allowed: false,
      reason: `Invalid resource: ${resource}`
    };
  }

  // Type-safe check for the action
  if (!(action in resourcePermissions)) {
    return {
      allowed: false,
      reason: `Invalid action: ${action} for resource: ${resource}`
    };
  }

  const hasPermission =
    resourcePermissions[action as keyof typeof resourcePermissions];

  if (!hasPermission) {
    const metadata = ADMIN_ROLE_METADATA[role];
    return {
      allowed: false,
      reason: `${metadata.label} role cannot ${action} ${resource}`,
      requiredRole: findRequiredRole(resource, action)
    };
  }

  return {
    allowed: true
  };
}

/**
 * Finds the minimum role required for a specific permission
 *
 * @param resource - The resource type
 * @param action - The specific action
 * @returns The minimum admin role required, or undefined if none
 */
function findRequiredRole(
  resource: AdminResource,
  action: string
): NonNullable<AdminRole> | undefined {
  const roles: NonNullable<AdminRole>[] = [
    'staff',
    'moderator',
    'admin',
    'super_admin'
  ];

  for (const role of roles) {
    const permissions = ROLE_PERMISSIONS[role];
    const resourcePermissions = permissions[resource];

    if (
      resourcePermissions &&
      action in resourcePermissions &&
      resourcePermissions[action as keyof typeof resourcePermissions]
    ) {
      return role;
    }
  }

  return undefined;
}

/**
 * Checks if a role meets or exceeds a minimum required role level
 * Uses the role hierarchy for comparison
 *
 * @param currentRole - The role to check
 * @param minimumRole - The minimum required role level
 * @returns true if currentRole is equal to or higher than minimumRole
 *
 * @example
 * hasRoleLevel('admin', 'moderator') // returns true (admin > moderator)
 * hasRoleLevel('staff', 'admin') // returns false (staff < admin)
 */
export function hasRoleLevel(
  currentRole: AdminRole,
  minimumRole: NonNullable<AdminRole>
): boolean {
  if (!hasAdminPrivileges(currentRole)) {
    return false;
  }

  return ADMIN_ROLE_LEVELS[currentRole] >= ADMIN_ROLE_LEVELS[minimumRole];
}

/**
 * Checks if a role has any permission on a specific resource
 *
 * @param role - The admin role to check
 * @param resource - The resource type
 * @returns true if the role has any permission on the resource
 *
 * @example
 * hasAnyPermissionOn('staff', 'analytics') // true (can view)
 * hasAnyPermissionOn('staff', 'users') // false (no permissions)
 */
export function hasAnyPermissionOn(
  role: AdminRole,
  resource: AdminResource
): boolean {
  if (!hasAdminPrivileges(role)) {
    return false;
  }

  const permissions = ROLE_PERMISSIONS[role];
  const resourcePermissions = permissions[resource];

  return Object.values(resourcePermissions).some(
    (permission) => permission === true
  );
}

// ============================================================================
// Semantic Permission Helpers
// ============================================================================

/**
 * Checks if the role can manage user accounts (edit or delete)
 * UX helper only - not for security
 */
export function canManageUsers(role: AdminRole): boolean {
  if (!hasAdminPrivileges(role)) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return permissions.users.edit || permissions.users.delete;
}

/**
 * Checks if the role can approve company accounts
 * UX helper only - not for security
 */
export function canApproveCompanies(role: AdminRole): boolean {
  if (!hasAdminPrivileges(role)) return false;
  return ROLE_PERMISSIONS[role].companies.approve;
}

/**
 * Checks if the role can moderate openings
 * UX helper only - not for security
 */
export function canModerateOpenings(role: AdminRole): boolean {
  if (!hasAdminPrivileges(role)) return false;
  return ROLE_PERMISSIONS[role].openings.moderate;
}

/**
 * Checks if the role can export analytics data
 * UX helper only - not for security
 */
export function canExportAnalytics(role: AdminRole): boolean {
  if (!hasAdminPrivileges(role)) return false;
  return ROLE_PERMISSIONS[role].analytics.export;
}

/**
 * Checks if the role can manage admin roles (super_admin only)
 * UX helper only - not for security
 */
export function canManageRoles(role: AdminRole): boolean {
  if (!hasAdminPrivileges(role)) return false;
  return ROLE_PERMISSIONS[role].users.manageRoles;
}

/**
 * Checks if the role can delete any type of resource
 * UX helper only - not for security
 */
export function canDeleteAny(role: AdminRole): boolean {
  if (!hasAdminPrivileges(role)) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return (
    permissions.users.delete ||
    permissions.companies.delete ||
    permissions.openings.delete
  );
}

// ============================================================================
// Display Helpers
// ============================================================================

/**
 * Gets a human-readable description of a role
 */
export function getRoleDescription(role: NonNullable<AdminRole>): string {
  return ADMIN_ROLE_METADATA[role].description;
}

/**
 * Gets a display name for a role
 */
export function getRoleDisplayName(role: NonNullable<AdminRole>): string {
  return ADMIN_ROLE_METADATA[role].label;
}

/**
 * Gets the badge color for a role
 */
export function getRoleColor(role: NonNullable<AdminRole>): string {
  return ADMIN_ROLE_METADATA[role].color;
}

/**
 * Lists all permissions for a given role as human-readable strings
 * Useful for displaying what a role can do
 *
 * @param role - The admin role
 * @returns Array of human-readable permission descriptions
 *
 * @example
 * getPermissionsList('moderator')
 * // Returns: ['View users', 'View companies', 'View openings', 'Moderate openings', ...]
 */
export function getPermissionsList(role: NonNullable<AdminRole>): string[] {
  const permissions = ROLE_PERMISSIONS[role];
  const list: string[] = [];

  // Helper to format action names
  const formatAction = (action: string): string => {
    return action.charAt(0).toUpperCase() + action.slice(1);
  };

  // Users permissions
  if (permissions.users.view) list.push('View users');
  if (permissions.users.edit) list.push('Edit users');
  if (permissions.users.delete) list.push('Delete users');
  if (permissions.users.manageRoles) list.push('Manage admin roles');

  // Companies permissions
  if (permissions.companies.view) list.push('View companies');
  if (permissions.companies.edit) list.push('Edit companies');
  if (permissions.companies.delete) list.push('Delete companies');
  if (permissions.companies.approve) list.push('Approve companies');

  // Openings permissions
  if (permissions.openings.view) list.push('View openings');
  if (permissions.openings.edit) list.push('Edit openings');
  if (permissions.openings.delete) list.push('Delete openings');
  if (permissions.openings.moderate) list.push('Moderate openings');

  // Analytics permissions
  if (permissions.analytics.view) list.push('View analytics');
  if (permissions.analytics.export) list.push('Export analytics');

  return list;
}

/**
 * Gets a summary of what resources a role can access
 *
 * @param role - The admin role
 * @returns Object mapping resources to access level (none, view, manage)
 */
export function getResourceAccessSummary(
  role: AdminRole
): Record<AdminResource, 'none' | 'view' | 'manage'> {
  if (!hasAdminPrivileges(role)) {
    return {
      users: 'none',
      companies: 'none',
      openings: 'none',
      events: 'none',
      analytics: 'none'
    };
  }

  const permissions = ROLE_PERMISSIONS[role];

  return {
    users:
      permissions.users.edit || permissions.users.delete
        ? 'manage'
        : permissions.users.view
          ? 'view'
          : 'none',
    companies:
      permissions.companies.edit || permissions.companies.delete
        ? 'manage'
        : permissions.companies.view
          ? 'view'
          : 'none',
    openings:
      permissions.openings.edit || permissions.openings.delete
        ? 'manage'
        : permissions.openings.view
          ? 'view'
          : 'none',
    events:
      permissions.events.edit || permissions.events.delete
        ? 'manage'
        : permissions.events.view
          ? 'view'
          : 'none',
    analytics: permissions.analytics.export
      ? 'manage'
      : permissions.analytics.view
        ? 'view'
        : 'none'
  };
}
