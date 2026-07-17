import { existsSync, realpathSync } from 'node:fs';
import path from 'node:path';
import {
  ROUTE_CLUSTERS,
  VIEWPORT_NAMES,
  selectVisualCases,
  type RouteCluster,
  type RouteEntry,
  type ViewportName,
  type VisualSelection
} from './manifest';

export type VisualCommand =
  | 'baseline'
  | 'capture'
  | 'diff'
  | 'report'
  | 'verify';

export type VisualOutputBucket = 'baseline' | 'current';

export interface VisualArgs {
  clusters?: RouteCluster[];
  command: VisualCommand;
  ids?: string[];
  outputBucket?: VisualOutputBucket;
  target?: string;
  threshold: number;
  viewports?: ViewportName[];
}

export interface VisualEnvironment {
  VR_ARTIFACT_DIR?: string;
  VR_AUTH_DIR?: string;
  VR_BASELINE_DIR?: string;
  VR_BASE_URL?: string;
}

export interface VisualPaths {
  artifactDir: string;
  authDir: string;
  baseUrl: string;
  baselineDir: string;
  captureSummary: string;
  currentDir: string;
  diffDir: string;
  reportFile: string;
  summaryFile: string;
}

const DEFAULT_THRESHOLD = 0.001;

const parseList = (value: string, flag: string): string[] => {
  const values = value.split(',').map((item) => item.trim());
  if (values.some((item) => item.length === 0)) {
    throw new Error(`${flag} must not contain empty values`);
  }
  const duplicate = values.find(
    (item, index) => values.indexOf(item) !== index
  );
  if (duplicate) {
    throw new Error(`duplicate ${flag} value: ${duplicate}`);
  }
  return values;
};

const assertAllowedValues = <T extends string>(
  values: readonly string[],
  allowed: readonly T[],
  problem: string
): T[] =>
  values.map((value) => {
    if (!allowed.includes(value as T)) {
      throw new Error(`${problem}: ${value}`);
    }
    return value as T;
  });

const parseThreshold = (value: string): number => {
  const threshold = Number(value);
  if (!Number.isFinite(threshold)) {
    throw new Error('--threshold must be a finite number');
  }
  if (threshold < 0) {
    throw new Error('--threshold must be greater than or equal to 0');
  }
  if (threshold >= 1) {
    throw new Error('--threshold must be less than 1');
  }
  return threshold;
};

const outputBucketFor = (
  command: VisualCommand,
  requestedBucket: string | undefined
): VisualOutputBucket | undefined => {
  if (requestedBucket === 'baseline' && command !== 'baseline') {
    throw new Error('only the baseline command may write the baseline bucket');
  }

  if (command === 'baseline') {
    if (requestedBucket !== undefined && requestedBucket !== 'baseline') {
      throw new Error('baseline command only accepts --bucket=baseline');
    }
    return 'baseline';
  }

  if (command === 'capture') {
    if (requestedBucket !== undefined && requestedBucket !== 'current') {
      throw new Error(`unknown bucket: ${requestedBucket}`);
    }
    return 'current';
  }

  if (requestedBucket !== undefined) {
    throw new Error(`${command} does not accept --bucket`);
  }
  return undefined;
};

