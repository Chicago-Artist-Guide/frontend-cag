import { OffStageRoleByCategory, OffStageRoleCategory } from './profile.types';

export const offstageRolesOptions: OffStageRoleByCategory = {
  general: {
    category: 'offstageRolesGeneral',
    name: 'General',
    options: [
      {
        label: 'Directing',
        value: 'Directing'
      },
      {
        label: 'Violence / Fight Design',
        value: 'Violence / Fight Design'
      },
      {
        label: 'Intimacy Design',
        value: 'Intimacy Design'
      },
      {
        label: 'Choreography',
        value: 'Choreography'
      },
      {
        label: 'Casting',
        value: 'Casting'
      },
      {
        label: 'Dramaturgy',
        value: 'Dramaturgy'
      },
      {
        label: 'Dialect Coaching',
        value: 'Dialect Coaching'
      },
      {
        label: 'Musical Directing',
        value: 'Musical Directing'
      }
    ]
  },
  production: {
    category: 'offstageRolesProduction',
    name: 'Production',
    options: [
      {
        label: 'Stage Management',
        value: 'Stage Management'
      },
      {
        label: 'Production Management',
        value: 'Production Management'
      },
      {
        label: 'Board Op',
        value: 'Board Op'
      },
      {
        label: 'Run Crew',
        value: 'Run Crew'
      }
    ]
  },
  scenicAndProperties: {
    category: 'offstageRolesScenicAndProperties',
    name: 'Scenic & Properties',
    options: [
      {
        label: 'Set Design',
        value: 'Set Design'
      },
      {
        label: 'Technical Direction',
        value: 'Technical Direction'
      },
      {
        label: 'Properties Designer',
        value: 'Properties Designer'
      },
      {
        label: 'Scenic Carpentry',
        value: 'Scenic Carpentry'
      },
      {
        label: 'Charge Artist',
        value: 'Charge Artist'
      }
    ]
  },
  lighting: {
    category: 'offstageRolesLighting',
    name: 'Lighting',
    options: [
      {
        label: 'Lighting Design',
        value: 'Lighting Design'
      },
      {
        label: 'Projection Design',
        value: 'Projection Design'
      },
      {
        label: 'Special Effect Design',
        value: 'Special Effect Design'
      },
      {
        label: 'Master Electrician',
        value: 'Master Electrician'
      }
    ]
  },
  sound: {
    category: 'offstageRolesSound',
    name: 'Sound',
    options: [
      {
        label: 'Sound Design',
        value: 'Sound Design'
      },
      {
        label: 'Sound Mixer / Engineer',
        value: 'Sound Mixer / Engineer'
      }
    ]
  },
  hairMakeupCostumes: {
    category: 'offstageRolesHairMakeupCostumes',
    name: 'Hair, Makeup, Costumes',
    options: [
      {
        label: 'Costume Design',
        value: 'Costume Design'
      },
      {
        label: 'Hair & Wig Design',
        value: 'Hair & Wig Design'
      },
      {
        label: 'Make-up Design',
        value: 'Make-up Design'
      }
    ]
  }
};

export const findOffstageCategoryDataProp = {
  offstageRolesGeneral: 'offstage_roles_general',
  offstageRolesProduction: 'offstage_roles_production',
  offstageRolesScenicAndProperties: 'offstage_roles_scenic_and_properties',
  offstageRolesLighting: 'offstage_roles_lighting',
  offstageRolesSound: 'offstage_roles_sound',
  offstageRolesHairMakeupCostumes: 'offstage_roles_hair_makeup_costumes'
} as const;

export type OffstageCategoryKey = keyof typeof findOffstageCategoryDataProp;

export const findCategoryByValue = (value: string): string | undefined => {
  for (const categoryKey in offstageRolesOptions) {
    const category = offstageRolesOptions[categoryKey as OffStageRoleCategory];
    const foundOption = category.options.find(
      (option) => option.value === value
    );

    if (foundOption) {
      return category.category;
    }
  }

  return undefined;
};
