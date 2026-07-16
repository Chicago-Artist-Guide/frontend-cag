import {
  DEPLOYMENT_CONFIGURATION_NAMES,
  fingerprintDeploymentConfiguration
} from './deployment-config.mjs';

const configuredEnvironment = Object.fromEntries(
  DEPLOYMENT_CONFIGURATION_NAMES.map((name) => [name, `value-for-${name}`])
);

describe('deployment configuration fingerprint', () => {
  it('covers the AWS destination and every public image build value', () => {
    expect(DEPLOYMENT_CONFIGURATION_NAMES).toEqual([
      'AWS_ACCOUNT_ID',
      'AWS_REGION',
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_APP_ID',
      'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
      'NEXT_PUBLIC_FIREBASE_SENDER_ID',
      'NEXT_PUBLIC_LGL_API_KEY'
    ]);
    expect(DEPLOYMENT_CONFIGURATION_NAMES).not.toContain('AWS_ROLE_ARN');
  });

  it('is deterministic and emits only a SHA-256 fingerprint', () => {
    const first = fingerprintDeploymentConfiguration(configuredEnvironment);
    const second = fingerprintDeploymentConfiguration({
      ...configuredEnvironment
    });

    expect(first).toBe(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    for (const value of Object.values(configuredEnvironment)) {
      expect(first).not.toContain(value);
    }
  });

  it.each(DEPLOYMENT_CONFIGURATION_NAMES)(
    'changes when %s changes',
    (name) => {
      const baseline = fingerprintDeploymentConfiguration(
        configuredEnvironment
      );
      const changed = fingerprintDeploymentConfiguration({
        ...configuredEnvironment,
        [name]: `${configuredEnvironment[name]}-changed`
      });

      expect(changed).not.toBe(baseline);
    }
  );

  it('rejects a missing value without exposing configured values', () => {
    expect(() =>
      fingerprintDeploymentConfiguration({
        ...configuredEnvironment,
        AWS_REGION: '   '
      })
    ).toThrow('AWS_REGION');
  });
});
