import type { StageRole } from '../Profile/shared/profile.types';
import { expandEthnicityForMatching } from '../../utils/helpers';
import type { PublicRoleListItem } from './api';

export interface RoleFilters {
  roleType?: Extract<StageRole, 'On-Stage' | 'Off-Stage'>;
  genders: string[];
  ageRanges: string[];
  ethnicities: string[];
  unions: string[];
  requirements: string[];
  payMin?: number;
  payMax?: number;
}

export const EMPTY_FILTERS: RoleFilters = {
  genders: [],
  ageRanges: [],
  ethnicities: [],
  unions: [],
  requirements: []
};

export const createEmptyRoleFilters = (): RoleFilters => ({
  genders: [],
  ageRanges: [],
  ethnicities: [],
  unions: [],
  requirements: []
});

export const cloneRoleFilters = (filters: RoleFilters): RoleFilters => ({
  roleType: filters.roleType,
  genders: [...filters.genders],
  ageRanges: [...filters.ageRanges],
  ethnicities: [...filters.ethnicities],
  unions: [...filters.unions],
  requirements: [...filters.requirements],
  payMin: filters.payMin,
  payMax: filters.payMax
});

const hasValue = (values: string[] | undefined, selected: string[]) => {
  if (selected.length === 0) {
    return true;
  }

  if (!Array.isArray(values) || values.length === 0) {
    return false;
  }

  return selected.some((value) => values.includes(value));
};

const getRoleGenderValues = (role: PublicRoleListItem) => {
  const genders = Array.isArray(role.gender_identity)
    ? [...role.gender_identity]
    : [];

  if (role.include_nonbinary && !genders.includes('Nonbinary')) {
    genders.push('Nonbinary');
  }

  if (genders.includes('Trans/Nonbinary')) {
    const transRoles = Array.isArray(role.trans_nonbinary_roles)
      ? role.trans_nonbinary_roles
      : [];

    if (transRoles.length === 0 && !genders.includes('Nonbinary')) {
      genders.push('Nonbinary');
    }

    transRoles.forEach((gender) => {
      if (!genders.includes(gender)) {
        genders.push(gender);
      }
    });
  }

  return genders;
};

const getRoleRate = (role: PublicRoleListItem) => {
  const value = role.role_rate as unknown;

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.replace(/[$,]/g, '').trim());
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
};

const hasPayFilter = (filters: RoleFilters) =>
  filters.payMin != null || filters.payMax != null;

const passesPayFilter = (role: PublicRoleListItem, filters: RoleFilters) => {
  if (!hasPayFilter(filters)) {
    return true;
  }

  const rate = getRoleRate(role);

  if (rate == null) {
    return false;
  }

  if (filters.payMin != null && rate < filters.payMin) {
    return false;
  }

  if (filters.payMax != null && rate > filters.payMax) {
    return false;
  }

  return true;
};

const hasEthnicityMatch = (
  values: string[] | undefined,
  selectedEthnicities: string[]
) => {
  if (selectedEthnicities.length === 0) {
    return true;
  }

  if (!Array.isArray(values) || values.length === 0) {
    return false;
  }

  const expandedValues = expandEthnicityForMatching(values);
  const expandedSelected = expandEthnicityForMatching(selectedEthnicities);

  return expandedSelected.some((value) => expandedValues.includes(value));
};

export const countAppliedFilters = (filters: RoleFilters) =>
  (filters.roleType ? 1 : 0) +
  filters.genders.length +
  filters.ageRanges.length +
  filters.ethnicities.length +
  filters.unions.length +
  filters.requirements.length +
  (hasPayFilter(filters) ? 1 : 0);

export const applyRoleFilters = (
  roles: PublicRoleListItem[],
  filters: RoleFilters
) =>
  roles.filter((role) => {
    if (filters.roleType && role.type !== filters.roleType) {
      return false;
    }

    if (!hasValue(getRoleGenderValues(role), filters.genders)) {
      return false;
    }

    if (!hasValue(role.age_range, filters.ageRanges)) {
      return false;
    }

    if (!hasEthnicityMatch(role.ethnicity, filters.ethnicities)) {
      return false;
    }

    if (!hasValue(role.union, filters.unions)) {
      return false;
    }

    if (!hasValue(role.additional_requirements, filters.requirements)) {
      return false;
    }

    return passesPayFilter(role, filters);
  });
