import {
  ProductionEquity,
  ProductionStatus,
  ProductionType,
  RoleStatus,
  StageRole
} from '../components/Profile/shared/profile.types';

export const neighborhoods = [
  '(The) Loop[11]',
  'Albany Park',
  'Archer Heights',
  'Armour Square',
  'Ashburn',
  'Auburn Gresham',
  'Austin',
  'Avalon Park',
  'Avondale',
  'Belmont Cragin',
  'Beverly',
  'Bridgeport',
  'Brighton Park',
  'Burnside',
  'Calumet Heights',
  'Chatham',
  'Chicago Lawn',
  'Clearing',
  'Douglas',
  'Dunning',
  'East Garfield Park',
  'East Side',
  'Edgewater',
  'Edison Park',
  'Englewood',
  'Forest Glen',
  'Fuller Park',
  'Gage Park',
  'Garfield Ridge',
  'Grand Boulevard',
  'Greater Grand Crossing',
  'Hegewisch',
  'Hermosa',
  'Humboldt Park',
  'Hyde Park',
  'Irving Park',
  'Jefferson Park',
  'Kenwood',
  'Lake View',
  'Lincoln Park',
  'Lincoln Square',
  'Logan Square',
  'Lower West Side',
  'McKinley Park',
  'Montclare',
  'Morgan Park',
  'Mount Greenwood',
  'Near North Side',
  'Near South Side',
  'Near West Side',
  'New City',
  'North Center',
  'North Lawndale',
  'North Park',
  'Norwood Park',
  "O'Hare",
  'Oakland',
  'Other/Various/Itinerant',
  'Portage Park',
  'Pullman',
  'Riverdale',
  'Rogers Park',
  'Roseland',
  'South Chicago',
  'South Deering',
  'South Lawndale',
  'South Shore',
  'Uptown',
  'Washington Heights',
  'Washington Park',
  'West Elsdon',
  'West Englewood',
  'West Garfield Park',
  'West Lawn',
  'West Pullman',
  'West Ridge',
  'West Town',
  'Woodlawn'
];

export const productionStatuses: ProductionStatus[] = [
  'Hiring',
  'In Production',
  'Show Complete'
];
export const productionEquities: ProductionEquity[] = ['Union', 'Non-Union'];

// Union options for roles and individual profiles
export const unionOptions = [
  'Non-Union',
  'AEA (actors, stage managers, directors)',
  'IATSE (stage hands)',
  'Union Scenic Artist (designers)'
] as const;

export type UnionOption = (typeof unionOptions)[number];

export const productionTypes: ProductionType[] = ['Musical', 'Play', 'Other'];
export const stageRoles: StageRole[] = ['On-Stage', 'Off-Stage'];
export const roleStatuses: RoleStatus[] = ['Open', 'Closed'];

export const ethnicities = [
  'Open to all ethnicities',
  'Asian',
  'Black or African American',
  'Indigenous',
  'Latinx',
  'MENA',
  'Native Hawaiian or Other Pacific Islander',
  'White',
  'Other'
];

export const ageRanges = [
  'Open to all ages',
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

export const genders = [
  'Open to all genders',
  'Cis Female',
  'Cis Male',
  'Trans Female',
  'Trans Male',
  'Non Binary/Agender'
] as const;

export const roleGenders = [
  'Open to all genders',
  'Female',
  'Male',
  'Trans Female',
  'Trans Man',
  'Nonbinary'
] as const;

export const additionalRequirements = ['Requires singing', 'Requires dancing'];
