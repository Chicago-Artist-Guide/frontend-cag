import { createHash, randomUUID } from 'node:crypto';
import { spawn, type ChildProcess } from 'node:child_process';
import { constants as fsConstants } from 'node:fs';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  writeFile
} from 'node:fs/promises';
import net from 'node:net';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

export const CALIBRATION_CASES = [
  'about-us',
  'donate',
  'faq',
  'forgot-password',
  'login',
  'signup'
] as const;

export const CALIBRATION_RELATIVE_FILES = CALIBRATION_CASES.map(
  (id) => `${id}/desktop.png`
);

const PUBLIC_ENVIRONMENT_NAMES = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_APP_ID',
  'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_SENDER_ID',
  'NEXT_PUBLIC_LGL_API_KEY'
] as const;

type CalibrationStage = 'build' | 'semantic' | 'visual';

export interface CalibrationInventoryEntry {
  bytes: number;
  kind?: 'directory';
  relativePath: string;
  sha256: string;
}

export type CalibrationInventory = CalibrationInventoryEntry[];

export interface CalibrationProvenance {
  approval: {
    approvedAt: string;
    approvedBy: string;
    reason: string;
  };
  baselineSet: string;
  files: Array<{
    approvedCapture: string;
    bytes: number;
    independentCapture: string;
    reason: string;
    relationship: 'byte-identical';
    relativePath: string;
    sha256: string;
    sourceRevision?: string;
  }>;
  schemaVersion: 1;
}

export interface CalibrationPaths {
  artifactDir: string;
  authDir: string;
  baselineDir: string;
  generationDir: string;
  recordFile: string;
}

export interface CalibrationEnvironment {
  approvedBaselineDir: string;
  approvedStagingDir: string;
  childEnvironment: Record<string, string>;
  publicValueHashes: Array<{ name: string; sha256: string }>;
}

export interface EvidenceRootIdentity {
  canonicalPath: string;
  device: string;
  inode: string;
}

export interface CommandResult {
  code: number | null;
  signal: NodeJS.Signals | null;
}

export interface CalibrationCommandSpecification {
  args: string[];
  argv: string[];
  cwd: string;
  environment: Record<string, string>;
  executable: string;
  signal?: AbortSignal;
  stage: CalibrationStage;
  timeoutMs: number;
}

export interface SpawnedChild {
  exitCode: number | null;
  kill(signal?: NodeJS.Signals | number): boolean;
  pid?: number;
  signalCode: NodeJS.Signals | null;
}

export interface ProcessTreeOperations {
  isAlive(child: SpawnedChild): boolean;
  kill(child: SpawnedChild, signal: NodeJS.Signals): boolean;
}

interface BuildMetadata {
  buildId: string;
  gitRevision: string;
  nextVersion: string;
  npmVersion: string;
}

interface RecordedCommand {
  argv: string[];
  code: number | null;
  signal?: NodeJS.Signals | null;
}

export interface CalibrationRecord {
  commands: Partial<Record<CalibrationStage, RecordedCommand>>;
  completedAt?: string;
  evidence: {
    copiedInventory: CalibrationInventory;
    sourceInventory: CalibrationInventory;
    stagingInventory: CalibrationInventory;
  };
  failure?: { code: string; stage: string };
  failures: Array<{ code: string; stage: string }>;
  generation: string;
  metadata?: BuildMetadata & { nodeVersion: string };
  provenance:
    | { status: 'unverified' }
    | (CalibrationProvenance & { status: 'verified' });
  publicEnvironment: Array<{ name: string; sha256: string }>;
  readiness: {
    health: boolean;
    hydratedFaq: boolean;
  };
  reports: {
    captureSummary: 'artifacts/capture-summary.json';
    html: 'artifacts/diff/report.html';
    summary: 'artifacts/diff/summary.json';
  };
  schemaVersion: 1;
  startedAt: string;
  status:
    | 'preparing'
    | 'prepared'
    | 'built'
    | 'ready'
    | 'semantic-complete'
    | 'visual-complete'
    | 'passed'
    | 'failed';
}

export interface CalibrationDependencies {
  assertPortAvailable(): Promise<void>;
  announceRecord(file: string): void;
  assertNoDotenv(cwd: string): Promise<void>;
  copyCorpus(
    sourceRoot: string,
    destinationRoot: string,
    expected: CalibrationInventory
  ): Promise<void>;
  createGeneration(): Promise<CalibrationPaths>;
  inventoryCorpus(root: string): Promise<CalibrationInventory>;
  now(): Date;
  probeHealth(signal?: AbortSignal): Promise<void>;
  probeHydratedRoute(signal?: AbortSignal): Promise<void>;
  readProvenance(
    root: string,
    selection: CalibrationInventory
  ): Promise<CalibrationProvenance>;
  readBuildMetadata(
    cwd: string,
    environment: Record<string, string>
  ): Promise<BuildMetadata>;
  resolveEvidenceRoot(root: string): Promise<EvidenceRootIdentity>;
  runCommand(
    specification: CalibrationCommandSpecification
  ): Promise<CommandResult>;
  spawnServer(cwd: string, environment: Record<string, string>): SpawnedChild;
  stopServer(child: SpawnedChild, exit: Promise<CommandResult>): Promise<void>;
  waitForServerExit(child: SpawnedChild): Promise<CommandResult>;
  writeRecord(file: string, record: CalibrationRecord): Promise<void>;
}

export interface CalibrationOptions {
  signal?: AbortSignal;
}

const sha256 = (value: string | Buffer): string =>
  createHash('sha256').update(value).digest('hex');

