/**
 * useCompanies Hook - Fetch and manage theatre company data
 *
 * Fetches company accounts and profiles from Firestore,
 * and provides filtering, sorting, and pagination.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useFirebaseContext } from '../context/FirebaseContext';

/**
 * Company data structure combining account + profile
 */
export interface CompanyData {
  // Account data
  accountId: string;
  uid: string;
  email?: string;
  theater_name: string;
  disabled?: boolean;
  createdAt?: any;

  // Profile data
  profileId?: string;
  description?: string;
  location?: string;
  number_of_members?: string;
  primary_contact?: string;
  primary_contact_email?: string;
  profile_image_url?: string;
  website?: string;
  equity_status?: 'Equity' | 'Non-Equity';
  business_type?: 'Non-profit' | 'For profit';
  complete_profile?: boolean;
  profile_exists: boolean;

  // Counts
  productions_count?: number;
}

/**
 * Theatre request data structure
 */
export interface TheatreRequest {
  id: string;
  theatreCompanyName: string;
  theatreWebsite: string;
  companyType: 'Equity' | 'Non-Equity';
  businessType: 'Non-profit' | 'For profit';
  contactPerson: string;
  contactEmail: string;
  additionalInfo?: string;
  createdAt?: any;
}

/**
 * Search and filter criteria for companies
 */
export interface CompanySearchFilters {
  searchTerm: string;
  status: 'all' | 'active' | 'disabled';
  profileComplete: 'all' | boolean;
  sortBy: 'name' | 'created' | 'email';
  sortOrder: 'asc' | 'desc';
}

/**
 * Pagination state
 */
export interface CompanyPagination {
  page: number;
  pageSize: number;
}

/**
 * Cache for company data (5 minute TTL)
 *
 * Note: This is a module-level cache intentionally shared across all hook instances.
 * This improves performance by avoiding redundant Firestore queries.
 * Use clearCompanyCache() to manually invalidate if needed.
 */
interface CacheEntry {
  data: CompanyData[];
  timestamp: number;
}

let companyCache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Clear the company cache manually
 * Useful for forcing a refresh or during development
 */
export function clearCompanyCache(): void {
  companyCache = null;
}

/**
 * Apply filters to company array
 */
function applyFilters(
  companies: CompanyData[],
  filters: CompanySearchFilters
): CompanyData[] {
  let filtered = [...companies];

  // Search term (name or email)
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter((company) => {
      const name = company.theater_name?.toLowerCase() || '';
      const email = company.email?.toLowerCase() || '';
      const contact = company.primary_contact?.toLowerCase() || '';
      return (
        name.includes(term) || email.includes(term) || contact.includes(term)
      );
    });
  }

  // Status filter
  if (filters.status !== 'all') {
    if (filters.status === 'active') {
      filtered = filtered.filter((company) => !company.disabled);
    } else if (filters.status === 'disabled') {
      filtered = filtered.filter((company) => company.disabled === true);
    }
  }

  // Profile completion filter
  if (filters.profileComplete !== 'all') {
    filtered = filtered.filter(
      (company) => company.complete_profile === filters.profileComplete
    );
  }

  return filtered;
}

/**
 * Apply sorting to company array
 */
