/**
 * useAdminAuth Hook - Access admin role and permissions in components
 *
 * SECURITY WARNING: This hook is for UI/UX purposes only!
 * - Returns admin role and permission information for showing/hiding UI elements
 * - Does NOT provide actual authorization
 * - Real security must be implemented in Firestore rules and backend
 *
 * Usage:
 * ```tsx
 * const { isAdmin, adminRole, permissions, hasPermission, loading } = useAdminAuth();
 *
 * if (isAdmin && hasPermission('users.edit')) {
 *   return <EditUserButton />;
 * }
 *
 * if (permissions?.companies.approve) {
 *   return <ApproveCompanyButton />;
 * }
 * ```
 */

import { useAdminContext } from '../context/AdminContext';
import { AdminRole, AdminPermissions, AdminResource } from '../types/admin';

/**
 * Return type for useAdminAuth hook
 */
export interface UseAdminAuthReturn {
  /**
   * Boolean flag indicating if the current user is an admin
   * True if they have any admin role (staff, moderator, admin, super_admin)
   */
  isAdmin: boolean;

  /**
   * The current user's admin role
   * Null if they are not an admin
   */
  adminRole: AdminRole | null;

  /**
   * Structured permissions object for easy checking
   * Null if user is not an admin
   *
   * @example
   * if (permissions?.users.edit) {
   *   // Show edit button
   * }
   */
  permissions: AdminPermissions | null;

  /**
   * Helper function to check a specific permission
   * Returns false if user is not an admin or doesn't have the permission
   *
   * @param resource - The resource type to check (e.g., 'users', 'companies')
   * @param action - The action to check (e.g., 'edit', 'approve')
   * @returns true if user has the permission
   *
   * @example
   * if (hasPermission('companies', 'approve')) {
   *   // Show approve button
   * }
   */
  hasPermission: (resource: AdminResource, action: string) => boolean;

  /**
   * Loading state while fetching admin role from Firestore
   * True during initial fetch, false once completed
   */
  loading: boolean;
}

/**
 * useAdminAuth - Hook to access admin authentication and permissions
 *
 * Must be used within a component tree that has AdminProvider
 *
 * @returns Object containing admin status, role, permissions, and helpers
 *
 * @example
 * function UserManagementPage() {
 *   const { isAdmin, permissions, loading } = useAdminAuth();
 *
 *   if (loading) return <Spinner />;
 *   if (!isAdmin) return <NotAuthorized />;
 *
 *   return (
 *     <div>
 *       {permissions?.users.edit && <EditButton />}
 *       {permissions?.users.delete && <DeleteButton />}
 *     </div>
 *   );
 * }
 */
export const useAdminAuth = (): UseAdminAuthReturn => {
  const { currentAdminRole, permissions, loading, hasPermission } =
    useAdminContext();

  // User is an admin if they have any admin role
  const isAdmin = currentAdminRole !== null;

  return {
    isAdmin,
    adminRole: currentAdminRole,
    permissions,
    hasPermission,
    loading
  };
};

export default useAdminAuth;
