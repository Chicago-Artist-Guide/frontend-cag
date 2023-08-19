import {
  ProductionEquity,
  ProductionStatus,
  ProductionType,
  RoleStatus,
  StageRole
} from '../components/Profile/shared/profile.types';

export const neighborhoods = [
  'Rogers Park',
  'West Ridge',
  'Uptown',
  'Lincoln Square',
  'North Center',
  'Lake View',
  'Lincoln Park',
  'Near North Side',
  'Edison Park',
  'Norwood Park',
  'Jefferson Park',
  'Forest Glen',
  'North Park',
  'Albany Park',
  'Portage Park',
  'Irving Park',
  'Dunning',
  'Montclare',
  'Belmont Cragin',
  'Hermosa',
  'Avondale',
  'Logan Square',
  'Humboldt Park',
  'West Town',
  'Austin',
  'West Garfield Park',
  'East Garfield Park',
  'Near West Side',
  'North Lawndale',
  'South Lawndale',
  'Lower West Side',
  '(The) Loop[11]',
  'Near South Side',
  'Armour Square',
  'Douglas',
  'Oakland',
  'Fuller Park',
  'Grand Boulevard',
  'Kenwood',
  'Washington Park',
  'Hyde Park',
  'Woodlawn',
  'South Shore',
  'Chatham',
  'Avalon Park',
  'South Chicago',
  'Burnside',
  'Calumet Heights',
  'Roseland',
  'Pullman',
  'South Deering',
  'East Side',
  'West Pullman',
  'Riverdale',
  'Hegewisch',
  'Garfield Ridge',
  'Archer Heights',
  'Brighton Park',
  'McKinley Park',
  'Bridgeport',
  'New City',
  'West Elsdon',
  'Gage Park',
  'Clearing',
  'West Lawn',
  'Chicago Lawn',
  'West Englewood',
  'Englewood',
  'Greater Grand Crossing',
  'Ashburn',
  'Auburn Gresham',
  'Beverly',
  'Washington Heights',
  'Mount Greenwood',
  'Morgan Park',
  "O'Hare",
  'Edgewater',
  'Other/Various/Itinerant'
];

export const productionStatuses: ProductionStatus[] = [
  'Pre-Production',
  'Casting',
  'Casting Complete',
  'Rehearsal',
  'Now Playing',
  'Complete'
];
export const productionEquities: ProductionEquity[] = ['Union', 'Non-Union'];
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
