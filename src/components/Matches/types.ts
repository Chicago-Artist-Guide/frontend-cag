import {
  IndividualAccountInit,
  IndividualProfileDataFullInit
} from '../SignUp/Individual/types';

// add more filter options to this as we work on the filter bar functionality
export type MatchingFilters = Pick<IndividualAccountInit, 'type'> &
  Partial<
    Pick<
      IndividualProfileDataFullInit,
      | 'ethnicities'
      | 'age_ranges'
      | 'gender_identity'
      | 'gender_roles'
      | 'gender_transition'
      | 'lgbtqia'
      | 'additional_skills_checkboxes'
      | 'additional_skills_manual'
      | 'union_status'
      | 'union_other'
    >
  >;
