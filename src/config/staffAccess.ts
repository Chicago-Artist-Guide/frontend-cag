/**
 * Staff Access Configuration
 *
 * IMPORTANT: This is for backward compatibility only.
 * Real authorization is controlled by:
 * 1. admin_role field in Firestore accounts collection
 * 2. Firestore security rules
 *
 * Client-side checks are UX only - not security.
 */

export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'staff' | null;

export const STAFF_CONFIG = {
  // Legacy email whitelist (deprecated - use admin_role in accounts instead)
  emails: [
    'chris@ctkadvisors.net',
    'anna@chicagoartistguide.org',
    'mharigoldstein@yahoo.com',
    'alex@alexjewell.com',
    'jmfischer55@gmail.com'
  ],
  features: {
    exportData: true,
    viewDetailedMetrics: true,
    viewUserList: false // Privacy protection
  }
};

/**
 * Admin Role Hierarchy
 *
 * These role definitions map to the admin_role field in Firestore accounts.
 * Permissions are enforced server-side via Firestore rules.
 */
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin' as const,
  ADMIN: 'admin' as const,
  MODERATOR: 'moderator' as const,
  STAFF: 'staff' as const
};

/**
 * Permission definitions for each admin role
 *
 * SECURITY NOTE: These are for UX only. Real permissions are enforced
 * in Firestore security rules. Never rely on client-side permission checks
 * for security decisions.
 */
export const ROLE_PERMISSIONS = {
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
    analytics: {
      view: true,
      export: true
    },
    audit: {
      view: true,
      delete: true
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
    analytics: {
      view: true,
      export: true
    },
    audit: {
      view: true,
      delete: false
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
      edit: true,
      delete: false,
      moderate: true
    },
    analytics: {
      view: true,
      export: false
    },
    audit: {
      view: true,
      delete: false
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
    analytics: {
      view: true,
      export: false
    },
    audit: {
      view: false,
      delete: false
    }
  }
} as const;
