/**
 * useOpenings Hook - Fetch and manage role opportunities
 *
 * Fetches roleOpportunities from Firestore with filtering, sorting, and pagination.
 */

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useFirebaseContext } from '../context/FirebaseContext';
import {
  RoleOpportunity,
  OpeningSearchFilters,
  OpeningPagination
} from '../types/opening';

/**
 * Cache for opening data (5 minute TTL)
 */
interface CacheEntry {
  data: RoleOpportunity[];
  timestamp: number;
}

let openingCache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Apply filters to opening array
 */
function applyFilters(
  openings: RoleOpportunity[],
  filters: OpeningSearchFilters
): RoleOpportunity[] {
  let filtered = [...openings];

  // Search term (role name or production name)
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter((opening) => {
      const roleName = opening.roleName?.toLowerCase() || '';
      const productionName = opening.productionName?.toLowerCase() || '';
      return roleName.includes(term) || productionName.includes(term);
    });
  }

  // Role type
  if (filters.roleType !== 'all') {
    filtered = filtered.filter(
      (opening) => opening.roleType === filters.roleType
    );
  }

  // Status
  if (filters.status !== 'all') {
    filtered = filtered.filter((opening) => {
      // Default to 'open' if status not set
      const status = opening.status || 'open';
      return status === filters.status;
    });
  }

  // Location
  if (filters.location !== 'all') {
    filtered = filtered.filter((opening) => {
      const location = opening.location || 'Chicago';
      return location === filters.location;
    });
  }

  return filtered;
}

/**
 * Apply sorting to opening array
 */
function applySorting(
  openings: RoleOpportunity[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): RoleOpportunity[] {
  const sorted = [...openings].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortBy) {
      case 'name':
        aVal = a.roleName?.toLowerCase() || '';
        bVal = b.roleName?.toLowerCase() || '';
        break;
      case 'created':
        aVal = a.createdAt?.toMillis() || 0;
        bVal = b.createdAt?.toMillis() || 0;
        break;
      case 'updated':
        aVal = a.updatedAt?.toMillis() || 0;
        bVal = b.updatedAt?.toMillis() || 0;
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
 * useOpenings Hook
 */
export function useOpenings(
  filters: OpeningSearchFilters,
  pagination: OpeningPagination
) {
  const { firebaseFirestore } = useFirebaseContext();
  const [openings, setOpenings] = useState<RoleOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalOpenings, setTotalOpenings] = useState(0);

  /**
   * Fetch all openings from Firestore
   */
  const fetchOpenings = useCallback(async () => {
    if (!firebaseFirestore) {
      setError('Firestore not initialized');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Check cache
      if (openingCache && Date.now() - openingCache.timestamp < CACHE_TTL) {
        console.log('[useOpenings] Using cached data');
        const filtered = applyFilters(openingCache.data, filters);
        const sorted = applySorting(
          filtered,
          filters.sortBy,
          filters.sortOrder
        );
        setTotalOpenings(sorted.length);

        // Paginate
        const startIndex = (pagination.page - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginated = sorted.slice(startIndex, endIndex);

        setOpenings(paginated);
        setLoading(false);
        return;
      }

      console.log('[useOpenings] Fetching from Firestore');

      // Fetch all roleOpportunities
      const openingsRef = collection(firebaseFirestore, 'roleOpportunities');

      // Try to fetch with orderBy first, fall back to unordered query if it fails
      let openingsSnapshot;
      try {
        const openingsQuery = query(openingsRef, orderBy('createdAt', 'desc'));
        openingsSnapshot = await getDocs(openingsQuery);
      } catch (indexError) {
        console.warn(
          '[useOpenings] OrderBy failed, fetching without order:',
          indexError
        );
        // Fall back to fetching all documents without ordering
        openingsSnapshot = await getDocs(openingsRef);
      }

      // Map to RoleOpportunity array
      const allOpenings: RoleOpportunity[] = [];
      openingsSnapshot.forEach((doc) => {
        const data = doc.data();
        allOpenings.push({
          id: doc.id,
          roleName: data.roleName || data.role_name || '',
          productionName: data.productionName || data.production_name || '',
          description: data.description || '',
          productionId: data.productionId || data.production_id || '',
          googleFormUrl: data.googleFormUrl || data.google_form_url,
          moreInfoUrl: data.moreInfoUrl || data.more_info_url,
          roleType: data.roleType || data.role_type,
          pay: data.pay,
          location: data.location || 'Chicago',
          status: data.status || 'open',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          account_id: data.account_id || data.uid,
          moderated: data.moderated || false,
          moderatedAt: data.moderatedAt,
          moderatedBy: data.moderatedBy,
          moderationNotes: data.moderationNotes
        });
      });

      // Update cache
      openingCache = {
        data: allOpenings,
        timestamp: Date.now()
      };

      // Apply filters
      const filtered = applyFilters(allOpenings, filters);

      // Apply sorting
      const sorted = applySorting(filtered, filters.sortBy, filters.sortOrder);

      setTotalOpenings(sorted.length);

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginated = sorted.slice(startIndex, endIndex);

      setOpenings(paginated);
      setLoading(false);
    } catch (err: any) {
      console.error('[useOpenings] Error fetching openings:', err);

      // Provide more helpful error message
      if (err.code === 'permission-denied') {
        setError(
          'Permission denied. Please ensure Firestore rules allow reading roleOpportunities collection.'
        );
      } else if (err.message?.includes('index')) {
        setError('Database index required. Check console for details.');
      } else {
        setError('Failed to load job openings. Please try again.');
      }

      setLoading(false);
    }
  }, [firebaseFirestore, filters, pagination.page, pagination.pageSize]);

  /**
   * Refresh openings (clear cache)
   */
  const refreshOpenings = useCallback(async () => {
    openingCache = null;
    await fetchOpenings();
  }, [fetchOpenings]);

  /**
   * Fetch on mount and when dependencies change
   */
  useEffect(() => {
    fetchOpenings();
  }, [fetchOpenings]);

  return {
    openings,
    loading,
    error,
    totalOpenings,
    refreshOpenings
  };
}

export default useOpenings;