const legacyCalibrationProvenance = (
  selection: CalibrationInventory
): CalibrationProvenance => ({
  approval: {
    approvedAt: '2026-05-09',
    approvedBy: 'legacy-corpus-review',
    reason: 'Approved React compatibility corpus with independent staging proof.'
  },
  baselineSet: 'legacy-may-2026',
  files: selection.map(({ bytes, relativePath, sha256: fileSha256 }) => ({
    approvedCapture: '2026-05-05',
    bytes,
    independentCapture: '2026-05-09',
    reason: 'Inherited byte-identical compatibility capture.',
    relationship: 'byte-identical',
    relativePath,
    sha256: fileSha256
  })),
  schemaVersion: 1
});

const PROVENANCE_FILE = 'calibration-provenance.json';
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/u;
const SAFE_BASELINE_SET = /^[a-z0-9]+(?:[a-z0-9-]*[a-z0-9])?$/u;
const SHA256 = /^[a-f0-9]{64}$/u;
const GIT_REVISION = /^[a-f0-9]{40}$/u;

const LEGACY_MAY_SELECTION: CalibrationInventory = [
  {
    bytes: 333044,
    relativePath: 'about-us/desktop.png',
    sha256: '1170e9d3925426b07a10e59e7a89597f857aa171ab14223b7d82ccb7257ac8b1'
  },
  {
    bytes: 839746,
    relativePath: 'donate/desktop.png',
    sha256: 'f46a6f7c60b74ec6da3abc715a4b32e5dc3d06b00afedf317daf254c6b1e4efb'
  },
  {
    bytes: 193321,
    relativePath: 'faq/desktop.png',
    sha256: '7341f236880d6206f84ddbe430c9bdca8b0709666298ac1a5b1b2fba9241a088'
  },
  {
    bytes: 66129,
    relativePath: 'forgot-password/desktop.png',
    sha256: '500ac8c3ef8d062e7a1e45d2200e77530f760be161d600c98b2190503ea48463'
  },
  {
    bytes: 66162,
    relativePath: 'login/desktop.png',
    sha256: '2281135f6445b0bbad6b7b869dc1a051d756a7562c599873f4c7501f736e3d09'
  },
  {
    bytes: 87862,
    relativePath: 'signup/desktop.png',
    sha256: '5f6ddb0c2298c0ea5b0e3b8258636bf9f7ad04591e8735ece6c8f80e81dab0fa'
  }
];

const isPinnedLegacyMaySelection = (selection: CalibrationInventory): boolean =>
  selection.length === LEGACY_MAY_SELECTION.length &&
  selection.every((entry, index) => {
    const expected = LEGACY_MAY_SELECTION[index];
    return (
      entry.bytes === expected.bytes &&
      entry.relativePath === expected.relativePath &&
      entry.sha256 === expected.sha256
    );
  });

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const assertExactKeys = (
  value: Record<string, unknown>,
  expected: readonly string[],
  label: string
): void => {
  const actual = Object.keys(value).sort();
  const sortedExpected = [...expected].sort();
  if (
    actual.length !== sortedExpected.length ||
    actual.some((key, index) => key !== sortedExpected[index])
  ) {
    throw new Error(`invalid ${label} fields`);
  }
};

const requiredString = (
  value: unknown,
  label: string,
  pattern?: RegExp
): string => {
  if (
    typeof value !== 'string' ||
    value.trim().length === 0 ||
    (pattern && !pattern.test(value))
  ) {
    throw new Error(`invalid ${label}`);
  }
  return value;
};

const requiredDate = (value: unknown, label: string): string => {
  const date = requiredString(value, label, ISO_DATE);
  const [year, month, day] = date.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    throw new Error(`invalid ${label}`);
  }
  return date;
};

export const validateCalibrationProvenance = (
  value: unknown,
  selection: CalibrationInventory
): CalibrationProvenance => {
  if (!isObject(value)) throw new Error('invalid calibration provenance');
  assertExactKeys(
    value,
    ['approval', 'baselineSet', 'files', 'schemaVersion'],
    'calibration provenance'
  );
  if (value.schemaVersion !== 1) {
    throw new Error('invalid calibration provenance schema');
  }
  const baselineSet = requiredString(
    value.baselineSet,
    'baseline set',
    SAFE_BASELINE_SET
  );
  if (!isObject(value.approval)) {
    throw new Error('invalid calibration approval');
  }
  assertExactKeys(
    value.approval,
    ['approvedAt', 'approvedBy', 'reason'],
    'calibration approval'
  );
  const approval = {
    approvedAt: requiredDate(value.approval.approvedAt, 'approval date'),
    approvedBy: requiredString(value.approval.approvedBy, 'approval owner'),
    reason: requiredString(value.approval.reason, 'approval reason')
  };
  if (!Array.isArray(value.files) || value.files.length !== selection.length) {
    throw new Error('invalid calibration provenance files');
  }
  const files = value.files.map((entry, index) => {
    if (!isObject(entry)) throw new Error('invalid calibration provenance file');
    const expected = selection[index];
    const hasSourceRevision = Object.hasOwn(entry, 'sourceRevision');
    assertExactKeys(
      entry,
      [
        'approvedCapture',
        'bytes',
        'independentCapture',
        'reason',
        'relationship',
        'relativePath',
        'sha256',
        ...(hasSourceRevision ? ['sourceRevision'] : [])
      ],
      'calibration provenance file'
    );
    const relativePath = requiredString(entry.relativePath, 'evidence path');
    const fileSha256 = requiredString(entry.sha256, 'evidence hash', SHA256);
    if (
      !expected ||
      relativePath !== expected.relativePath ||
      entry.bytes !== expected.bytes ||
      fileSha256 !== expected.sha256 ||
      entry.relationship !== 'byte-identical'
    ) {
      throw new Error('calibration provenance does not match evidence');
    }
    const sourceRevision = hasSourceRevision
      ? requiredString(entry.sourceRevision, 'source revision', GIT_REVISION)
      : undefined;
    return {
      approvedCapture: requiredDate(
        entry.approvedCapture,
        'approved capture date'
      ),
      bytes: expected.bytes,
      independentCapture: requiredDate(
        entry.independentCapture,
        'independent capture date'
      ),
      reason: requiredString(entry.reason, 'evidence reason'),
      relationship: 'byte-identical' as const,
      relativePath,
      sha256: fileSha256,
      ...(sourceRevision ? { sourceRevision } : {})
    };
  });
  return { approval, baselineSet, files, schemaVersion: 1 };
};

