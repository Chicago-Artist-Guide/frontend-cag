import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseVisualArgs, resolveSafeVisualPaths } from './config';
import { runDiff } from './diff-core';
import { MANIFEST } from './manifest';

const PIXEL_SENSITIVITY = 0.1;

async function main(): Promise<void> {
  const args = parseVisualArgs(process.argv.slice(2), 'diff');
  const paths = resolveSafeVisualPaths(process.env, process.cwd());
  const result = await runDiff({
    manifest: MANIFEST,
    maxDiffRatio: args.threshold,
    paths,
    pixelSensitivity: PIXEL_SENSITIVITY
  });
  process.exitCode = result.exitCode;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  void main().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}
