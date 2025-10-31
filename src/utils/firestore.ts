type Primitive = string | number | boolean | null | Date;

const sanitizeValue = (value: any): any => {
  if (value === undefined) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeValue(item))
      .filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.entries(value).reduce(
      (acc, [key, val]) => {
        const sanitized = sanitizeValue(val);

        if (sanitized !== undefined) {
          acc[key] = sanitized;
        }

        return acc;
      },
      {} as Record<string, any>
    );
  }

  return value as Primitive;
};

export const sanitizeDataForFirestore = <T>(data: T): T => {
  return sanitizeValue(data) as T;
};
