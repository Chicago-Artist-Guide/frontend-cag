import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { runCaptureCommand } from './capture';
import {
  parseVisualArgs,
  resolveSafeVisualPaths,
  resolveVisualPaths,
  resolveVisualSelection,
  type VisualEnvironment
} from './config';
import { runDiffCommand } from './diff';
import { acquireGenerationLock } from './diff-core';
import { MANIFEST, type VisualSelection } from './manifest';
import { runReportCommand } from './report';

type StageRunner = (
  argv: readonly string[],
  environment: VisualEnvironment,
  cwd: string
) => Promise<0 | 1>;

export interface VerifyDependencies {
  capture: StageRunner;
  diff: StageRunner;
  report: StageRunner;
}

const productionDependencies: VerifyDependencies = {
  capture: runCaptureCommand,
  diff: runDiffCommand,
  report: runReportCommand
};

const selectionArgs = (selection: VisualSelection): string[] => {
  const args: string[] = [];
  if (selection.clusters) {
    args.push(`--cluster=${selection.clusters.join(',')}`);
  }
  if (selection.ids) args.push(`--only=${selection.ids.join(',')}`);
  if (selection.target) args.push(`--target=${selection.target}`);
  if (selection.viewports) {
    args.push(`--viewport=${selection.viewports.join(',')}`);
  }
  return args;
};

const runStage = async (
  runner: StageRunner,
  argv: readonly string[],
  environment: VisualEnvironment,
  cwd: string
): Promise<0 | 1> => {
  try {
    return (await runner(argv, environment, cwd)) === 0 ? 0 : 1;
  } catch {
    return 1;
  }
};

const invalidateGeneratedEvidence = async (
  captureSummary: string,
  diffDir: string,
  reportFile: string
): Promise<boolean> => {
  let lock: Awaited<ReturnType<typeof acquireGenerationLock>> | undefined;
  try {
    await mkdir(path.dirname(captureSummary), { recursive: true });
    lock = await acquireGenerationLock(diffDir);
    await rm(captureSummary, { force: true });
    await rm(diffDir, { force: true, recursive: true });
    return true;
  } catch {
    if (lock) await rm(reportFile, { force: true }).catch(() => undefined);
    return false;
  } finally {
    await lock?.release().catch(() => undefined);
  }
};

export async function runVerifyCommand(
  argv: readonly string[],
  environment: VisualEnvironment,
  cwd: string,
  dependencies: VerifyDependencies = productionDependencies
): Promise<0 | 1> {
  let captureArgs: string[];
  let diffArgs: string[];
  let paths;
  try {
    const args = parseVisualArgs(argv, 'verify');
    paths = resolveSafeVisualPaths(environment, cwd);
    const selection = resolveVisualSelection(args, MANIFEST, cwd);
    resolveVisualPaths(environment, cwd);
    captureArgs = ['capture', ...selectionArgs(selection)];
    diffArgs = argv.some((argument) => argument.startsWith('--threshold='))
      ? [`--threshold=${String(args.threshold)}`]
      : [];
  } catch {
    return 1;
  }

  if (
    paths.captureSummary !==
      path.join(paths.artifactDir, 'capture-summary.json') ||
    paths.diffDir !== path.join(paths.artifactDir, 'diff') ||
    paths.reportFile !== path.join(paths.diffDir, 'report.html')
  ) {
    return 1;
  }
  const verifyTarget = path.join(paths.artifactDir, 'verify-run');
  let verifyLock: Awaited<ReturnType<typeof acquireGenerationLock>> | undefined;
  try {
    await mkdir(paths.artifactDir, { recursive: true });
    verifyLock = await acquireGenerationLock(verifyTarget);
  } catch {
    return 1;
  }

  try {
    if (
      !(await invalidateGeneratedEvidence(
        paths.captureSummary,
        paths.diffDir,
        paths.reportFile
      ))
    ) {
      return 1;
    }

    const captureCode = await runStage(
      dependencies.capture,
      captureArgs,
      environment,
      cwd
    );
    const diffCode = await runStage(
      dependencies.diff,
      diffArgs,
      environment,
      cwd
    );
    const reportCode = await runStage(
      dependencies.report,
      [],
      environment,
      cwd
    );
    return captureCode || diffCode || reportCode;
  } finally {
    await verifyLock.release().catch(() => undefined);
  }
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  void runVerifyCommand(process.argv.slice(2), process.env, process.cwd())
    .then((code) => {
      process.exitCode = code;
    })
    .catch(() => {
      process.exitCode = 1;
    });
}
