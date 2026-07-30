import {
  PUBLIC_ENV_NAMES,
  readPublicBuildArgs,
  requirePublicBuildArgs,
  runPublicEnvCli
} from './public-env.mjs';

const configuredEnvironment = Object.fromEntries(
  PUBLIC_ENV_NAMES.map((name) => [name, `${name}-value`])
);

describe('public build environment', () => {
  it('uses the complete public environment contract', () => {
    expect(PUBLIC_ENV_NAMES).toEqual([
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_SENDER_ID',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
      'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
      'NEXT_PUBLIC_LGL_API_KEY'
    ]);
  });

  it('reads only public build arguments and defaults missing values to blank', () => {
    expect(
      readPublicBuildArgs({
        ...configuredEnvironment,
        NEXT_PUBLIC_FIREBASE_APP_ID: undefined,
        PRIVATE_VALUE: 'do-not-read'
      })
    ).toEqual({
      NEXT_PUBLIC_FIREBASE_API_KEY:
        configuredEnvironment.NEXT_PUBLIC_FIREBASE_API_KEY,
      NEXT_PUBLIC_FIREBASE_PROJECT_ID:
        configuredEnvironment.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      NEXT_PUBLIC_FIREBASE_SENDER_ID:
        configuredEnvironment.NEXT_PUBLIC_FIREBASE_SENDER_ID,
      NEXT_PUBLIC_FIREBASE_APP_ID: '',
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID:
        configuredEnvironment.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
      NEXT_PUBLIC_LGL_API_KEY: configuredEnvironment.NEXT_PUBLIC_LGL_API_KEY
    });
  });

  it('returns every configured public build argument', () => {
    expect(requirePublicBuildArgs(configuredEnvironment)).toEqual(
      configuredEnvironment
    );
  });

  it('lists every missing or blank name without exposing configured values', () => {
    const configuredValue = 'configured-value-must-stay-private';

    expect(() =>
      requirePublicBuildArgs({
        NEXT_PUBLIC_FIREBASE_API_KEY: configuredValue,
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: ' ',
        NEXT_PUBLIC_FIREBASE_SENDER_ID: '\t'
      })
    ).toThrowError(
      new Error(
        [
          'Missing required public build arguments:',
          'NEXT_PUBLIC_FIREBASE_PROJECT_ID,',
          'NEXT_PUBLIC_FIREBASE_SENDER_ID,',
          'NEXT_PUBLIC_FIREBASE_APP_ID,',
          'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,',
          'NEXT_PUBLIC_LGL_API_KEY'
        ].join(' ')
      )
    );

    let thrownError: unknown;

    try {
      requirePublicBuildArgs({
        NEXT_PUBLIC_FIREBASE_API_KEY: configuredValue
      });
    } catch (error) {
      thrownError = error;
    }

    expect(thrownError).toBeDefined();
    expect(thrownError).toBeInstanceOf(Error);
    expect((thrownError as Error).message).not.toContain(configuredValue);
  });

  it('validates from the CLI without printing configured values', () => {
    const output: string[] = [];
    const configuredValue = 'configured-value-must-stay-private';
    const environment = Object.fromEntries(
      PUBLIC_ENV_NAMES.map((name) => [name, configuredValue])
    );

    expect(
      runPublicEnvCli({
        environment,
        writeError: (message) => output.push(message),
        writeOutput: (message) => output.push(message)
      })
    ).toBe(0);

    expect(output.join('\n')).toContain(PUBLIC_ENV_NAMES.join(', '));
    expect(output.join('\n')).not.toContain(configuredValue);
  });

  it('returns a nonzero CLI result with every missing name and no values', () => {
    const errors: string[] = [];
    const configuredValue = 'configured-value-must-stay-private';

    expect(
      runPublicEnvCli({
        environment: {
          NEXT_PUBLIC_FIREBASE_API_KEY: configuredValue,
          NEXT_PUBLIC_FIREBASE_PROJECT_ID: ' '
        },
        writeError: (message) => errors.push(message),
        writeOutput: vi.fn()
      })
    ).toBe(1);

    const output = errors.join('\n');
    expect(output).toContain('NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    expect(output).toContain('NEXT_PUBLIC_FIREBASE_SENDER_ID');
    expect(output).toContain('NEXT_PUBLIC_FIREBASE_APP_ID');
    expect(output).toContain('NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID');
    expect(output).toContain('NEXT_PUBLIC_LGL_API_KEY');
    expect(output).not.toContain(configuredValue);
  });
});