export const readCalibrationProvenance = async (
  root: string,
  selection: CalibrationInventory
): Promise<CalibrationProvenance> => {
  const provenanceFile = path.join(root, PROVENANCE_FILE);
  try {
    await lstat(provenanceFile);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      if (!isPinnedLegacyMaySelection(selection)) {
        throw new Error(
          'calibration provenance is required for non-legacy evidence'
        );
      }
      return legacyCalibrationProvenance(selection);
    }
    throw new Error('calibration provenance cannot be inspected');
  }
  const evidence = await readRegularFileNoFollow(provenanceFile);
  let parsed: unknown;
  try {
    parsed = JSON.parse(evidence.buffer.toString('utf8'));
  } catch {
    throw new Error('calibration provenance must be valid JSON');
  }
  return validateCalibrationProvenance(parsed, selection);
};

const pathsOverlap = (left: string, right: string): boolean => {
  const relative = path.relative(left, right);
  return (
    relative === '' ||
    (!relative.startsWith('..') && !path.isAbsolute(relative))
  );
};

export function createCalibrationEnvironment(
  environment: NodeJS.ProcessEnv,
  cwd: string
): CalibrationEnvironment {
  if (!path.isAbsolute(cwd)) throw new Error('cwd must be an absolute path');

  const approvedBaselineDir = environment.VR_APPROVED_BASELINE_DIR;
  const approvedStagingDir = environment.VR_APPROVED_STAGING_DIR;
  if (!approvedBaselineDir || !path.isAbsolute(approvedBaselineDir)) {
    throw new Error('VR_APPROVED_BASELINE_DIR must be an absolute path');
  }
  if (!approvedStagingDir || !path.isAbsolute(approvedStagingDir)) {
    throw new Error('VR_APPROVED_STAGING_DIR must be an absolute path');
  }
  const normalizedBaseline = path.resolve(approvedBaselineDir);
  const normalizedStaging = path.resolve(approvedStagingDir);
  if (
    pathsOverlap(normalizedBaseline, normalizedStaging) ||
    pathsOverlap(normalizedStaging, normalizedBaseline)
  ) {
    throw new Error(
      'approved baseline and staging proof roots must be disjoint'
    );
  }

  const childEnvironment: Record<string, string> = { NODE_ENV: 'production' };
  for (const name of [
    'CI',
    'HOME',
    'LANG',
    'LC_ALL',
    'NEXT_TELEMETRY_DISABLED',
    'PATH',
    'TMPDIR'
  ]) {
    const value = environment[name];
    if (value) childEnvironment[name] = value;
  }

  const publicValueHashes: Array<{ name: string; sha256: string }> = [];
  for (const name of PUBLIC_ENVIRONMENT_NAMES) {
    const value = environment[name];
    if (
      value === undefined ||
      (value.length === 0 && name !== 'NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID')
    ) {
      throw new Error(`${name} is required`);
    }
    childEnvironment[name] = value;
    publicValueHashes.push({ name, sha256: sha256(value) });
  }
  publicValueHashes.sort((left, right) => left.name.localeCompare(right.name));

  return {
    approvedBaselineDir: normalizedBaseline,
    approvedStagingDir: normalizedStaging,
    childEnvironment,
    publicValueHashes
  };
}

const sameDescriptorState = (
  left: Awaited<ReturnType<Awaited<ReturnType<typeof open>>['stat']>>,
  right: Awaited<ReturnType<Awaited<ReturnType<typeof open>>['stat']>>
): boolean =>
  left.dev === right.dev &&
  left.ino === right.ino &&
  left.size === right.size &&
  left.mtimeMs === right.mtimeMs &&
  left.ctimeMs === right.ctimeMs;

const readRegularFileNoFollow = async (
  absolutePath: string
): Promise<{ buffer: Buffer; bytes: number; sha256: string }> => {
  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    handle = await open(
      absolutePath,
      fsConstants.O_RDONLY | fsConstants.O_NOFOLLOW
    );
    const before = await handle.stat();
    if (!before.isFile()) throw new Error('not regular');
    const buffer = await handle.readFile();
    const after = await handle.stat();
    if (!after.isFile() || !sameDescriptorState(before, after)) {
      throw new Error('changed during read');
    }
    return { buffer, bytes: buffer.byteLength, sha256: sha256(buffer) };
  } catch {
    throw new Error('approved evidence must be a regular file');
  } finally {
    await handle?.close().catch(() => undefined);
  }
};

const assertSafeEvidenceDirectories = async (
  canonicalRoot: string,
  relativePath: string
): Promise<void> => {
  const segments = path.dirname(relativePath).split(path.sep);
  let current = canonicalRoot;
  for (const segment of segments) {
    current = path.join(current, segment);
    const status = await lstat(current);
    if (!status.isDirectory() || status.isSymbolicLink()) {
      throw new Error('approved evidence directory must be a real directory');
    }
  }
};

export async function resolveEvidenceRootIdentity(
  root: string
): Promise<EvidenceRootIdentity> {
  if (!path.isAbsolute(root)) throw new Error('evidence root must be absolute');
  const canonicalPath = await realpath(root);
  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    handle = await open(
      canonicalPath,
      fsConstants.O_RDONLY | fsConstants.O_DIRECTORY | fsConstants.O_NOFOLLOW
    );
    const before = await handle.stat({ bigint: true });
    if (!before.isDirectory()) throw new Error('not a directory');
    const after = await handle.stat({ bigint: true });
    if (
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.mtimeNs !== after.mtimeNs ||
      before.ctimeNs !== after.ctimeNs
    ) {
      throw new Error('root changed during inspection');
    }
    return {
      canonicalPath,
      device: before.dev.toString(),
      inode: before.ino.toString()
    };
  } catch {
    throw new Error('evidence root must be a stable real directory');
  } finally {
    await handle?.close().catch(() => undefined);
  }
}

