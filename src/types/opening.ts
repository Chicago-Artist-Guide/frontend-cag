/**
 * Opening type definitions for CAG Job Openings Management
 *
 * Defines types for CAG-specific job opportunities (staff, volunteers, board members)
 * that appear on the /get-involved page.
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Role Opportunity data structure from roleOpportunities collection
 * Used for CAG-specific positions (not theater production roles)
 */
export interface RoleOpportunity {
  id: string;
  roleName: string; // Position title (e.g., "Project Manager", "Grant Writer")
  productionName: string; // Department/Team (legacy field, defaults to "Chicago Artist Guide")
  description: string;
  productionId: string; // Legacy field, defaults to "cag"
  moreInfoUrl?: string;
  googleFormUrl?: string; // Application form URL
  roleType?: string; // "Staff", "Volunteer", "Board", etc.
  pay?: string; // Compensation (e.g., "$250", "Volunteer", "Stipend")
  location?: string; // Usually "Chicago" or "Remote"
  status?: 'open' | 'closed';
  ongoing?: boolean; // If true, shows in "Ongoing open positions" section instead of "Current openings"
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
  account_id?: string; // Admin who posted
  moderated?: boolean;
  moderatedAt?: Timestamp;
  moderatedBy?: string;
  moderationNotes?: string;
}

/**
 * Search and filter criteria for openings
 */
export interface OpeningSearchFilters {
  searchTerm: string;
  roleType: string | 'all'; // on-stage, off-stage, all
  status: 'open' | 'closed' | 'all';
  location: string | 'all';
  sortBy: 'created' | 'updated' | 'name';
  sortOrder: 'asc' | 'desc';
}

/**
 * Pagination state for opening list
 */
export interface OpeningPagination {
  page: number;
  pageSize: number;
  totalOpenings: number;
  totalPages: number;
}
