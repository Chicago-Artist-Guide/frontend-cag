import {
  Gender,
  IndividualAccountInit,
  IndividualProfileDataFullInit,
  IndividualRoles
} from '../SignUp/Individual/types';
import { Role } from '../Profile/Company/types';

// These are for situations where the filter value is an array
// but the profile value itself is a single value (OR)
export const FILTER_ARRAYS_TO_SINGLE_VALUES_MATCHING = [
  'stage_role',
  'gender_identity'
];

// add more filter options to this as we work on the filter bar functionality
// we split out some as arrays because single values in the profile
// need to have multiple options for search
export type MatchingFilters = Pick<IndividualAccountInit, 'type'> & {
  stage_role?: IndividualRoles[];
  gender_identity?: Gender[];
  matchStatus?: boolean | null;
} & Partial<
    Pick<
      IndividualProfileDataFullInit,
      | 'ethnicities'
      | 'age_ranges'
      | 'gender_roles'
      | 'gender_transition'
      | 'lgbtqia'
      | 'additional_skills_checkboxes'
      | 'additional_skills_manual'
      | 'union_status'
      | 'union_other'
      | 'offstage_roles_general'
      | 'offstage_roles_production'
      | 'offstage_roles_scenic_and_properties'
      | 'offstage_roles_lighting'
      | 'offstage_roles_sound'
      | 'offstage_roles_hair_makeup_costumes'
    >
  >;

export type ProductionRole = Role & { productionId: string };