export async function inventoryCalibrationCorpus(
  root: string
): Promise<CalibrationInventory> {
  const rootBefore = await resolveEvidenceRootIdentity(root);
  const canonicalRoot = rootBefore.canonicalPath;
  const inventory: CalibrationInventory = [];
  const walk = async (directory: string, prefix: string): Promise<void> => {
    const entries = (await readdir(directory, { withFileTypes: true })).sort(
      (left, right) => left.name.localeCompare(right.name)
    );
    for (const entry of entries) {
      const absolutePath = path.join(directory, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      const status = await lstat(absolutePath);
      if (
        entry.isDirectory() &&
        status.isDirectory() &&
        !status.isSymbolicLink()
      ) {
        inventory.push({
          bytes: 0,
          kind: 'directory',
          relativePath: `${relativePath}/`,
          sha256: sha256('directory')
        });
        await walk(absolutePath, relativePath);
      } else if (
        entry.isFile() &&
        status.isFile() &&
        !status.isSymbolicLink()
      ) {
        const read = await readRegularFileNoFollow(absolutePath);
        inventory.push({
          bytes: read.bytes,
          relativePath,
          sha256: read.sha256
        });
      } else {
        throw new Error(
          'approved evidence tree entries must be real files or directories'
        );
      }
    }
  };
  await walk(canonicalRoot, '');
  inventory.sort((left, right) =>
    left.relativePath.localeCompare(right.relativePath)
  );
  const rootAfter = await resolveEvidenceRootIdentity(root);
  if (JSON.stringify(rootAfter) !== JSON.stringify(rootBefore)) {
    throw new Error('evidence root changed during inventory');
  }
  return inventory;
}

export function selectCalibrationInventory(
  inventory: CalibrationInventory
): CalibrationInventory {
  return CALIBRATION_RELATIVE_FILES.map((relativePath) => {
    const matches = inventory.filter(
      (entry) => entry.relativePath === relativePath && entry.kind === undefined
    );
    if (matches.length !== 1) {
      throw new Error(
        `approved calibration evidence is missing: ${relativePath}`
      );
    }
    return matches[0];
  });
}

const inventoriesEqual = (
  left: CalibrationInventory,
  right: CalibrationInventory
): boolean => JSON.stringify(left) === JSON.stringify(right);

export async function copyCalibrationCorpus(
  sourceRoot: string,
  destinationRoot: string,
  expected: CalibrationInventory
): Promise<void> {
  const canonicalSource = await realpath(sourceRoot);
  for (const entry of expected) {
    if (!CALIBRATION_RELATIVE_FILES.includes(entry.relativePath)) {
      throw new Error('unexpected calibration evidence path');
    }
    await assertSafeEvidenceDirectories(canonicalSource, entry.relativePath);
    const read = await readRegularFileNoFollow(
      path.join(canonicalSource, entry.relativePath)
    );
    if (read.bytes !== entry.bytes || read.sha256 !== entry.sha256) {
      throw new Error('approved evidence changed before copy');
    }
    const destination = path.join(destinationRoot, entry.relativePath);
    await mkdir(path.dirname(destination), { mode: 0o700, recursive: true });
    await writeFile(destination, read.buffer, { flag: 'wx', mode: 0o444 });
    await chmod(destination, 0o444);
  }
  for (const id of CALIBRATION_CASES) {
    await chmod(path.join(destinationRoot, id), 0o555);
  }
  await chmod(destinationRoot, 0o555);
}

export async function assertSecureGenerationParent(
  parent: string
): Promise<void> {
  const status = await lstat(parent).catch(() => undefined);
  const currentUid = process.getuid?.();
  if (
    !status ||
    !status.isDirectory() ||
    status.isSymbolicLink() ||
    currentUid === undefined ||
    status.uid !== currentUid ||
    (await realpath(parent)) !== path.resolve(parent)
  ) {
    throw new Error('calibration parent must be a real owned directory');
  }
  await chmod(parent, 0o700);
  const secured = await lstat(parent);
  if ((secured.mode & 0o777) !== 0o700) {
    throw new Error('calibration parent must have 0700 permissions');
  }
}

export async function assertNoCalibrationDotenv(cwd: string): Promise<void> {
  const names = await readdir(cwd);
  if (
    names.some(
      (name) =>
        name === '.env' ||
        name === '.env.local' ||
        name.startsWith('.env.production')
    )
  ) {
    throw new Error('Next dotenv files are prohibited during calibration');
  }
}

const createCalibrationGeneration = async (): Promise<CalibrationPaths> => {
  const parent = '/private/tmp/cag-vr';
  await mkdir(parent, { mode: 0o700, recursive: true });
  await assertSecureGenerationParent(parent);
  const generationDir = await mkdtemp(path.join(parent, 'calibration-'));
  await chmod(generationDir, 0o700);
  const baselineDir = path.join(generationDir, 'baseline');
  const artifactDir = path.join(generationDir, 'artifacts');
  const authDir = path.join(generationDir, 'auth');
  await Promise.all(
    [baselineDir, artifactDir, authDir].map(async (directory) => {
      await mkdir(directory, { mode: 0o700 });
      await chmod(directory, 0o700);
    })
  );
  return {
    artifactDir,
    authDir,
    baselineDir,
    generationDir,
    recordFile: path.join(generationDir, 'calibration-record.json')
  };
};

const writeCalibrationRecord = async (
  file: string,
  record: CalibrationRecord
): Promise<void> => {
  const temporary = path.join(
    path.dirname(file),
    `.${path.basename(file)}.${process.pid}.${randomUUID()}.tmp`
  );
  try {
    await writeFile(temporary, `${JSON.stringify(record, null, 2)}\n`, {
      flag: 'wx',
      mode: 0o600
    });
    await rename(temporary, file);
    await chmod(file, 0o600);
  } finally {
    await rm(temporary, { force: true }).catch(() => undefined);
  }
};

const announceCalibrationRecord = (file: string): void => {
  process.stderr.write(`Calibration record: ${file}\n`);
};

const waitForChild = (child: ChildProcess): Promise<CommandResult> =>
  new Promise((resolve) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve({ code: child.exitCode, signal: child.signalCode });
      return;
    }
    child.once('error', () => resolve({ code: null, signal: null }));
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });

