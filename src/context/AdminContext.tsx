/**
 * AdminContext - Provides admin role and permission information throughout the app
 *
 * SECURITY WARNING: This context is for UI/UX purposes only!
 * - Controls what admin interface elements users see
 * - Does NOT enforce actual authorization
 * - Real security MUST be implemented in Firestore rules and backend
 *
 * Usage:
 * ```tsx
 * const { adminRole, permissions, hasPermission, loading } = useAdminContext();
 *
 * if (hasPermission('users.edit')) {
 *   // Show edit button
 * }
 * ```
 */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback
} from 'react';
import { User } from 'firebase/auth';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  doc,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import {
  AdminRole,
  AdminPermissions,
  AdminResource,
  isAdminRole
} from '../types/admin';
import {
  getPermissionsForRole,
  checkPermission
} from '../utils/adminPermissions';

/**
 * Shape of the AdminContext
 */
export interface AdminContextType {
  /**
   * Current user's admin role, null if not an admin
   * Fetched from accounts.admin_role field in Firestore
   */
  currentAdminRole: AdminRole | null;

  /**
   * Structured permissions object based on current role
   * Makes it easy to check permissions in components
   */
  permissions: AdminPermissions | null;

  /**
   * Loading state while fetching admin role from Firestore
   */
  loading: boolean;

  /**
   * Helper function to check if user has a specific permission
   * @param resource - The resource type (e.g., 'users', 'companies')
   * @param action - The action to check (e.g., 'edit', 'delete')
   * @returns true if user has the permission, false otherwise
   */
  hasPermission: (resource: AdminResource, action: string) => boolean;
}

/**
 * Default context value (no admin access)
 */
const defaultContextValue: AdminContextType = {
  currentAdminRole: null,
  permissions: null,
  loading: true,
  hasPermission: () => false
};

/**
 * AdminContext - Use via useAdminContext() hook
 */
export const AdminContext =
  createContext<AdminContextType>(defaultContextValue);

/**
 * Hook to access AdminContext
 * Must be used within AdminProvider
 */
export const useAdminContext = () => useContext(AdminContext);

/**
 * Props for AdminProvider component
 */
interface AdminProviderProps {
  children: React.ReactNode;
  currentUser: User | null;
  firestore: Firestore | null;
}

/**
 * AdminProvider - Fetches and provides admin role/permissions to child components
 *
 * Should be placed in the component tree after FirebaseContext and UserContext
 * so it has access to currentUser and firestore
 *
 * @example
 * <FirebaseContext.Provider>
 *   <UserContext.Provider>
 *     <AdminProvider currentUser={currentUser} firestore={firestore}>
 *       <App />
 *     </AdminProvider>
 *   </UserContext.Provider>
 * </FirebaseContext.Provider>
 */
