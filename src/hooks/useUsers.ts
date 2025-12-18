/**
 * useUsers Hook - Fetch and manage user data for User Management
 *
 * Fetches accounts and profiles from Firestore, merges them,
 * and provides filtering, sorting, and pagination.
 */

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { useFirebaseContext } from '../context/FirebaseContext';
import {
  CombinedUserData,
  UserSearchFilters,
  UserPagination
} from '../types/user';

/**
 * Cache for user data (5 minute TTL)
 */
interface CacheEntry {
  data: CombinedUserData[];
  timestamp: number;
}

let userCache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Apply filters to user array
 */
function applyFilters(
  users: CombinedUserData[],
  filters: UserSearchFilters
): CombinedUserData[] {
  let filtered = [...users];

  // Search term (name or email)
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter((user) => {
      const name =
        `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const email = user.email?.toLowerCase() || '';
      const theaterName = user.theater_name?.toLowerCase() || '';
      return (
        name.includes(term) ||
        email.includes(term) ||
        theaterName.includes(term)
      );
    });
  }

  // Account type
  if (filters.accountType !== 'all') {
    filtered = filtered.filter((user) => user.type === filters.accountType);
  }

  // Admin role
  if (filters.adminRole !== 'all') {
    if (filters.adminRole === 'none') {
      filtered = filtered.filter((user) => !user.admin_role);
    } else {
      filtered = filtered.filter(
        (user) => user.admin_role === filters.adminRole
      );
    }
  }

  // Profile completion
  if (filters.completedProfile !== 'all') {
    filtered = filtered.filter(
      (user) => user.completed_profile === filters.completedProfile
    );
  }

  return filtered;
}

/**
 * Apply sorting to user array
 */
function applySorting(
  users: CombinedUserData[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): CombinedUserData[] {
  const sorted = [...users].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortBy) {
      case 'name':
        aVal =
          `${a.first_name || a.theater_name || ''} ${a.last_name || ''}`.toLowerCase();
        bVal =
          `${b.first_name || b.theater_name || ''} ${b.last_name || ''}`.toLowerCase();
        break;
      case 'email':
        aVal = a.email?.toLowerCase() || '';
        bVal = b.email?.toLowerCase() || '';
        break;
      case 'created':
        aVal = a.createdAt?.toMillis() || 0;
        bVal = b.createdAt?.toMillis() || 0;
        break;
      case 'lastLogin':
        aVal = a.last_login?.toMillis() || 0;
        bVal = b.last_login?.toMillis() || 0;
        break;
      default:
        return 0;
    }

    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return sorted;
}

/**
 * useUsers Hook
 */
export function useUsers(
  filters: UserSearchFilters,
  pagination: UserPagination
) {
  const { firebaseFirestore } = useFirebaseContext();
  const [users, setUsers] = useState<CombinedUserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalUsers, setTotalUsers] = useState(0);

  /**
   * Fetch all users from Firestore
   */
  const fetchUsers = useCallback(async () => {
    if (!firebaseFirestore) {
      setError('Firestore not initialized');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check cache
      if (userCache && Date.now() - userCache.timestamp < CACHE_TTL) {
        console.log('[useUsers] Using cached data');
        const filtered = applyFilters(userCache.data, filters);
        const sorted = applySorting(
          filtered,
          filters.sortBy,
          filters.sortOrder
        );
        setTotalUsers(sorted.length);

        // Paginate
        const startIndex = (pagination.page - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginated = sorted.slice(startIndex, endIndex);

        setUsers(paginated);
        setLoading(false);
        return;
      }

      console.log('[useUsers] Fetching from Firestore');

      // Fetch all accounts
      const accountsRef = collection(firebaseFirestore, 'accounts');
      const accountsSnapshot = await getDocs(accountsRef);

      // Fetch all profiles
      const profilesRef = collection(firebaseFirestore, 'profiles');
      const profilesSnapshot = await getDocs(profilesRef);

      // Create a map of profiles by uid
      const profilesMap = new Map<string, any>();
      profilesSnapshot.forEach((doc) => {
        const profile = doc.data();
        profilesMap.set(profile.uid, profile);
      });

      // Combine account + profile data
      const combinedUsers: CombinedUserData[] = [];
      accountsSnapshot.forEach((doc) => {
        const account = doc.data();
        const profile = profilesMap.get(account.uid);

        combinedUsers.push({
          accountId: doc.id,
          uid: account.uid,
          type: account.type,
          email: account.email,
          createdAt: account.createdAt,
          admin_role: account.admin_role,
          admin_role_assigned_at: account.admin_role_assigned_at,
          admin_role_assigned_by: account.admin_role_assigned_by,
          admin_role_notes: account.admin_role_notes,
          admin_active: account.admin_active,
          first_name: profile?.first_name,
          last_name: profile?.last_name,
          preferred_name: profile?.preferred_name,
          pronouns: profile?.pronouns,
          profile_image_url: profile?.profile_image_url,
          location: profile?.location,
          theater_name:
            account.type === 'company'
              ? account.theater_name
              : profile?.theatre_name,
          completed_profile: profile?.completed_profile || false,
          profile_exists: !!profile,
          last_login: account.last_login
        });
      });

      // Update cache
      userCache = {
        data: combinedUsers,
        timestamp: Date.now()
      };

      // Apply filters
      const filtered = applyFilters(combinedUsers, filters);

      // Apply sorting
      const sorted = applySorting(filtered, filters.sortBy, filters.sortOrder);

      setTotalUsers(sorted.length);

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginated = sorted.slice(startIndex, endIndex);

      setUsers(paginated);
      setLoading(false);
    } catch (err: any) {
      console.error('[useUsers] Error fetching users:', err);
      setError('Failed to load users. Please try again.');
      setLoading(false);
    }
  }, [firebaseFirestore, filters, pagination.page, pagination.pageSize]);

  /**
   * Refresh users (clear cache)
   */
  const refreshUsers = useCallback(async () => {
    userCache = null;
    await fetchUsers();
  }, [fetchUsers]);

  /**
   * Fetch on mount and when dependencies change
   */
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    totalUsers,
    refreshUsers
  };
}

export default useUsers;