const signalReason = (
  signal: AbortSignal | undefined
): NodeJS.Signals | null =>
  signal?.reason === 'SIGINT'
    ? 'SIGINT'
    : signal?.reason === 'SIGTERM'
      ? 'SIGTERM'
      : null;

export const failClosedCommandResult = (
  observed: CommandResult,
  terminationRequested: boolean,
  signal: AbortSignal | undefined
): CommandResult =>
  terminationRequested
    ? { code: null, signal: signalReason(signal) }
    : observed;

const killProcessTree = (
  child: SpawnedChild,
  signal: NodeJS.Signals
): boolean => {
  if (process.platform !== 'win32' && child.pid) {
    try {
      process.kill(-child.pid, signal);
      return true;
    } catch {
      return false;
    }
  }
  return child.kill(signal);
};

const isProcessTreeAlive = (child: SpawnedChild): boolean => {
  if (process.platform !== 'win32' && child.pid) {
    try {
      process.kill(-child.pid, 0);
      return true;
    } catch (error) {
      return (error as NodeJS.ErrnoException).code !== 'ESRCH';
    }
  }
  return process.platform === 'win32'
    ? child.exitCode === null && child.signalCode === null
    : false;
};

const productionProcessTreeOperations: ProcessTreeOperations = {
  isAlive: isProcessTreeAlive,
  kill: killProcessTree
};

const runSpawnedCommand = async (
  specification: CalibrationCommandSpecification
): Promise<CommandResult> => {
  if (specification.signal?.aborted) {
    return { code: null, signal: signalReason(specification.signal) };
  }
  const child = spawn(specification.executable, specification.args, {
    cwd: specification.cwd,
    detached: process.platform !== 'win32',
    env: specification.environment,
    shell: false,
    stdio: 'inherit'
  });
  const exit = waitForChild(child);
  let termination: Promise<void> | undefined;
  let resolveTermination: ((result: CommandResult) => void) | undefined;
  let rejectTermination: ((error: unknown) => void) | undefined;
  const terminationOutcome = new Promise<CommandResult>((resolve, reject) => {
    resolveTermination = resolve;
    rejectTermination = reject;
  });
  const terminate = () => {
    if (termination) return;
    termination = stopOwnedServer(child, exit);
    void termination.then(
      () =>
        resolveTermination?.({
          code: null,
          signal: signalReason(specification.signal)
        }),
      (error: unknown) => rejectTermination?.(error)
    );
  };
  const timeout = setTimeout(terminate, specification.timeoutMs);
  timeout.unref();
  specification.signal?.addEventListener('abort', terminate, { once: true });
  let observed: CommandResult;
  try {
    observed = await Promise.race([exit, terminationOutcome]);
  } finally {
    clearTimeout(timeout);
    specification.signal?.removeEventListener('abort', terminate);
    if (termination) {
      await termination;
    } else {
      await stopOwnedServer(child, exit);
    }
  }
  return failClosedCommandResult(
    observed,
    termination !== undefined,
    specification.signal
  );
};

const spawnNextServer = (
  cwd: string,
  environment: Record<string, string>
): SpawnedChild =>
  spawn(
    process.execPath,
    [
      path.join(cwd, 'node_modules/next/dist/bin/next'),
      'start',
      '--hostname',
      '127.0.0.1',
      '--port',
      '3100'
    ],
    {
      cwd,
      detached: process.platform !== 'win32',
      env: environment,
      shell: false,
      stdio: 'inherit'
    }
  );

const waitForSpawnedServer = (child: SpawnedChild): Promise<CommandResult> =>
  waitForChild(child as ChildProcess);

const assertCalibrationPortAvailable = async (): Promise<void> =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once('error', () =>
      reject(new Error('calibration port is occupied'))
    );
    server.listen({ host: '127.0.0.1', port: 3100, exclusive: true }, () => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
  });

const boundedSignal = (outer: AbortSignal | undefined, timeoutMs: number) => {
  const controller = new AbortController();
  const abort = () => controller.abort(outer?.reason);
  if (outer?.aborted) abort();
  outer?.addEventListener('abort', abort, { once: true });
  const timeout = setTimeout(() => controller.abort('timeout'), timeoutMs);
  timeout.unref();
  return {
    dispose: () => {
      clearTimeout(timeout);
      outer?.removeEventListener('abort', abort);
    },
    signal: controller.signal
  };
};

