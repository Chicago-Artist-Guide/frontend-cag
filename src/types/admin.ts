/**
 * Admin role and permissions type definitions
 *
 * This module defines the admin role hierarchy, granular permissions system,
 * and helper utilities for the Chicago Artist Guide admin interface.
 * These types are used for both client-side authorization and Firestore security rules.
 *
 * SECURITY NOTE: These types are for client-side UX only.
 * All authorization must be enforced server-side via Firestore security rules.
 * Never trust client-side permission checks for security decisions.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Available admin roles in the system
 *
 * Hierarchy (from highest to lowest):
 * - super_admin: Full system access, can manage admin roles
 * - admin: Full access except role management
 * - moderator: View all, moderate openings only
 * - staff: View analytics only
 * - null: No admin privileges
 */
export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'staff' | null;

/**
 * Resource types that can have permissions applied
 */
export type AdminResource =
  | 'users'
  | 'companies'
  | 'openings'
  | 'events'
  | 'analytics';

/**
 * Granular permission structure for admin users
 *
 * Each resource (users, companies, openings, analytics) has specific
 * permissions that control what actions an admin can perform.
 */
export interface AdminPermissions {
  /**
   * Permissions for managing individual user accounts
   */
  users: {
    /** View user profiles and account data */
    view: boolean;
    /** Edit user profile information */
    edit: boolean;
    /** Delete user accounts */
    delete: boolean;
    /** Assign and modify admin roles */
    manageRoles: boolean;
  };

  /**
   * Permissions for managing company accounts
   */
  companies: {
    /** View company profiles and data */
    view: boolean;
    /** Edit company information */
    edit: boolean;
    /** Delete company accounts */
    delete: boolean;
    /** Approve new company registrations */
    approve: boolean;
  };

  /**
   * Permissions for managing job openings and casting calls
   */
  openings: {
    /** View all openings */
    view: boolean;
    /** Edit opening details */
    edit: boolean;
    /** Delete openings */
    delete: boolean;
    /** Moderate/flag inappropriate content */
    moderate: boolean;
  };

  /**
   * Permissions for managing events
   */
  events: {
    /** View all events */
    view: boolean;
    /** Create and edit events */
    edit: boolean;
    /** Delete events */
    delete: boolean;
    /** Publish/unpublish events */
    publish: boolean;
  };

  /**
   * Permissions for analytics and reporting
   */
  analytics: {
    /** View analytics dashboards */
    view: boolean;
    /** Export analytics data */
    export: boolean;
  };
}

/**
 * Role-based permission mappings
 *
 * Defines the exact permissions granted to each admin role.
 * This is the single source of truth for permission checks.
 */
export const ROLE_PERMISSIONS: Record<
  NonNullable<AdminRole>,
  AdminPermissions
> = {
  super_admin: {
    users: {
      view: true,
      edit: true,
      delete: true,
      manageRoles: true
    },
    companies: {
      view: true,
      edit: true,
      delete: true,
      approve: true
    },
    openings: {
      view: true,
      edit: true,
      delete: true,
      moderate: true
    },
    events: {
      view: true,
      edit: true,
      delete: true,
      publish: true
    },
    analytics: {
      view: true,
      export: true
    }
  },

  admin: {
    users: {
      view: true,
      edit: true,
      delete: true,
      manageRoles: false // Only super_admin can manage roles
    },
    companies: {
      view: true,
      edit: true,
      delete: true,
      approve: true
    },
    openings: {
      view: true,
      edit: true,
      delete: true,
      moderate: true
    },
    events: {
      view: true,
      edit: true,
      delete: true,
      publish: true
    },
    analytics: {
      view: true,
      export: true
    }
  },

  moderator: {
    users: {
      view: true,
      edit: false,
      delete: false,
      manageRoles: false
    },
    companies: {
      view: true,
      edit: false,
      delete: false,
      approve: false
    },
    openings: {
      view: true,
      edit: false,
      delete: false,
      moderate: true // Moderators can flag/moderate content
    },
    events: {
      view: true,
      edit: false,
      delete: false,
      publish: false
    },
    analytics: {
      view: true,
      export: false
    }
  },

  staff: {
    users: {
      view: false,
      edit: false,
      delete: false,
      manageRoles: false
    },
    companies: {
      view: false,
      edit: false,
      delete: false,
      approve: false
    },
    openings: {
      view: false,
      edit: false,
      delete: false,
      moderate: false
    },
    events: {
      view: false,
      edit: false,
      delete: false,
      publish: false
    },
    analytics: {
      view: true, // Staff can view analytics
      export: false
    }
  }
};

