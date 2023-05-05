type ObjectWithStringValues = { [key: string]: string };

export const hasNonEmptyValues = (
  objects: ObjectWithStringValues[]
): boolean => {
  let nonEmptyObjectFound = false;

  for (const object of objects) {
    const objectHasNonEmptyValues = Object.entries(object).some(
      ([key, value]) => {
        if (key === 'id') {
          return false; // ignore id properties
        }

        return value !== '';
      }
    );

    if (objectHasNonEmptyValues) {
      nonEmptyObjectFound = true;
      break;
    }
  }

  return nonEmptyObjectFound;
};
