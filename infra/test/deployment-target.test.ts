import {
  configurePlatformApp,
  readPublicBuildArguments
} from '../lib/application.js';
import {
  resolveDeploymentTarget,
  resolveRequestedDeploymentTargets
} from '../lib/deployment-target.js';
import { createTestApp } from './test-app.js';

const buildArguments = {
  NEXT_PUBLIC_FIREBASE_API_KEY: 'api-key',
  NEXT_PUBLIC_FIREBASE_APP_ID: 'app-id',
  NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: 'measurement-id',
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: 'project-id',
  NEXT_PUBLIC_FIREBASE_SENDER_ID: 'sender-id',
  NEXT_PUBLIC_LGL_API_KEY: 'lgl-key'
};

describe('resolveDeploymentTarget', () => {
  it.each([
    [
      'staging',
      {
        deploymentId: 'staging',
        isEphemeral: false,
        isProduction: false,
        stackName: 'CagPlatform-staging',
        stageName: 'staging'
      }
    ],
    [
      'production',
      {
        deploymentId: 'production',
        isEphemeral: false,
        isProduction: true,
        stackName: 'CagPlatform-production',
        stageName: 'production'
      }
    ]
  ] as const)('resolves the %s persistent target', (stage, expected) => {
    expect(resolveDeploymentTarget(stage)).toEqual(expected);
  });

  it('resolves a valid lowercase preview identifier', () => {
    expect(resolveDeploymentTarget('preview', 'dev-511')).toEqual({
      deploymentId: 'preview-dev-511',
      isEphemeral: true,
      isProduction: false,
      stackName: 'CagPlatform-preview-dev-511',
      stageName: 'preview'
    });
  });

  it.each([
    undefined,
    '',
    'ab',
    'abcdefghijklmnopqrstu',
    '-abc',
    'abc-',
    'dev--511',
    'dev/511',
    'dev_511',
    'dev 511',
    'dev;511',
    'DEV-511',
    'staging',
    'production',
    'preview'
  ])('rejects unsafe or reserved preview identifier %j', (previewId) => {
    expect(() => resolveDeploymentTarget('preview', previewId)).toThrow(
      /preview/i
    );
  });

  it('accepts a 20-character preview identifier', () => {
    const previewId = 'abcdefghijklmnopqrst';

    expect(resolveDeploymentTarget('preview', previewId).stackName).toBe(
      `CagPlatform-preview-${previewId}`
    );
  });

  it.each([undefined, null, '', 'qa', 'prod'])(
    'rejects an unknown explicit stage %j',
    (stage) => {
      expect(() => resolveDeploymentTarget(stage)).toThrow(/stage/i);
    }
  );
});

describe('resolveRequestedDeploymentTargets', () => {
  it('returns both persistent targets when no stage context is supplied', () => {
    expect(resolveRequestedDeploymentTargets(undefined)).toEqual([
      resolveDeploymentTarget('staging'),
      resolveDeploymentTarget('production')
    ]);
  });

  it('returns exactly the requested target when stage context is supplied', () => {
    expect(resolveRequestedDeploymentTargets('preview', 'dev-511')).toEqual([
      resolveDeploymentTarget('preview', 'dev-511')
    ]);
  });
});

describe('configurePlatformApp', () => {
  it('creates staging and production by default', () => {
    const app = createTestApp();

    const stacks = configurePlatformApp(app, buildArguments);

    expect(stacks.map((stack) => stack.stackName)).toEqual([
      'CagPlatform-staging',
      'CagPlatform-production'
    ]);
  });

  it('creates only an explicitly requested preview', () => {
    const app = createTestApp({
      context: { previewId: 'dev-511', stage: 'preview' }
    });

    const stacks = configurePlatformApp(app, buildArguments);

    expect(stacks.map((stack) => stack.stackName)).toEqual([
      'CagPlatform-preview-dev-511'
    ]);
  });

  it('reads all six public build arguments without requiring credentials', () => {
    expect(readPublicBuildArguments({})).toEqual({
      NEXT_PUBLIC_FIREBASE_API_KEY: '',
      NEXT_PUBLIC_FIREBASE_APP_ID: '',
      NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID: '',
      NEXT_PUBLIC_FIREBASE_PROJECT_ID: '',
      NEXT_PUBLIC_FIREBASE_SENDER_ID: '',
      NEXT_PUBLIC_LGL_API_KEY: ''
    });
  });
});
