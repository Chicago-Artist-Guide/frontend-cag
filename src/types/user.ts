/**
 * User type definitions for User Management
 *
 * Defines types for combined user data, search filters, and forms.
 */

import { Timestamp } from 'firebase/firestore';
import { AdminRole } from './admin';

/**
 * Account type from SignUp
 */
export type AccountTypeOptions = 'individual' | 'company';

/**
 * Combined User data structure merging account + profile
 * Used for display in User Management interface
 */
export interface CombinedUserData {
  // Account data
  accountId: string;
  uid: string;
  type: AccountTypeOptions;
  email?: string;
  createdAt?: Timestamp;

  // Admin fields (if applicable)
  admin_role?: AdminRole;
  admin_role_assigned_at?: Timestamp;
  admin_role_assigned_by?: string;
  admin_role_notes?: string;
  admin_active?: boolean;

  // Individual profile fields
  first_name?: string;
  last_name?: string;
  preferred_name?: string;
  pronouns?: string;
  profile_image_url?: string;
  location?: string;

  // Company profile fields
  theater_name?: string;

  // Metadata
  completed_profile?: boolean;
  profile_exists: boolean;
  last_login?: Timestamp;
}

/**
 * Search and filter criteria
 */
export interface UserSearchFilters {
  searchTerm: string;
  accountType: AccountTypeOptions | 'all';
  adminRole: AdminRole | 'all' | 'none';
  completedProfile: boolean | 'all';
  sortBy: 'name' | 'email' | 'created' | 'lastLogin';
  sortOrder: 'asc' | 'desc';
}

/**
 * Pagination state for user list
 */
export interface UserPagination {
  page: number;
  pageSize: number;
  totalUsers: number;
  totalPages: number;
}

/**
 * User edit form data
 */
export interface UserEditFormData {
  // Basic info (all users)
  email?: string;

  // Individual users
  first_name?: string;
  last_name?: string;
  preferred_name?: string;

  // Company users
  theater_name?: string;

  // Admin role (super_admin only)
  admin_role?: AdminRole | null;
  admin_role_notes?: string;
}
