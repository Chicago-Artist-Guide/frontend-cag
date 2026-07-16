export const PUBLIC_ENV_NAMES = Object.freeze([
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'NEXT_PUBLIC_LGL_API_KEY'
]);

export const readPublicBuildArgs = (environment) =>
  Object.fromEntries(
    PUBLIC_ENV_NAMES.map((name) => [name, environment[name] ?? ''])
  );

export const requirePublicBuildArgs = (environment) => {
  const buildArgs = readPublicBuildArgs(environment);
  const missingNames = PUBLIC_ENV_NAMES.filter(
    (name) => !buildArgs[name].trim()
  );

  if (missingNames.length > 0) {
    throw new Error(
      `Missing required public build arguments: ${missingNames.join(', ')}`
    );
  }

  return buildArgs;
};