export function parseVisualArgs(
  argv: readonly string[],
  command: VisualCommand
): VisualArgs {
  const values = new Map<string, string>();

  for (const argument of argv) {
    if (!argument.startsWith('--')) {
      throw new Error(`malformed visual argument: ${argument}`);
    }
    const separator = argument.indexOf('=');
    if (separator <= 2) {
      throw new Error(`malformed visual argument: ${argument}`);
    }
    const flag = argument.slice(2, separator);
    const value = argument.slice(separator + 1);
    if (value.trim().length === 0) {
      throw new Error(`--${flag} must not be empty`);
    }
    if (values.has(flag)) {
      throw new Error(`duplicate visual flag: --${flag}`);
    }
    values.set(flag, value);
  }

  const supportedFlags = new Set([
    'bucket',
    'cluster',
    'only',
    'target',
    'threshold',
    'viewport'
  ]);
  for (const flag of values.keys()) {
    if (!supportedFlags.has(flag)) {
      throw new Error(`unknown visual flag: --${flag}`);
    }
  }

  const args: VisualArgs = {
    command,
    threshold: values.has('threshold')
      ? parseThreshold(values.get('threshold') as string)
      : DEFAULT_THRESHOLD
  };
  const outputBucket = outputBucketFor(command, values.get('bucket'));
  if (outputBucket !== undefined) args.outputBucket = outputBucket;

  const clusterValue = values.get('cluster');
  if (clusterValue !== undefined) {
    args.clusters = assertAllowedValues(
      parseList(clusterValue, '--cluster'),
      ROUTE_CLUSTERS,
      'unknown route cluster'
    );
  }
  const idValue = values.get('only');
  if (idValue !== undefined) args.ids = parseList(idValue, '--only');

  const target = values.get('target');
  if (target !== undefined) args.target = target.trim();

  const viewportValue = values.get('viewport');
  if (viewportValue !== undefined) {
    args.viewports = assertAllowedValues(
      parseList(viewportValue, '--viewport'),
      VIEWPORT_NAMES,
      'unknown viewport'
    );
  }

  return args;
}

const resolveEnvironmentPath = (
  environment: VisualEnvironment,
  key: keyof Pick<
    VisualEnvironment,
    'VR_ARTIFACT_DIR' | 'VR_AUTH_DIR' | 'VR_BASELINE_DIR'
  >,
  fallback: string,
  cwd: string
): string => {
  const configured = environment[key];
  if (configured !== undefined && configured.trim().length === 0) {
    throw new Error(`${key} must not be empty`);
  }
  return path.resolve(cwd, configured?.trim() ?? fallback);
};

interface CanonicalPath {
  caseInsensitive: boolean;
  value: string;
}

const toggledCaseAlias = (candidate: string): string | undefined => {
  const basename = path.basename(candidate);
  const toggled = basename.replace(/[A-Za-z]/u, (character) =>
    character === character.toLowerCase()
      ? character.toUpperCase()
      : character.toLowerCase()
  );
  if (toggled === basename) return undefined;
  return path.join(path.dirname(candidate), toggled);
};

const isCaseInsensitiveFilesystem = (existingPath: string): boolean => {
  let candidate = existingPath;
  while (path.dirname(candidate) !== candidate) {
    const alias = toggledCaseAlias(candidate);
    if (alias !== undefined) {
      if (!existsSync(alias)) return false;
      try {
        return realpathSync.native(alias) === realpathSync.native(candidate);
      } catch {
        return false;
      }
    }
    candidate = path.dirname(candidate);
  }
  return process.platform === 'win32';
};

const canonicalizeForComparison = (candidate: string): CanonicalPath => {
  let existingAncestor = candidate;
  const missingSegments: string[] = [];

  while (!existsSync(existingAncestor)) {
    const parent = path.dirname(existingAncestor);
    if (parent === existingAncestor) break;
    missingSegments.unshift(path.basename(existingAncestor));
    existingAncestor = parent;
  }

  const canonicalAncestor = existsSync(existingAncestor)
    ? realpathSync.native(existingAncestor)
    : existingAncestor;
  return {
    caseInsensitive: isCaseInsensitiveFilesystem(existingAncestor),
    value: path.resolve(canonicalAncestor, ...missingSegments)
  };
};

const isAncestorOrEqual = (ancestor: string, candidate: string): boolean => {
  const relative = path.relative(ancestor, candidate);
  return (
    relative === '' ||
    (!relative.startsWith(`..${path.sep}`) &&
      relative !== '..' &&
      !path.isAbsolute(relative))
  );
};

