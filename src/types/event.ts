/**
 * Event type definitions for CAG Events Management
 *
 * Defines types for events that appear on the /events page.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Event data structure from events collection
 */
export interface Event {
  id: string;
  name: string;
  date: string; // Date string (e.g., "2024-03-15")
  time: string; // Time string (e.g., "7:00 PM")
  location: string;
  details: string;
  price: string;
  image: string; // Image URL
  externalUrl: string; // Link to external event page or tickets
  status?: 'published' | 'draft' | 'cancelled';
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  createdBy?: string; // Admin who created
  moderated?: boolean;
  moderatedAt?: Timestamp;
  moderatedBy?: string;
  moderationNotes?: string;
}

/**
 * Search and filter criteria for events
 */
export interface EventSearchFilters {
  searchTerm: string;
  status: 'published' | 'draft' | 'cancelled' | 'all';
  timeframe: 'upcoming' | 'past' | 'all';
  sortBy: 'date' | 'created' | 'name';
  sortOrder: 'asc' | 'desc';
}

/**
 * Pagination state for event list
 */
export interface EventPagination {
  page: number;
  pageSize: number;
  totalEvents: number;
  totalPages: number;
}
