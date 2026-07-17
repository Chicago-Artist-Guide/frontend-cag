import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { App, type AppProps } from 'aws-cdk-lib';
import { afterEach } from 'vitest';

const outputDirectories: string[] = [];

export const createTestApp = (props: AppProps = {}) => {
  const outdir = mkdtempSync(join(tmpdir(), 'cag-cdk-test-'));
  outputDirectories.push(outdir);

  return new App({ ...props, outdir });
};

afterEach(() => {
  for (const outputDirectory of outputDirectories.splice(0)) {
    rmSync(outputDirectory, { force: true, recursive: true });
  }
});
