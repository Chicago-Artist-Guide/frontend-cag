import type { AccountTypeOptions } from '../types';

export type IndividualRoles = 'on-stage' | 'off-stage' | 'both-stage';

export const pronouns = [
  'He/Him/His',
  'She/Her/Hers',
  'They/Them/Theirs',
  'Ze/Zir/Zirs',
  'Other'
] as const;
export type Pronouns = (typeof pronouns)[number];

export type EthnicityTypeObj = {
  name: string;
  values: string[];
};
export const ethnicityTypes: EthnicityTypeObj[] = [
  {
    name: 'Asian',
    values: [
      'East Asian (ex. China, Korea, Japan)',
      'Southeast Asian (ex. Cambodia, Thailand, Vietnam)',
      'South Asian (ex. Bangladesh, India, Pakistan)',
      'Central & West Asian (ex. Afghanistan, Iran, Uzbekistan)'
    ]
  },
  {
    name: 'Black or African American',
    values: []
  },
  {
    name: 'Indigenous',
    values: []
  },
  {
    name: 'Latinx',
    values: []
  },
  {
    name: 'MENA',
    values: []
  },
  {
    name: 'Native Hawaiian or Other Pacific Islander',
    values: []
  },
  {
    name: 'White',
    values: []
  },
  {
    name: 'I do not wish to respond',
    values: []
  }
];
export const flattenedEthnicityTypes: string[] = ethnicityTypes.reduce<
  string[]
>((acc, item) => acc.concat(item.name, item.values), []);
export type EthnicityTypes = (typeof flattenedEthnicityTypes)[number];

export const ageRanges = [
  '18-22',
  '23-27',
  '28-32',
  '33-37',
  '38-42',
  '43-47',
  '48-52',
  '53-57',
  '58-62',
  '62+'
] as const;
export type AgeRange = (typeof ageRanges)[number];

export const genders = [
  'Cis Woman',
  'Cis Man',
  'Trans/Nonbinary',
  'I choose not to respond'
] as const;
export type Gender = (typeof genders)[number];

export const genderRoles = ['Man', 'Woman', 'Nonbinary'] as const;
export type GenderRole = (typeof genderRoles)[number];

export const websiteTypeOptions = [
  'Personal/Portfolio',
  'Blog',
  'Media',
  'Social - Linktree',
  'Social - Instagram',
  'Social - Twitter',
  'Social - YouTube',
  'Social - LinkedIn',
  'Social - Facebook',
  'Social - TikTok',
  'Social - Other'
] as const;
export type WebsiteTypes = (typeof websiteTypeOptions)[number];

export type IndividualWebsite = {
  id: number;
  url: string;
  websiteType: WebsiteTypes;
};

export type IndividualData = {
  actorInfo1Ethnicities: EthnicityTypes[];
  actorInfo1LGBTQ: string;
  actorInfo1Pronouns: Pronouns;
  actorInfo1PronounsOther: string;
  actorInfo2AgeRanges: AgeRange[];
  actorInfo2Gender: Gender;
  actorInfo2GenderRoles: GenderRole[];
  actorInfo2GenderTransition: string;
  actorInfo2HeightFt: number;
  actorInfo2HeightIn: number;
  actorInfo2HeightNoAnswer: boolean;
  basics18Plus: boolean;
  basicsEmailAddress: string;
  basicsFirstName: string;
  basicsLastName: string;
  basicsPassword: string;
  basicsPasswordConfirm: string;
  demographicsAgency: string;
  demographicsBioHeadline: string;
  demographicsBio: string;
  demographicsUnionStatus: string[];
  demographicsUnionStatusOther: string;
  demographicsWebsites: IndividualWebsite[];
  emailListAgree: boolean;
  offstageRolesGeneral: string[];
  offstageRolesHairMakeupCostumes: string[];
  offstageRolesLighting: string[];
  offstageRolesProduction: string[];
  offstageRolesScenicAndProperties: string[];
  offstageRolesSound: string[];
  privacyAgreement: boolean;
  profilePhotoUrl: string;
  stageRole: IndividualRoles;
};

export type IndividualAccountInit = {
  type: Extract<AccountTypeOptions, 'individual'>;
  basics_18_plus: boolean;
  email_list: boolean;
  first_name: string;
  last_name: string;
  privacy_agreement: boolean;
  uid: string;
  email?: string;
};

export type IndividualProfileInit = {
  uid: string;
  account_id: string;
  stage_role: IndividualRoles;
  completed_signup: boolean;
  completed_profile_1: boolean;
  completed_profile_2: boolean;
};

export type IndividualProfile = {
  pronouns: Pronouns;
  pronouns_other: string;
  lgbtqia: string;
  ethnicities: EthnicityTypes[];
  height_ft: number;
  height_in: number;
  height_no_answer: boolean;
  age_ranges: AgeRange[];
  gender_identity: Gender;
  gender_roles: GenderRole[];
  gender_transition: string;
  offstage_roles_general: string[];
  offstage_roles_production: string[];
  offstage_roles_scenic_and_properties: string[];
  offstage_roles_lighting: string[];
  offstage_roles_sound: string[];
  offstage_roles_hair_makeup_costumes: string[];
  profile_image_url: string;
  union_status: string[];
  union_other: string;
  agency: string;
  websites: IndividualWebsite[];
  headline: string;
  bio: string;
  profile_tagline: string;
  completed_profile: boolean;
  completed_profile_1: boolean; // old
};

export const skillCheckboxes = ['Dancing', 'Singing'] as const;
export type SkillCheckbox = (typeof skillCheckboxes)[number];

export type PastPerformances = {
  id: number;
  title: string;
  year: string;
  group: string;
  role: string;
  director: string;
  musicalDirector: string;
};

export type UpcomingPerformances = {
  id: number;
  title: string;
  year: string;
  group: string;
  role: string;
  director: string;
  musicalDirector: string;
};

export type ProfileAwards = {
  id: number;
  title: string;
  year: string;
  url: string;
  description: string;
};

export type TrainingInstitution = {
  id: number;
  trainingInstitution: string;
  trainingDegree: string;
  trainingYear: string;
};

export type IndividualProfile2Data = {
  trainingInstitutions: TrainingInstitution[];
  pastPerformances: PastPerformances[];
  upcoming: UpcomingPerformances[];
  additionalSkillsCheckboxes: SkillCheckbox[];
  additionalSkillsManual: string[];
  awards: ProfileAwards[];
};

export type IndividualProfile2 = {
  training_institutions: TrainingInstitution[];
  past_performances: PastPerformances[];
  upcoming_performances: UpcomingPerformances[];
  additional_skills_checkboxes: SkillCheckbox[];
  additional_skills_manual: string[];
  awards: ProfileAwards[];
  completed_profile_2: boolean;
};

export type IndividualProfileDataFull = IndividualProfile & IndividualProfile2;
export type IndividualProfileDataFullInit = IndividualProfileInit &
  IndividualProfileDataFull;
