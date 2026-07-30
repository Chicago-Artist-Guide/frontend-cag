export type EventStatus = 'published' | 'draft' | 'cancelled';

// Mirrors the shape the legacy client-side `/events` page and `EventCard`
// already expect (see src/routes/Events.tsx and
// src/components/shared/EventCard.tsx), so the same presentational
// component renders both server- and client-fetched data unchanged.
export interface CommunityEvent {
  date: string;
  details: string;
  externalUrl: string;
  id: string;
  image: string;
  location: string;
  name: string;
  price: string;
  status?: EventStatus;
  time: string;
}

// Mirrors the `RoleOpportunity` shape from src/routes/GetInvolved.tsx. Source
// documents are inconsistent between camelCase and snake_case field names
// (see the client's own fallback chain) — this is the normalized shape
// callers get back regardless of which the document used.
export interface RoleOpportunity {
  description: string;
  googleFormUrl?: string;
  id: string;
  location: string;
  moreInfoUrl?: string;
  ongoing: boolean;
  pay?: string;
  productionId: string;
  productionName: string;
  roleName: string;
  roleType?: string;
}
