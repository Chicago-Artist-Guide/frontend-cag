import { runCapture, type CaptureCommand } from './capture-core';
import {
  parseVisualArgs,
  resolveSafeVisualPaths,
  resolveVisualPaths,
  resolveVisualSelection,
  type VisualEnvironment,
  type VisualPaths
} from './config';
import {
  MANIFEST,
  selectVisualCases,
  type VisualCase,
  type VisualSelection
} from './manifest';

export interface CaptureInvocation {
  cases: VisualCase[];
  command: CaptureCommand;
  paths: VisualPaths;
  selection: VisualSelection;
}

const parseCommand = (
  argv: readonly string[]
): { command: CaptureCommand; flags: string[] } => {
  const [requestedCommand, ...flags] = argv;
  if (requestedCommand !== 'baseline' && requestedCommand !== 'capture') {
    throw new Error(
      'visual capture requires a leading baseline or capture command'
    );
  }
  return { command: requestedCommand, flags };
};

export async function resolveCaptureInvocation(
  argv: readonly string[],
  environment: VisualEnvironment,
  cwd: string
): Promise<CaptureInvocation | null> {
  const { command, flags } = parseCommand(argv);
  const safePaths = resolveSafeVisualPaths(environment, cwd);
  try {
    const paths = resolveVisualPaths(environment, cwd);
    const args = parseVisualArgs(flags, command);
    const selection = resolveVisualSelection(args, MANIFEST, cwd);
    return {
      cases: selectVisualCases(MANIFEST, selection),
      command,
      paths,
      selection
    };
  } catch (error) {
    await runCapture({
      artifactDir: safePaths.artifactDir,
      baseUrl: environment.VR_BASE_URL ?? 'http://127.0.0.1:3000',
      captureOne: async () => {
        throw new Error('capture must not run after preflight failure');
      },
      cases: [],
      command,
      prepare: async () => {
        throw error;
      },
      selection: {},
      summaryPath: safePaths.captureSummary
    });
    return null;
  }
}