/**
 * Action types for admin audit logging
 *
 * Used to track all admin actions in the system for security and compliance.
 */
export type AdminActionType =
  // User actions
  | 'user.view'
  | 'user.edit'
  | 'user.delete'
  | 'user.role.assign'
  | 'user.role.revoke'
  // Company actions
  | 'company.view'
  | 'company.edit'
  | 'company.delete'
  | 'company.approve'
  | 'company.reject'
  // Opening actions
  | 'opening.view'
  | 'opening.edit'
  | 'opening.delete'
  | 'opening.moderate'
  | 'opening.flag'
  // Event actions
  | 'event.view'
  | 'event.create'
  | 'event.edit'
  | 'event.delete'
  | 'event.publish'
  // Analytics actions
  | 'analytics.view'
  | 'analytics.export'
  // System actions
  | 'admin.login'
  | 'admin.logout';

/**
 * Admin action audit log entry
 *
 * Records every admin action for security auditing and compliance.
 * Stored in Firestore `admin_audit_logs` collection.
 */
export interface AdminAuditLog {
  /** Unique identifier for the audit log entry */
  id: string;

  /** Admin user who performed the action */
  adminUserId: string;

  /** Admin's email at time of action */
  adminEmail: string;

  /** Admin's role at time of action */
  adminRole: NonNullable<AdminRole>;

  /** Type of action performed */
  action: AdminActionType;

  /** Resource type affected */
  resource: AdminResource | 'system';

  /** ID of the specific resource affected (if applicable) */
  resourceId?: string;

  /** Additional context or metadata about the action */
  metadata?: Record<string, any>;

  /** IP address of the admin user */
  ipAddress?: string;

  /** User agent string */
  userAgent?: string;

  /** When the action was performed */
  timestamp: Timestamp;

  /** Whether the action succeeded */
  success: boolean;

  /** Error message if action failed */
  errorMessage?: string;
}

/**
 * Admin user profile extension
 *
 * Additional fields stored in the user's account document to track admin status.
 * These fields are added to the existing account document structure.
 */
export interface AdminProfile {
  /** Current admin role (if any) */
  adminRole: AdminRole;

  /** When admin role was assigned */
  adminRoleAssignedAt?: Timestamp;

  /** Who assigned the admin role */
  adminRoleAssignedBy?: string;

  /** Notes about admin role assignment */
  adminRoleNotes?: string;

  /** Whether admin account is currently active */
  adminActive: boolean;
}

/**
 * Permission check result
 *
 * Returned by permission checking utilities to provide detailed feedback.
 */
export interface PermissionCheckResult {
  /** Whether permission is granted */
  allowed: boolean;

  /** Human-readable reason for denial (if not allowed) */
  reason?: string;

  /** Required role for this permission */
  requiredRole?: NonNullable<AdminRole>;
}

/**
 * Helper type to extract specific permission keys from a resource
 */
export type PermissionKey<R extends AdminResource> = keyof AdminPermissions[R];

/**
 * Helper type for permission check parameters
 */
export interface PermissionCheckParams {
  /** Admin role to check */
  role: AdminRole;

  /** Resource being accessed */
  resource: AdminResource;

