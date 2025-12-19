/**
 * Admin Actions Collection Schema
 *
 * This file documents the schema for the admin_actions Firestore collection
 * used for audit logging of all admin operations.
 *
 * SECURITY CRITICAL: This collection provides an audit trail for compliance
 * and security investigations. Firestore rules must prevent tampering.
 *
 * Collection: admin_actions
 * Purpose: Audit log for all administrative actions
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Types of admin actions that can be logged
 */
export type AdminActionType =
  | 'user_view' // Viewing sensitive user data
  | 'user_edit' // Editing user account/profile
  | 'user_delete' // Deleting user account
  | 'role_change' // Changing user's admin role
  | 'company_view' // Viewing company details
  | 'company_edit' // Editing company profile
  | 'company_delete' // Deleting company
  | 'company_approve' // Approving theater signup request
  | 'company_reject' // Rejecting theater signup request
  | 'opening_view' // Viewing opening details
  | 'opening_edit' // Editing opening/role
  | 'opening_delete' // Deleting opening
  | 'opening_moderate' // Moderating opening content
  | 'match_view' // Viewing match details
  | 'data_export' // Exporting data (CSV, reports)
  | 'analytics_access'; // Accessing analytics dashboard

/**
 * Type of entity the action was performed on
 */
export type AdminActionTargetType =
  | 'user'
  | 'company'
  | 'production'
  | 'role'
  | 'match'
  | 'request'
  | 'system';

/**
 * Admin Action document structure
 *
 * Each admin action creates one document in the admin_actions collection.
 */
export interface AdminAction {
  /**
   * Unique identifier for this action
   * Generated client-side or use Firestore auto-ID
   */
  action_id: string;

  /**
   * UID of the admin who performed the action
   * Must match authenticated user's UID
   */
  admin_uid: string;

  /**
   * Email of the admin (for readability in logs)
   * Denormalized for faster audit queries
   */
  admin_email: string;

  /**
   * Admin role at the time of action
   * Helps investigate role-based issues
   */
  admin_role: 'super_admin' | 'admin' | 'moderator' | 'staff';

  /**
   * Type of action performed
   */
  action_type: AdminActionType;

  /**
   * Type of entity targeted
   */
  target_type: AdminActionTargetType;

  /**
   * ID of the specific entity affected
   * e.g., user UID, company ID, production ID
   */
  target_id: string;

  /**
   * Optional: Name/title of target for readability
   * e.g., user email, company name, production title
   */
  target_name?: string;

  /**
   * Changes made (before/after values)
   * For edit actions, shows what changed
   * Optional for view-only actions
   */
  changes?: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields_changed?: string[];
  };

  /**
   * Timestamp of when action occurred
   * Use serverTimestamp() for accuracy
   */
  timestamp: Timestamp;

  /**
   * Optional notes/reason for action
   * e.g., "Approved company per email verification"
   */
  notes?: string;

  /**
   * Optional: IP address or session info
   * For enhanced security tracking (if available)
   */
  metadata?: {
    ip_address?: string;
    user_agent?: string;
    session_id?: string;
  };
}

/**
 * Firestore Security Rules Summary:
 *
 * READ:
 * - All admins can read admin_actions
 * - Filter by admin_uid to see own actions
 * - super_admin can see all actions
 *
 * CREATE:
 * - Only admins can create admin_actions
 * - Must set admin_uid to auth.uid (prevent impersonation)
 * - Must set admin_email to match account
 * - Must set admin_role to match account
 * - Must set timestamp (server timestamp preferred)
 *
 * UPDATE:
 * - Not allowed (audit logs are immutable)
 *
 * DELETE:
 * - Only super_admin can delete (for GDPR/retention)
 * - Should be rare and logged separately
 */

/**
 * Helper type for creating new admin actions
 * Omits server-generated fields
 */
export type CreateAdminAction = Omit<AdminAction, 'action_id' | 'timestamp'> & {
  action_id?: string;
  timestamp?: Timestamp;
};

/**
 * Query helpers for admin actions
 */
export interface AdminActionQuery {
  /**
   * Filter by admin who performed actions
   */
  admin_uid?: string;

  /**
   * Filter by action type
   */
  action_type?: AdminActionType;

  /**
   * Filter by target type
   */
  target_type?: AdminActionTargetType;

  /**
   * Filter by specific target
   */
  target_id?: string;

  /**
   * Date range filters
   */
  start_date?: Date;
  end_date?: Date;

  /**
   * Pagination
   */
  limit?: number;
  offset?: number;
}

/**
 * Example usage:
 *
 * // Logging a user edit action
 * const action: CreateAdminAction = {
 *   admin_uid: currentUser.uid,
 *   admin_email: currentUser.email,
 *   admin_role: 'admin',
 *   action_type: 'user_edit',
 *   target_type: 'user',
 *   target_id: editedUserUid,
 *   target_name: 'john@example.com',
 *   changes: {
 *     before: { first_name: 'John' },
 *     after: { first_name: 'Jonathan' },
 *     fields_changed: ['first_name']
 *   },
 *   notes: 'Fixed user's preferred name'
 * };
 *
 * await addDoc(collection(firestore, 'admin_actions'), {
 *   ...action,
 *   action_id: generateId(),
 *   timestamp: serverTimestamp()
 * });
 */
