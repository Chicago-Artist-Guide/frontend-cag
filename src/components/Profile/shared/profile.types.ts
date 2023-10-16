export type StageRole = 'On-Stage' | 'Off-Stage';

export type ProductionEquity = 'Union' | 'Non-Union';

export type ProductionType = 'Musical' | 'Play' | 'Other';

export type ProductionStatus =
  | 'Pre-Production'
  | 'Casting'
  | 'Casting Complete'
  | 'Rehearsal'
  | 'Now Playing'
  | 'Complete';

export type RoleStatus = 'Open' | 'Closed';

export type EnumType = { [s: string]: string };

export type StringArrayKeyValues<T> = {
  [K in keyof T]: T[K] extends string[] ? { key: K; value: T[K] } : never;
}[keyof T];

export type OffStageRoleSectionOption = {
  label: string;
  value: string;
};

export type OffStageRoleSection = {
  category: string;
  name: string;
  options: OffStageRoleSectionOption[];
};

export type OffStageRoleCategory =
  | 'general'
  | 'production'
  | 'scenicAndProperties'
  | 'lighting'
  | 'sound'
  | 'hairMakeupCostumes';

export type OffStageRoleByCategory = {
  [k in OffStageRoleCategory]: OffStageRoleSection;
};

export type TransformedOffStageRoleSection = {
  sectionStateName: string;
  textHeader: string;
  checkboxes: OffStageRoleSectionOption[];
  sectionStateValue: string[];
};

export type TransformedOffStageRoleByCategory = {
  [k in OffStageRoleCategory]: TransformedOffStageRoleSection;
};