const probeCalibrationHealth = async (outer?: AbortSignal): Promise<void> => {
  const bounded = boundedSignal(outer, 60_000);
  try {
    while (!bounded.signal.aborted) {
      try {
        const response = await fetch('http://127.0.0.1:3100/api/health/ready', {
          cache: 'no-store',
          signal: bounded.signal
        });
        const body: unknown = await response.json();
        if (
          response.status === 200 &&
          body !== null &&
          typeof body === 'object' &&
          Object.keys(body).length === 1 &&
          'status' in body &&
          body.status === 'ready'
        ) {
          return;
        }
      } catch {
        if (bounded.signal.aborted) break;
      }
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    throw new Error('calibration health readiness failed');
  } finally {
    bounded.dispose();
  }
};

const probeCalibrationHydration = async (
  outer?: AbortSignal
): Promise<void> => {
  const bounded = boundedSignal(outer, 30_000);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    const response = await page.goto('http://127.0.0.1:3100/faq', {
      timeout: 20_000,
      waitUntil: 'domcontentloaded'
    });
    const current = new URL(page.url());
    if (
      bounded.signal.aborted ||
      response?.status() !== 200 ||
      current.origin !== 'http://127.0.0.1:3100' ||
      current.pathname !== '/faq' ||
      current.search !== '' ||
      current.hash !== ''
    ) {
      throw new Error('calibration route readiness failed');
    }
    await page
      .getByRole('heading', {
        exact: true,
        name: 'FREQUENTLY ASKED QUESTIONS'
      })
      .waitFor({ state: 'visible', timeout: 10_000 });
  } finally {
    bounded.dispose();
    await browser.close();
  }
};

const readCommandText = async (
  executable: string,
  args: string[],
  cwd: string,
  environment: Record<string, string>
): Promise<string> => {
  const child = spawn(executable, args, {
    cwd,
    env: environment,
    shell: false,
    stdio: ['ignore', 'pipe', 'ignore']
  });
  const chunks: Buffer[] = [];
  child.stdout?.on('data', (chunk: Buffer) => chunks.push(chunk));
  const timeout = setTimeout(() => child.kill('SIGKILL'), 10_000);
  timeout.unref();
  try {
    const result = await waitForChild(child);
    if (result.code !== 0) throw new Error('metadata command failed');
    return Buffer.concat(chunks).toString('utf8').trim();
  } finally {
    clearTimeout(timeout);
  }
};

const assertMetadataToken = (value: string, kind: string): string => {
  if (!/^[A-Za-z0-9.+_-]+$/u.test(value)) {
    throw new Error(`invalid ${kind} metadata`);
  }
  return value;
};

const readProductionBuildMetadata = async (
  cwd: string,
  environment: Record<string, string>
): Promise<BuildMetadata> => {
  const packageJson = JSON.parse(
    await readFile(path.join(cwd, 'package.json'), 'utf8')
  ) as { dependencies?: { next?: string } };
  const buildId = (
    await readRegularFileNoFollow(path.join(cwd, '.next/BUILD_ID'))
  ).buffer
    .toString('utf8')
    .trim();
  const [gitRevision, npmVersion] = await Promise.all([
    readCommandText('git', ['rev-parse', 'HEAD'], cwd, environment),
    readCommandText('npm', ['--version'], cwd, environment)
  ]);
  return {
    buildId: assertMetadataToken(buildId, 'build ID'),
    gitRevision: assertMetadataToken(gitRevision, 'git revision'),
    nextVersion: assertMetadataToken(
      packageJson.dependencies?.next ?? '',
      'Next version'
    ),
    npmVersion: assertMetadataToken(npmVersion, 'npm version')
  };
};

const productionDependencies: CalibrationDependencies = {
  assertPortAvailable: assertCalibrationPortAvailable,
  announceRecord: announceCalibrationRecord,
  assertNoDotenv: assertNoCalibrationDotenv,
  copyCorpus: copyCalibrationCorpus,
  createGeneration: createCalibrationGeneration,
  inventoryCorpus: inventoryCalibrationCorpus,
  now: () => new Date(),
  probeHealth: probeCalibrationHealth,
  probeHydratedRoute: probeCalibrationHydration,
  readProvenance: readCalibrationProvenance,
  readBuildMetadata: readProductionBuildMetadata,
  resolveEvidenceRoot: resolveEvidenceRootIdentity,
  runCommand: runSpawnedCommand,
  spawnServer: spawnNextServer,
  stopServer: stopOwnedServer,
  waitForServerExit: waitForSpawnedServer,
  writeRecord: writeCalibrationRecord
};

const commandSpecification = (
  stage: CalibrationStage,
  cwd: string,
  environment: Record<string, string>,
  paths: CalibrationPaths,
  signal: AbortSignal | undefined
): CalibrationCommandSpecification => {
  const npmArgs =
    stage === 'build'
      ? ['run', 'build']
      : stage === 'semantic'
        ? ['run', 'test:e2e:external']
        : [
            'run',
            'vr:verify',
            '--',
            '--only=faq,donate,about-us,login,signup,forgot-password',
            '--viewport=desktop',
            '--threshold=0.001'
          ];
  const stageEnvironment = { ...environment };
  if (stage === 'semantic') {
    stageEnvironment.CAG_PLAYWRIGHT_SERVER_MODE = 'external';
  }
  if (stage === 'visual') {
    stageEnvironment.VR_ARTIFACT_DIR = paths.artifactDir;
    stageEnvironment.VR_AUTH_DIR = paths.authDir;
    stageEnvironment.VR_BASELINE_DIR = paths.baselineDir;
    stageEnvironment.VR_BASE_URL = 'http://127.0.0.1:3100';
  }
  return {
    args: npmArgs,
    argv: ['npm', ...npmArgs],
    cwd,
    environment: stageEnvironment,
    executable: 'npm',
    signal,
    stage,
    timeoutMs: stage === 'build' ? 600_000 : 300_000
  };
};

const recordedCommand = (
  specification: CalibrationCommandSpecification,
  result: CommandResult
): RecordedCommand => ({
  argv: specification.argv,
  code: result.code,
  signal: result.signal
});

const signalExitCode = (signal: AbortSignal | undefined): number | undefined =>
  signal?.aborted
    ? signal.reason === 'SIGINT'
      ? 130
      : signal.reason === 'SIGTERM'
        ? 143
        : 1
    : undefined;