const assertDirectoriesDoNotOverlap = (
  leftLabel: string,
  left: string,
  rightLabel: string,
  right: string
): void => {
  const canonicalLeft = canonicalizeForComparison(left);
  const canonicalRight = canonicalizeForComparison(right);
  const shouldFoldCase =
    canonicalLeft.caseInsensitive || canonicalRight.caseInsensitive;
  const comparableLeft = shouldFoldCase
    ? canonicalLeft.value.toLowerCase()
    : canonicalLeft.value;
  const comparableRight = shouldFoldCase
    ? canonicalRight.value.toLowerCase()
    : canonicalRight.value;
  if (
    isAncestorOrEqual(comparableLeft, comparableRight) ||
    isAncestorOrEqual(comparableRight, comparableLeft)
  ) {
    throw new Error(
      `${leftLabel} and ${rightLabel} directories must not overlap`
    );
  }
};

const resolveBaseUrl = (configured: string | undefined): string => {
  if (configured !== undefined && configured.trim().length === 0) {
    throw new Error('VR_BASE_URL must not be empty');
  }
  const raw = configured?.trim() ?? 'http://127.0.0.1:3000';
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error('VR_BASE_URL must be a valid HTTP(S) URL');
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error('VR_BASE_URL must be a valid HTTP(S) URL');
  }
  if (url.username.length > 0 || url.password.length > 0) {
    throw new Error('VR_BASE_URL must not contain credentials');
  }
  if (url.search.length > 0 || url.hash.length > 0) {
    throw new Error('VR_BASE_URL must not contain a query or hash');
  }
  if (!/^\/+$/u.test(url.pathname)) {
    throw new Error('VR_BASE_URL must be an origin without a pathname');
  }
  return url.origin;
};

export function resolveVisualPaths(
  environment: VisualEnvironment,
  cwd: string
): VisualPaths {
  const baselineDir = resolveEnvironmentPath(
    environment,
    'VR_BASELINE_DIR',
    'scripts/visual-regression/snapshots/baseline',
    cwd
  );
  const artifactDir = resolveEnvironmentPath(
    environment,
    'VR_ARTIFACT_DIR',
    'scripts/visual-regression/artifacts',
    cwd
  );
  const authDir = resolveEnvironmentPath(
    environment,
    'VR_AUTH_DIR',
    'scripts/visual-regression/.auth',
    cwd
  );

  assertDirectoriesDoNotOverlap(
    'baseline',
    baselineDir,
    'artifact',
    artifactDir
  );
  assertDirectoriesDoNotOverlap('baseline', baselineDir, 'auth', authDir);
  assertDirectoriesDoNotOverlap('artifact', artifactDir, 'auth', authDir);

  const currentDir = path.join(artifactDir, 'current');
  const diffDir = path.join(artifactDir, 'diff');
  return {
    artifactDir,
    authDir,
    baseUrl: resolveBaseUrl(environment.VR_BASE_URL),
    baselineDir,
    captureSummary: path.join(artifactDir, 'capture-summary.json'),
    currentDir,
    diffDir,
    reportFile: path.join(diffDir, 'report.html'),
    summaryFile: path.join(diffDir, 'summary.json')
  };
}

export function resolveVisualSelection(
  args: VisualArgs,
  manifest: readonly RouteEntry[],
  cwd: string
): VisualSelection {
  const selection: VisualSelection = {};
  if (args.clusters !== undefined) selection.clusters = [...args.clusters];
  if (args.ids !== undefined) selection.ids = [...args.ids];
  if (args.target !== undefined) {
    if (path.isAbsolute(args.target)) {
      throw new Error(
        '--target must be repository-relative and remain within the repository'
      );
    }
    const repositoryRoot = path.resolve(cwd);
    const resolvedTarget = path.resolve(repositoryRoot, args.target);
    const relativeTarget = path.relative(repositoryRoot, resolvedTarget);
    if (
      relativeTarget === '' ||
      relativeTarget === '..' ||
      relativeTarget.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativeTarget)
    ) {
      throw new Error(
        '--target must be repository-relative and remain within the repository'
      );
    }
    selection.target = relativeTarget.split(path.sep).join('/');
  }
  if (args.viewports !== undefined) selection.viewports = [...args.viewports];

  selectVisualCases(manifest, selection);
  return selection;
}
