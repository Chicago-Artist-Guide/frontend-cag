// @vitest-environment node

import { describe, expect, it } from 'vitest';
import { runCaptureCommand } from './capture';
import { runDiffCommand } from './diff';
import { runReportCommand } from './report';

describe('visual command entrypoints', () => {
  it('are import-safe and leave process exit ownership to their main guards', async () => {
    const previous = process.exitCode;
    process.exitCode = 73;
    await import('./auth-setup');
    await import('./capture');
    await import('./diff');
    await import('./report');
    await import('./verify');
    expect(process.exitCode).toBe(73);
    process.exitCode = previous;
  });

  it('rejects flags in the runner that owns each command', async () => {
    const environment = {
      VR_ARTIFACT_DIR: '/tmp/cag-vr-entry-artifacts',
      VR_AUTH_DIR: '/tmp/cag-vr-entry-auth',
      VR_BASELINE_DIR: '/tmp/cag-vr-entry-baseline'
    };
    await expect(
      runCaptureCommand(['wrong'], environment, '/tmp/cag-vr-entry')
    ).rejects.toThrow('leading baseline or capture command');
    await expect(
      runDiffCommand(['--only=home'], environment, '/tmp/cag-vr-entry')
    ).rejects.toThrow('diff does not accept');
    await expect(
      runReportCommand(['--threshold=0.1'], environment, '/tmp/cag-vr-entry')
    ).rejects.toThrow('report does not accept');
  });
});