const waitForProcessTreeExit = async (
  child: SpawnedChild,
  timeoutMs: number,
  operations: ProcessTreeOperations
): Promise<boolean> => {
  const deadline = Date.now() + timeoutMs;
  while (operations.isAlive(child)) {
    if (Date.now() >= deadline) return false;
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(25, timeoutMs))
    );
  }
  return true;
};

export async function stopOwnedServer(
  child: SpawnedChild,
  _exit: Promise<CommandResult>,
  timeoutMs = 5_000,
  operations: ProcessTreeOperations = productionProcessTreeOperations
): Promise<void> {
  if (!operations.isAlive(child)) return;
  operations.kill(child, 'SIGTERM');
  if (await waitForProcessTreeExit(child, timeoutMs, operations)) return;
  operations.kill(child, 'SIGKILL');
  if (!(await waitForProcessTreeExit(child, timeoutMs, operations))) {
    throw new Error('owned server cleanup could not be proved');
  }
}

const assertIndependentEvidenceRoots = (
  baseline: EvidenceRootIdentity,
  staging: EvidenceRootIdentity
): void => {
  if (
    (baseline.device === staging.device && baseline.inode === staging.inode) ||
    pathsOverlap(baseline.canonicalPath, staging.canonicalPath) ||
    pathsOverlap(staging.canonicalPath, baseline.canonicalPath)
  ) {
    throw new Error('approved evidence roots are not physically independent');
  }
};

const runWithOwnedServer = async <T>(
  operation: (signal: AbortSignal) => Promise<T>,
  serverExit: Promise<CommandResult>,
  outerSignal: AbortSignal | undefined
): Promise<T> => {
  if (outerSignal?.aborted) throw new Error('calibration aborted');
  const controller = new AbortController();
  const abort = () => controller.abort(outerSignal?.reason);
  outerSignal?.addEventListener('abort', abort, { once: true });
  const operationOutcome = operation(controller.signal).then(
    (value) => ({ kind: 'value' as const, value }),
    () => ({ kind: 'error' as const })
  );
  const exitOutcome = serverExit.then(() => ({ kind: 'exit' as const }));
  try {
    const outcome = await Promise.race([operationOutcome, exitOutcome]);
    if (outcome.kind === 'exit') {
      controller.abort('owned-server-exited');
      await operationOutcome;
      throw new Error('owned calibration server exited');
    }
    if (outcome.kind === 'error') throw new Error('owned operation failed');
    if (outerSignal?.aborted) throw new Error('calibration aborted');
    const stillAlive = await Promise.race([
      serverExit.then(() => false),
      Promise.resolve(true)
    ]);
    if (!stillAlive) throw new Error('owned calibration server exited');
    return outcome.value;
  } finally {
    outerSignal?.removeEventListener('abort', abort);
  }
};