function applySorting(
  companies: CompanyData[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): CompanyData[] {
  const sorted = [...companies].sort((a, b) => {
    let aVal: any;
    let bVal: any;

    switch (sortBy) {
      case 'name':
        aVal = a.theater_name?.toLowerCase() || '';
        bVal = b.theater_name?.toLowerCase() || '';
        break;
      case 'email':
        aVal = a.email?.toLowerCase() || '';
        bVal = b.email?.toLowerCase() || '';
        break;
      case 'created':
        aVal = a.createdAt?.toMillis?.() || a.createdAt || 0;
        bVal = b.createdAt?.toMillis?.() || b.createdAt || 0;
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
 * useCompanies Hook
 */
export function useCompanies(
  filters: CompanySearchFilters,
  pagination: CompanyPagination
) {
  const { firebaseFirestore } = useFirebaseContext();
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const mountedRef = useRef(true);

  /**
   * Fetch all companies from Firestore
   */
  const fetchCompanies = useCallback(async () => {
    if (!firebaseFirestore) {
      if (mountedRef.current) {
        setError('Firestore not initialized');
        setLoading(false);
      }
      return;
    }

    try {
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      // Check cache
      if (companyCache && Date.now() - companyCache.timestamp < CACHE_TTL) {
        console.log('[useCompanies] Using cached data');
        const filtered = applyFilters(companyCache.data, filters);
        const sorted = applySorting(
          filtered,
          filters.sortBy,
          filters.sortOrder
        );
        setTotalCompanies(sorted.length);

        // Paginate
        const startIndex = (pagination.page - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginated = sorted.slice(startIndex, endIndex);

        if (mountedRef.current) {
          setCompanies(paginated);
          setLoading(false);
        }
        return;
      }

      console.log('[useCompanies] Fetching from Firestore');

      // Fetch company accounts
      const accountsRef = collection(firebaseFirestore, 'accounts');
      const accountsQuery = query(accountsRef, where('type', '==', 'company'));
      const accountsSnapshot = await getDocs(accountsQuery);

      // Fetch all profiles
      const profilesRef = collection(firebaseFirestore, 'profiles');
      const profilesSnapshot = await getDocs(profilesRef);

      // Create a map of profiles by account_id
      const profilesMap = new Map<string, any>();
      profilesSnapshot.forEach((doc) => {
        const profile = doc.data();
        if (profile.account_id) {
          profilesMap.set(profile.account_id, {
            ...profile,
            profileId: doc.id
          });
        }
      });

      // Fetch productions to count per company
      const productionsRef = collection(firebaseFirestore, 'productions');
      const productionsSnapshot = await getDocs(productionsRef);

      // Count productions per account
      const productionsCount = new Map<string, number>();
      productionsSnapshot.forEach((doc) => {
        const prod = doc.data();
        if (prod.account_id) {
          const count = productionsCount.get(prod.account_id) || 0;
          productionsCount.set(prod.account_id, count + 1);
        }
      });

      // Combine account + profile data
      const combinedCompanies: CompanyData[] = [];
      accountsSnapshot.forEach((doc) => {
        const account = doc.data();
        const profile = profilesMap.get(doc.id);

        combinedCompanies.push({
          accountId: doc.id,
          uid: account.uid,
          email: account.email,
          theater_name:
            account.theater_name || profile?.theatre_name || 'Unknown Company',
          disabled: account.disabled || false,
          createdAt: account.createdAt,

          // Profile data
          profileId: profile?.profileId,
          description: profile?.description,
          location: profile?.location,
          number_of_members: profile?.number_of_members,
          primary_contact: profile?.primary_contact,
          primary_contact_email: profile?.primary_contact_email,
          profile_image_url: profile?.profile_image_url,
          website: profile?.website,
          equity_status: profile?.equity_status,
          business_type: profile?.business_type,
          complete_profile: profile?.complete_profile || false,
          profile_exists: !!profile,

          // Counts
          productions_count: productionsCount.get(doc.id) || 0
        });
      });

      // Update cache
      companyCache = {
        data: combinedCompanies,
        timestamp: Date.now()
      };

      // Apply filters
      const filtered = applyFilters(combinedCompanies, filters);

      // Apply sorting
      const sorted = applySorting(filtered, filters.sortBy, filters.sortOrder);

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginated = sorted.slice(startIndex, endIndex);

      if (mountedRef.current) {
        setTotalCompanies(sorted.length);
        setCompanies(paginated);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('[useCompanies] Error fetching companies:', err);
      if (mountedRef.current) {
        setError('Failed to load companies. Please try again.');
        setLoading(false);
      }
    }
  }, [firebaseFirestore, filters, pagination.page, pagination.pageSize]);

  /**
   * Refresh companies (clear cache)
   */
  const refreshCompanies = useCallback(async () => {
    companyCache = null;
    await fetchCompanies();
  }, [fetchCompanies]);

  /**
   * Fetch on mount and when dependencies change
   */
  useEffect(() => {
    mountedRef.current = true;
    fetchCompanies();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchCompanies]);

  return {
    companies,
    loading,
    error,
    totalCompanies,
    refreshCompanies
  };
}

/**
 * useTheatreRequests Hook - Fetch pending theatre sign-up requests
 */
export function useTheatreRequests() {
  const { firebaseFirestore } = useFirebaseContext();
  const [requests, setRequests] = useState<TheatreRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const fetchRequests = useCallback(async () => {
    if (!firebaseFirestore) {
      if (mountedRef.current) {
        setError('Firestore not initialized');
        setLoading(false);
      }
      return;
    }

    try {
      if (mountedRef.current) {
        setLoading(true);
        setError(null);
      }

      const requestsRef = collection(firebaseFirestore, 'theatre_requests');
      const snapshot = await getDocs(requestsRef);

      const requestsData: TheatreRequest[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        requestsData.push({
          id: doc.id,
          theatreCompanyName: data.theatreCompanyName,
          theatreWebsite: data.theatreWebsite,
          companyType: data.companyType,
          businessType: data.businessType,
          contactPerson: data.contactPerson,
          contactEmail: data.contactEmail,
          additionalInfo: data.additionalInfo,
          createdAt: data.createdAt
        });
      });

      // Sort by most recent first (if createdAt exists)
      requestsData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis?.() || 0;
        const bTime = b.createdAt?.toMillis?.() || 0;
        return bTime - aTime;
      });

      if (mountedRef.current) {
        setRequests(requestsData);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('[useTheatreRequests] Error:', err);
      if (mountedRef.current) {
        setError('Failed to load requests. Please try again.');
        setLoading(false);
      }
    }
  }, [firebaseFirestore]);

  const refreshRequests = useCallback(async () => {
    await fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    mountedRef.current = true;
    fetchRequests();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchRequests]);

  return {
    requests,
    loading,
    error,
    refreshRequests
  };
}

export default useCompanies;