  /** Specific action on the resource */
  action: string;
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Type guard to check if a value is a valid AdminRole (excluding null)
 *
 * @param value - Value to check
 * @returns True if value is a non-null AdminRole
 */
export function isAdminRole(value: unknown): value is NonNullable<AdminRole> {
  return (
    typeof value === 'string' &&
    ['super_admin', 'admin', 'moderator', 'staff'].includes(value)
  );
}

/**
 * Type guard to check if a value is a valid AdminResource
 *
 * @param value - Value to check
 * @returns True if value is a valid AdminResource
 */
export function isAdminResource(value: unknown): value is AdminResource {
  return (
    typeof value === 'string' &&
    ['users', 'companies', 'openings', 'analytics'].includes(value)
  );
}

/**
 * Type guard to check if a user has admin privileges
 *
 * @param role - Admin role to check
 * @returns True if role is not null
 */
export function hasAdminPrivileges(
  role: AdminRole
): role is NonNullable<AdminRole> {
  return role !== null && isAdminRole(role);
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Flattened permission key for easy lookup
 * Examples: 'users.view', 'companies.delete', 'analytics.export'
 */
export type FlatPermissionKey =
  | `users.${keyof AdminPermissions['users']}`
  | `companies.${keyof AdminPermissions['companies']}`
  | `openings.${keyof AdminPermissions['openings']}`
  | `events.${keyof AdminPermissions['events']}`
  | `analytics.${keyof AdminPermissions['analytics']}`;

/**
 * Map of action types to required permissions
 * Used to determine which permission is needed for each action type
 */
export const ACTION_PERMISSION_MAP: Record<
  AdminActionType,
  FlatPermissionKey | null
> = {
  // User actions
  'user.view': 'users.view',
  'user.edit': 'users.edit',
  'user.delete': 'users.delete',
  'user.role.assign': 'users.manageRoles',
  'user.role.revoke': 'users.manageRoles',

  // Company actions
  'company.view': 'companies.view',
  'company.edit': 'companies.edit',
  'company.delete': 'companies.delete',
  'company.approve': 'companies.approve',
  'company.reject': 'companies.approve',

  // Opening actions
  'opening.view': 'openings.view',
  'opening.edit': 'openings.edit',
  'opening.delete': 'openings.delete',
  'opening.moderate': 'openings.moderate',
  'opening.flag': 'openings.moderate',

  // Event actions
  'event.view': 'events.view',
  'event.create': 'events.edit',
  'event.edit': 'events.edit',
  'event.delete': 'events.delete',
  'event.publish': 'events.publish',

  // Analytics actions
  'analytics.view': 'analytics.view',
  'analytics.export': 'analytics.export',

  // System actions (no specific permission required, just admin role)
  'admin.login': null,
  'admin.logout': null
};

/**
 * Admin role levels for hierarchy comparison
 * Higher number = more privileges
 */
export const ADMIN_ROLE_LEVELS: Record<NonNullable<AdminRole>, number> = {
  staff: 1,
  moderator: 2,
  admin: 3,
  super_admin: 4
};

/**
 * Default empty permissions (for non-admin users)
 */
export const EMPTY_PERMISSIONS: AdminPermissions = {
  users: {
    view: false,
    edit: false,
    delete: false,
    manageRoles: false
  },
  companies: {
    view: false,
    edit: false,
    delete: false,
    approve: false
  },
  openings: {
    view: false,
    edit: false,
    delete: false,
    moderate: false
  },
  events: {
    view: false,
    edit: false,
    delete: false,
    publish: false
  },
  analytics: {
    view: false,
    export: false
  }
};

/**
 * Admin metadata for display purposes
 */
export interface AdminRoleMetadata {
  /** Display name for the role */
  label: string;

  /** Brief description of role capabilities */
  description: string;

  /** Color for UI badges/indicators */
  color: string;
}

/**
 * Role metadata for UI display
 */
export const ADMIN_ROLE_METADATA: Record<
  NonNullable<AdminRole>,
  AdminRoleMetadata
> = {
  super_admin: {
    label: 'Super Admin',
    description: 'Full system access including role management',
    color: '#E17B60' // salmon
  },
  admin: {
    label: 'Admin',
    description: 'Full access except role management',
    color: '#4C7180' // cornflower
  },
  moderator: {
    label: 'Moderator',
    description: 'View all content and moderate openings',
    color: '#82B29A' // mint
  },
  staff: {
    label: 'Staff',
    description: 'View analytics only',
    color: '#F8F9FA' // bodyBg
  }
};