export async function runCalibrationCommand(
  argv: readonly string[],
  environment: NodeJS.ProcessEnv,
  cwd: string,
  dependencies: CalibrationDependencies = productionDependencies,
  options: CalibrationOptions = {}
): Promise<number> {
  if (argv.length !== 0) return 1;

  let configuration: CalibrationEnvironment;
  try {
    configuration = createCalibrationEnvironment(environment, cwd);
  } catch {
    return 1;
  }

  const interruptedBeforeStart = signalExitCode(options.signal);
  if (interruptedBeforeStart !== undefined) return interruptedBeforeStart;

  let paths: CalibrationPaths;
  try {
    paths = await dependencies.createGeneration();
  } catch {
    return 1;
  }

  const startedAt = dependencies.now().toISOString();
  const record: CalibrationRecord = {
    commands: {},
    evidence: {
      copiedInventory: [],
      sourceInventory: [],
      stagingInventory: []
    },
    failures: [],
    generation: path.basename(paths.generationDir),
    provenance: { status: 'unverified' },
    publicEnvironment: configuration.publicValueHashes,
    readiness: { health: false, hydratedFaq: false },
    reports: {
      captureSummary: 'artifacts/capture-summary.json',
      html: 'artifacts/diff/report.html',
      summary: 'artifacts/diff/summary.json'
    },
    schemaVersion: 1,
    startedAt,
    status: 'preparing'
  };
  let server: SpawnedChild | undefined;
  let serverExit: Promise<CommandResult> | undefined;
  let resultCode = 1;
  let currentStage = 'preparing';
  let copied = false;
  const retain = async () => dependencies.writeRecord(paths.recordFile, record);
  const fail = (stage: string) => {
    const failure = { code: 'calibration-stage-failed', stage };
    record.failure = failure;
    record.failures.push(failure);
    record.status = 'failed';
  };

  try {
    dependencies.announceRecord(paths.recordFile);
    await retain();

    currentStage = 'evidence-root-preflight';
    const [baselineIdentity, stagingIdentity] = await Promise.all([
      dependencies.resolveEvidenceRoot(configuration.approvedBaselineDir),
      dependencies.resolveEvidenceRoot(configuration.approvedStagingDir)
    ]);
    assertIndependentEvidenceRoots(baselineIdentity, stagingIdentity);
    record.evidence.sourceInventory = await dependencies.inventoryCorpus(
      configuration.approvedBaselineDir
    );
    record.evidence.stagingInventory = await dependencies.inventoryCorpus(
      configuration.approvedStagingDir
    );
    const sourceSelection = selectCalibrationInventory(
      record.evidence.sourceInventory
    );
    const stagingSelection = selectCalibrationInventory(
      record.evidence.stagingInventory
    );
    if (!inventoriesEqual(sourceSelection, stagingSelection)) {
      throw new Error('approved evidence proofs differ');
    }
    const [sourceProvenance, stagingProvenance] = await Promise.all([
      dependencies.readProvenance(
        configuration.approvedBaselineDir,
        sourceSelection
      ),
      dependencies.readProvenance(
        configuration.approvedStagingDir,
        stagingSelection
      )
    ]);
    if (JSON.stringify(sourceProvenance) !== JSON.stringify(stagingProvenance)) {
      throw new Error('approved evidence provenance differs');
    }
    record.provenance = { ...sourceProvenance, status: 'verified' };
    await retain();

    currentStage = 'copy';
    await dependencies.copyCorpus(
      configuration.approvedBaselineDir,
      paths.baselineDir,
      sourceSelection
    );
    copied = true;
    record.evidence.copiedInventory = await dependencies.inventoryCorpus(
      paths.baselineDir
    );
    const copiedSelection = selectCalibrationInventory(
      record.evidence.copiedInventory
    );
    if (!inventoriesEqual(copiedSelection, sourceSelection)) {
      throw new Error('copied evidence mismatch');
    }
    record.status = 'prepared';
    await retain();

    currentStage = 'port-preflight';
    await dependencies.assertPortAvailable();

    currentStage = 'dotenv-preflight';
    await dependencies.assertNoDotenv(cwd);

    currentStage = 'build';
    const build = commandSpecification(
      'build',
      cwd,
      configuration.childEnvironment,
      paths,
      options.signal
    );
    const buildResult = await dependencies.runCommand(build);
    record.commands.build = recordedCommand(build, buildResult);
    record.status = 'built';
    if (buildResult.code !== 0 || buildResult.signal !== null) {
      await retain();
      throw new Error('build failed');
    }
    record.metadata = {
      ...(await dependencies.readBuildMetadata(
        cwd,
        configuration.childEnvironment
      )),
      nodeVersion: process.version
    };
    await retain();

    currentStage = 'port-pre-spawn';
    await dependencies.assertPortAvailable();

    currentStage = 'server-start';
    server = dependencies.spawnServer(cwd, configuration.childEnvironment);
    serverExit = dependencies
      .waitForServerExit(server)
      .catch(() => ({ code: null, signal: null }));

    currentStage = 'readiness';
    await runWithOwnedServer(
      (signal) => dependencies.probeHealth(signal),
      serverExit,
      options.signal
    );
    record.readiness.health = true;
    await runWithOwnedServer(
      (signal) => dependencies.probeHydratedRoute(signal),
      serverExit,
      options.signal
    );
    record.readiness.hydratedFaq = true;
    record.status = 'ready';
    await retain();

    currentStage = 'semantic';
    const semantic = commandSpecification(
      'semantic',
      cwd,
      configuration.childEnvironment,
      paths,
      options.signal
    );
    const semanticResult = await runWithOwnedServer(
      (signal) => dependencies.runCommand({ ...semantic, signal }),
      serverExit,
      options.signal
    ).catch((error: unknown): CommandResult => {
      if (
        server?.exitCode !== null ||
        server?.signalCode !== null ||
        options.signal?.aborted
      ) {
        throw error;
      }
      return { code: null, signal: null };
    });
    record.commands.semantic = recordedCommand(semantic, semanticResult);
    record.status = 'semantic-complete';
    await retain();

    currentStage = 'visual-health';
    await runWithOwnedServer(
      (signal) => dependencies.probeHealth(signal),
      serverExit,
      options.signal
    );

    currentStage = 'visual';
    const visual = commandSpecification(
      'visual',
      cwd,
      configuration.childEnvironment,
      paths,
      options.signal
    );
    const visualResult = await runWithOwnedServer(
      (signal) => dependencies.runCommand({ ...visual, signal }),
      serverExit,
      options.signal
    );
    record.commands.visual = recordedCommand(visual, visualResult);
    record.status = 'visual-complete';
    await retain();

    const stagesPassed =
      semanticResult.code === 0 &&
      semanticResult.signal === null &&
      visualResult.code === 0 &&
      visualResult.signal === null;
    record.status = stagesPassed ? 'passed' : 'failed';
    if (!stagesPassed) fail('gates');
    resultCode = stagesPassed ? 0 : 1;
  } catch {
    fail(currentStage);
    resultCode = signalExitCode(options.signal) ?? 1;
  } finally {
    if (server && serverExit) {
      try {
        await dependencies.stopServer(server, serverExit);
      } catch {
        fail('server-cleanup');
        resultCode = 1;
      }
    }
    try {
      currentStage = 'post-run-integrity';
      const [postSource, postStaging, postCopy] = await Promise.all([
        dependencies.inventoryCorpus(configuration.approvedBaselineDir),
        dependencies.inventoryCorpus(configuration.approvedStagingDir),
        dependencies.inventoryCorpus(paths.baselineDir)
      ]);
      const integrityMatches =
        copied &&
        inventoriesEqual(postSource, record.evidence.sourceInventory) &&
        inventoriesEqual(postStaging, record.evidence.stagingInventory) &&
        inventoriesEqual(postCopy, record.evidence.copiedInventory);
      if (!integrityMatches) {
        fail('post-run-integrity');
        resultCode = 1;
      }
    } catch {
      fail('post-run-integrity');
      resultCode = 1;
    }
    if (resultCode === 0) record.status = 'passed';
    record.completedAt = dependencies.now().toISOString();
    try {
      await retain();
    } catch {
      fail('record-write');
      resultCode = 1;
      await retain().catch(() => undefined);
    }
  }

  return resultCode;
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
) {
  const controller = new AbortController();
  const onSigint = () => controller.abort('SIGINT');
  const onSigterm = () => controller.abort('SIGTERM');
  process.once('SIGINT', onSigint);
  process.once('SIGTERM', onSigterm);
  void runCalibrationCommand(
    process.argv.slice(2),
    process.env,
    process.cwd(),
    productionDependencies,
    { signal: controller.signal }
  )
    .then((code) => {
      process.exitCode = code;
    })
    .catch(() => {
      process.exitCode = signalExitCode(controller.signal) ?? 1;
    })
    .finally(() => {
      process.removeListener('SIGINT', onSigint);
      process.removeListener('SIGTERM', onSigterm);
    });
}
