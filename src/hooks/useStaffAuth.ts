/**
 * useStaffAuth Hook - Legacy staff authentication (DEPRECATED)
 *
 * @deprecated This hook is deprecated and will be removed in a future version.
 * Please use useAdminAuth from './useAdminAuth' instead for role-based admin access.
 *
 * Migration guide:
 * - Old: `const { isStaff } = useStaffAuth();`
 * - New: `const { isAdmin } = useAdminAuth();`
 *
 * The new useAdminAuth provides:
 * - Role-based permissions (viewer, moderator, admin, superadmin)
 * - Fine-grained permission checking
 * - Firestore-backed role management (no hardcoded emails)
 *
 * This hook remains for backward compatibility but should not be used in new code.
 */

import { useUserContext } from '../context/UserContext';
import { STAFF_CONFIG } from '../config/staffAccess';

export const useStaffAuth = () => {
  const { currentUser } = useUserContext();

  const isStaff = !!(
    currentUser?.email &&
    STAFF_CONFIG.emails.includes(currentUser.email.toLowerCase())
  );

  // Log deprecation warning in development
  if (import.meta.env.DEV && isStaff) {
    console.warn(
      '[DEPRECATED] useStaffAuth is deprecated. Please migrate to useAdminAuth for role-based permissions.'
    );
  }

  return {
    isStaff,
    staffEmail: currentUser?.email,
    features: isStaff ? STAFF_CONFIG.features : null
  };
};
