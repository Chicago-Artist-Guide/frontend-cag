/**
 * Staff Access Configuration
 *
 * IMPORTANT: This file is DEPRECATED and maintained for backward compatibility only.
 *
 * For new code, use:
 * - ROLE_PERMISSIONS from 'src/types/admin.ts' (authoritative source)
 * - useAdminAuth() hook from 'src/hooks/useAdminAuth.ts'
 * - AdminContext from 'src/context/AdminContext.tsx'
 *
 * Real authorization is controlled by:
 * 1. admin_role field in Firestore accounts collection
 * 2. Firestore security rules
 *
 * Client-side checks are UX only - not security.
 *
 * @deprecated Use types/admin.ts instead - to be removed in future version
 */

// Re-export AdminRole from the authoritative source
export type { AdminRole } from '../types/admin';

/**
 * @deprecated Legacy email whitelist - use admin_role in Firestore accounts instead
 */
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
 * Admin Role Constants
 * @deprecated Use AdminRole type from types/admin.ts instead
 */
export const ADMIN_ROLES = {
  SUPER_ADMIN: 'super_admin' as const,
  ADMIN: 'admin' as const,
  MODERATOR: 'moderator' as const,
  STAFF: 'staff' as const
};

/**
 * Re-export ROLE_PERMISSIONS from authoritative source
 * @deprecated Import directly from 'src/types/admin.ts' instead
 */
export { ROLE_PERMISSIONS } from '../types/admin';
