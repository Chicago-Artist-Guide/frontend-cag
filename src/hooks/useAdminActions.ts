/**
 * useAdminActions Hook - Audit logging for admin actions
 *
 * Provides a simple interface to log all admin actions to Firestore
 * for audit trail and compliance.
 */

import { useState, useRef, useEffect } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useFirebaseContext } from '../context/FirebaseContext';
import { useUserContext } from '../context/UserContext';
import { useAdminAuth } from './useAdminAuth';

/**
 * Admin action types from adminActionSchema
 */
export type AdminActionType =
  | 'user_view'
  | 'user_edit'
  | 'user_delete'
  | 'role_change'
  | 'company_view'
  | 'company_edit'
  | 'company_approve'
  | 'opening_view'
  | 'opening_edit'
  | 'opening_moderate'
  | 'opening_create'
  | 'opening_delete'
  | 'event_view'
  | 'event_create'
  | 'event_edit'
  | 'event_delete'
  | 'event_publish';

/**
 * Admin action target types
 */
export type AdminActionTargetType =
  | 'user'
  | 'company'
  | 'opening'
  | 'event'
  | 'system';

/**
 * Parameters for logging an admin action
 */
export interface AdminActionParams {
  /** Type of action performed */
  action_type: AdminActionType;
  /** Type of resource affected */
  target_type: AdminActionTargetType;
  /** ID of the resource affected */
  target_id: string;
  /** Display name of the target */
  target_name?: string;
  /** Changes made (before/after) */
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields_changed?: string[];
  };
  /** Additional notes */
  notes?: string;
}

/**
 * useAdminActions Hook
 */
export function useAdminActions() {
  const { firebaseFirestore } = useFirebaseContext();
  const { currentUser } = useUserContext();
  const { adminRole } = useAdminAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  // Track mounted state to prevent state updates after unmount
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  /**
   * Log an admin action
   */
  const logAction = async (params: AdminActionParams): Promise<void> => {
    if (!firebaseFirestore) {
      console.error('[useAdminActions] Firestore not initialized');
      return;
    }

    if (!currentUser) {
      console.error('[useAdminActions] No current user');
      return;
    }

    if (!adminRole) {
      console.error('[useAdminActions] No admin role');
      return;
    }

    try {
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const actionData = {
        // Admin info
        admin_uid: currentUser.uid,
        admin_email: currentUser.email || '',
        admin_role: adminRole,

        // Action details
        action_type: params.action_type,
        target_type: params.target_type,
        target_id: params.target_id,
        target_name: params.target_name || '',

        // Changes (if any)
        changes: params.changes || null,

        // Notes
        notes: params.notes || '',

        // Timestamp (server time)
        timestamp: serverTimestamp()
      };

      const actionsRef = collection(firebaseFirestore, 'admin_actions');
      await addDoc(actionsRef, actionData);

      console.log('[useAdminActions] Action logged:', params.action_type);
      if (mountedRef.current) {
        setLoading(false);
      }
    } catch (err: any) {
      console.error('[useAdminActions] Error logging action:', err);
      if (mountedRef.current) {
        setError('Failed to log action');
        setLoading(false);
      }
      // Don't throw - audit logging failure shouldn't block the action
    }
  };

  return {
    logAction,
    loading,
    error
  };
}

export default useAdminActions;
