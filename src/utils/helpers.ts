import { EnumType } from '../components/Profile/shared/profile.types';
import { ethnicityTypes } from '../components/SignUp/Individual/types';

export function getOptionsFromEnum(options: EnumType) {
  return Object.values(options).map((option) => ({
    name: option as string,
    value: option as string
  }));
}

export function getOptions(options: string[]) {
  return options.map((option) => ({
    name: option,
    value: option
  }));
}

export function expandEthnicityForMatching(
  selectedEthnicities: string[]
): string[] {
  const expanded: string[] = [...selectedEthnicities];

  ethnicityTypes.forEach((ethType) => {
    if (
      selectedEthnicities.includes(ethType.name) &&
      ethType.values.length > 0
    ) {
      // Add all subcategories if parent category is selected
      ethType.values.forEach((subcat) => {
        if (!expanded.includes(subcat)) {
          expanded.push(subcat);
        }
      });
    }
  });

  return expanded;
}
