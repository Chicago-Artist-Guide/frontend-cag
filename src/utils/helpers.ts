import { EnumType } from '../components/Profile/shared/profile.types';

export function getOptionsFromEnum(options: EnumType) {
  return Object.values(options).map(option => ({
    name: option as string,
    value: option as string
  }));
}
