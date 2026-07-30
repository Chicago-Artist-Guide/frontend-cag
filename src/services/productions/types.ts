import type { Role } from '../../components/Profile/Company/types';

// A role flattened with enough of its parent production to render a
// self-contained card outside the show-detail page. Mirrors the shape the
// existing client-side `PublicShows/api.ts` returns so presentational
// components can be reused unchanged between the client and server paths.
export type PublicRoleListItem = Role & {
  account_id: string;
  audition_end?: string;
  audition_start?: string;
  production_id: string;
  production_image_url?: string;
  production_name: string;
};
