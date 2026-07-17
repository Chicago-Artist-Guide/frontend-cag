import path from 'node:path';
import { pathToFileURL } from 'node:url';
import {
  parseVisualArgs,
  resolveSafeVisualPaths,
  type VisualEnvironment
} from './config';
import { runDiff } from './diff-core';
import { MANIFEST } from './manifest';

const PIXEL_SENSITIVITY = 0.1;

export async function runDiffCommand(
  argv: readonly string[],
  environment: VisualEnvironment,
  cwd: string
): Promise<0 | 1> {
  const args = parseVisualArgs(argv, 'diff');
  const paths = resolveSafeVisualPaths(environment, cwd);
  const result = await runDiff({
    manifest: MANIFEST,
    maxDiffRatio: args.threshold,
    paths,
    pixelSensitivity: PIXEL_SENSITIVITY
  });
  return result.exitCode;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  void runDiffCommand(process.argv.slice(2), process.env, process.cwd())
    .then((code) => {
      process.exitCode = code;
    })
    .catch(() => {
      process.exitCode = 1;
    });
}