export const AdminProvider: React.FC<AdminProviderProps> = ({
  children,
  currentUser,
  firestore
}) => {
  const [currentAdminRole, setCurrentAdminRole] = useState<AdminRole | null>(
    null
  );
  const [permissions, setPermissions] = useState<AdminPermissions | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    console.log('[AdminContext] useEffect triggered', {
      hasCurrentUser: !!currentUser,
      currentUserUid: currentUser?.uid,
      hasFirestore: !!firestore
    });

    // Reset state when user changes
    if (!currentUser || !firestore) {
      console.log('[AdminContext] No user or firestore, resetting admin state');
      setCurrentAdminRole(null);
      setPermissions(null);
      setLoading(false);
      return;
    }

    /**
     * Fetches the admin_role field from the user's account document
     * This is the source of truth for admin status
     */
    const fetchAdminRole = async () => {
      try {
        console.log(
          '[AdminContext] Starting fetchAdminRole for UID:',
          currentUser.uid
        );
        setLoading(true);

        // Query the accounts collection by uid field (not document ID)
        // The document ID is different from the uid field in Firebase Auth
        const accountQuery = query(
          collection(firestore, 'accounts'),
          where('uid', '==', currentUser.uid),
          limit(1)
        );
        console.log(
          '[AdminContext] Querying accounts where uid ==',
          currentUser.uid
        );

        const querySnapshot = await getDocs(accountQuery);
        console.log(
          '[AdminContext] Query found documents:',
          !querySnapshot.empty
        );

        if (!querySnapshot.empty) {
          const accountDoc = querySnapshot.docs[0];
          const accountData = accountDoc.data();
          console.log('[AdminContext] Account document ID:', accountDoc.id);
          console.log('[AdminContext] Account data:', accountData);

          const adminRole = accountData?.admin_role as AdminRole | undefined;
          console.log('[AdminContext] admin_role field value:', adminRole);
          console.log(
            '[AdminContext] Is valid admin role?',
            isAdminRole(adminRole)
          );

          // Validate that the role is a valid AdminRole using type guard
          if (adminRole && isAdminRole(adminRole)) {
            setCurrentAdminRole(adminRole);
            // Calculate permissions based on role
            const rolePermissions = getPermissionsForRole(adminRole);
            console.log('[AdminContext] ✅ Admin role SET:', adminRole);
            console.log('[AdminContext] Permissions:', rolePermissions);
            setPermissions(rolePermissions);

            // Sync admin_users collection for Firestore rules enforcement
            // This ensures existing admins have the required document
            // Note: This is best-effort - sync failure should not affect admin status
            try {
              const adminUserRef = doc(
                firestore,
                'admin_users',
                currentUser.uid
              );
              const adminUserDoc = await getDoc(adminUserRef);

              if (!adminUserDoc.exists()) {
                console.log(
                  '[AdminContext] Creating admin_users document for rules enforcement'
                );
                await setDoc(adminUserRef, {
                  role: adminRole,
                  email: currentUser.email,
                  synced_at: serverTimestamp()
                });
              } else if (adminUserDoc.data()?.role !== adminRole) {
                // Update if role changed
                console.log('[AdminContext] Updating admin_users role');
                await setDoc(
                  adminUserRef,
                  {
                    role: adminRole,
                    email: currentUser.email,
                    synced_at: serverTimestamp()
                  },
                  { merge: true }
                );
              }
              console.log('[AdminContext] admin_users sync complete');
            } catch (syncError) {
              // Sync failure is non-fatal - admin role from accounts is still valid
              console.warn(
                '[AdminContext] admin_users sync failed (will retry on next login):',
                syncError
              );
            }
          } else {
            // No admin role or invalid role - user is not an admin
            console.log('[AdminContext] ❌ No valid admin role found');
            setCurrentAdminRole(null);
            setPermissions(null);
          }
        } else {
          // Account document doesn't exist - shouldn't happen, but handle gracefully
          console.warn(
            '[AdminContext] ⚠️ Account document not found for user',
            currentUser.uid
          );
          setCurrentAdminRole(null);
          setPermissions(null);
        }
      } catch (error) {
        console.error('[AdminContext] ❌ Error fetching admin role:', error);
        // On error, assume no admin access for safety
        setCurrentAdminRole(null);
        setPermissions(null);
      } finally {
        console.log('[AdminContext] fetchAdminRole complete, loading = false');
        setLoading(false);
      }
    };

    fetchAdminRole();
  }, [currentUser, firestore]);

  /**
   * Helper function to check permissions easily
   * Memoized with useCallback to prevent re-renders
   */
  const hasPermission = useCallback(
    (resource: AdminResource, action: string): boolean => {
      if (!currentAdminRole) return false;
      const result = checkPermission(currentAdminRole, resource, action);
      return result.allowed;
    },
    [currentAdminRole]
  );

  /**
   * Memoize the context value to prevent unnecessary re-renders
   */
  const value: AdminContextType = useMemo(
    () => ({
      currentAdminRole,
      permissions,
      loading,
      hasPermission
    }),
    [currentAdminRole, permissions, loading, hasPermission]
  );

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

/**
 * Re-export the hook for convenient importing
 */
export { useAdminContext as useAdminAuth };
