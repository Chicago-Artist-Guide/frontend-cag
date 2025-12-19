/**
 * useEvents Hook - Fetch and manage events
 *
 * Fetches events from Firestore with filtering, sorting, and pagination.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { useFirebaseContext } from '../context/FirebaseContext';
import { Event, EventSearchFilters, EventPagination } from '../types/event';

/**
 * Cache for event data (5 minute TTL)
 */
interface CacheEntry {
  data: Event[];
  timestamp: number;
}

let eventCache: CacheEntry | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Parse event date and time into a Date object
 */
function getEventDateTime(event: Event): Date {
  try {
    const eventDate = new Date(event.date);

    if (isNaN(eventDate.getTime())) {
      return new Date(0);
    }

    if (!event.time || event.time.trim() === '') {
      eventDate.setHours(0, 0, 0, 0);
      return eventDate;
    }

    const timeStr = event.time.trim().toUpperCase();
    let hours = 0;
    let minutes = 0;

    // Parse time formats like "7:00 PM", "7 PM", "19:00"
    const timeMatch = timeStr.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i);
    if (timeMatch) {
      hours = parseInt(timeMatch[1], 10);
      minutes = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      const period = timeMatch[3]?.toUpperCase();

      if (period === 'PM' && hours !== 12) {
        hours += 12;
      } else if (period === 'AM' && hours === 12) {
        hours = 0;
      }
    }

    eventDate.setHours(hours, minutes, 0, 0);
    return eventDate;
  } catch {
    return new Date(0);
  }
}

/**
 * Apply filters to event array
 */
function applyFilters(events: Event[], filters: EventSearchFilters): Event[] {
  let filtered = [...events];

  // Search term (name, location, or details)
  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter((event) => {
      const name = event.name?.toLowerCase() || '';
      const location = event.location?.toLowerCase() || '';
      const details = event.details?.toLowerCase() || '';
      return (
        name.includes(term) || location.includes(term) || details.includes(term)
      );
    });
  }

  // Status
  if (filters.status !== 'all') {
    filtered = filtered.filter((event) => {
      const status = event.status || 'published';
      return status === filters.status;
    });
  }

  // Timeframe (upcoming vs past)
  if (filters.timeframe !== 'all') {
    const now = new Date();
    filtered = filtered.filter((event) => {
      const eventDateTime = getEventDateTime(event);
      if (filters.timeframe === 'upcoming') {
        return eventDateTime >= now;
      } else {
        return eventDateTime < now;
      }
    });
  }

  return filtered;
}

/**
 * Apply sorting to event array
 */
function applySorting(
  events: Event[],
  sortBy: string,
  sortOrder: 'asc' | 'desc'
): Event[] {
  const sorted = [...events].sort((a, b) => {
    let aVal: number | string;
    let bVal: number | string;

    switch (sortBy) {
      case 'name':
        aVal = a.name?.toLowerCase() || '';
        bVal = b.name?.toLowerCase() || '';
        break;
      case 'date':
        aVal = getEventDateTime(a).getTime();
        bVal = getEventDateTime(b).getTime();
        break;
      case 'created':
        aVal = a.createdAt?.toMillis() || 0;
        bVal = b.createdAt?.toMillis() || 0;
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
 * useEvents Hook
 */
export function useEvents(
  filters: EventSearchFilters,
  pagination: EventPagination
) {
  const { firebaseFirestore } = useFirebaseContext();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState(0);
  const mountedRef = useRef(true);

  /**
   * Fetch all events from Firestore
   */
  const fetchEvents = useCallback(async () => {
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
      if (eventCache && Date.now() - eventCache.timestamp < CACHE_TTL) {
        console.log('[useEvents] Using cached data');
        const filtered = applyFilters(eventCache.data, filters);
        const sorted = applySorting(
          filtered,
          filters.sortBy,
          filters.sortOrder
        );
        setTotalEvents(sorted.length);

        // Paginate
        const startIndex = (pagination.page - 1) * pagination.pageSize;
        const endIndex = startIndex + pagination.pageSize;
        const paginated = sorted.slice(startIndex, endIndex);

        if (mountedRef.current) {
          setEvents(paginated);
          setLoading(false);
        }
        return;
      }

      console.log('[useEvents] Fetching from Firestore');

      // Fetch all events
      const eventsRef = collection(firebaseFirestore, 'events');

      // Try to fetch with orderBy first, fall back to unordered query if it fails
      let eventsSnapshot;
      try {
        const eventsQuery = query(eventsRef, orderBy('date', 'desc'));
        eventsSnapshot = await getDocs(eventsQuery);
      } catch (indexError) {
        console.warn(
          '[useEvents] OrderBy failed, fetching without order:',
          indexError
        );
        eventsSnapshot = await getDocs(eventsRef);
      }

      // Map to Event array
      const allEvents: Event[] = [];
      eventsSnapshot.forEach((doc) => {
        const data = doc.data();
        allEvents.push({
          id: doc.id,
          name: data.name || '',
          date: data.date || '',
          time: data.time || '',
          location: data.location || '',
          details: data.details || '',
          price: data.price || '',
          image: data.image || '',
          externalUrl: data.externalUrl || data.external_url || '',
          status: data.status || 'published',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          createdBy: data.createdBy || data.created_by,
          moderated: data.moderated || false,
          moderatedAt: data.moderatedAt,
          moderatedBy: data.moderatedBy,
          moderationNotes: data.moderationNotes
        });
      });

      // Update cache
      eventCache = {
        data: allEvents,
        timestamp: Date.now()
      };

      // Apply filters
      const filtered = applyFilters(allEvents, filters);

      // Apply sorting
      const sorted = applySorting(filtered, filters.sortBy, filters.sortOrder);

      // Apply pagination
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      const paginated = sorted.slice(startIndex, endIndex);

      if (mountedRef.current) {
        setTotalEvents(sorted.length);
        setEvents(paginated);
        setLoading(false);
      }
    } catch (err: unknown) {
      console.error('[useEvents] Error fetching events:', err);

      const errorObj = err as { code?: string; message?: string };

      if (errorObj.code === 'permission-denied') {
        setError(
          'Permission denied. Please ensure Firestore rules allow reading events collection.'
        );
      } else if (errorObj.message?.includes('index')) {
        setError('Database index required. Check console for details.');
      } else {
        if (mountedRef.current) {
          setError('Failed to load events. Please try again.');
        }
      }

      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [firebaseFirestore, filters, pagination.page, pagination.pageSize]);

  /**
   * Refresh events (clear cache)
   */
  const refreshEvents = useCallback(async () => {
    eventCache = null;
    await fetchEvents();
  }, [fetchEvents]);

  /**
   * Fetch on mount and when dependencies change
   */
  useEffect(() => {
    mountedRef.current = true;
    fetchEvents();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    totalEvents,
    refreshEvents
  };
}

export default useEvents;
