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
  relativePath: string;
  sha256: string;
}

export type CalibrationInventory = CalibrationInventoryEntry[];

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
  signalCode: NodeJS.Signals | null;
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
  generation: string;
  metadata?: BuildMetadata & { nodeVersion: string };
  provenance: {
    approvedCapture: '2026-05-05';
    independentStagingCapture: '2026-05-09';
    relationship: 'byte-identical';
  };
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
  readBuildMetadata(
    cwd: string,
    environment: Record<string, string>
  ): Promise<BuildMetadata>;
  runCommand(
    specification: CalibrationCommandSpecification
  ): Promise<CommandResult>;
  spawnServer(cwd: string, environment: Record<string, string>): SpawnedChild;
  waitForServerExit(child: SpawnedChild): Promise<CommandResult>;
  writeRecord(file: string, record: CalibrationRecord): Promise<void>;
}

export interface CalibrationOptions {
  signal?: AbortSignal;
}

const sha256 = (value: string | Buffer): string =>
  createHash('sha256').update(value).digest('hex');

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
    if (!value) throw new Error(`${name} is required`);
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

export async function inventoryCalibrationCorpus(
  root: string
): Promise<CalibrationInventory> {
  if (!path.isAbsolute(root)) throw new Error('evidence root must be absolute');
  const canonicalRoot = await realpath(root);
  const inventory: CalibrationInventory = [];
  for (const relativePath of CALIBRATION_RELATIVE_FILES) {
    await assertSafeEvidenceDirectories(canonicalRoot, relativePath);
    const absolutePath = path.join(canonicalRoot, relativePath);
    const read = await readRegularFileNoFollow(absolutePath);
    inventory.push({
      bytes: read.bytes,
      relativePath,
      sha256: read.sha256
    });
  }
  return inventory;
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

const createCalibrationGeneration = async (): Promise<CalibrationPaths> => {
  const parent = '/private/tmp/cag-vr';
  await mkdir(parent, { mode: 0o700, recursive: true });
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

const waitForChild = (child: ChildProcess): Promise<CommandResult> =>
  new Promise((resolve, reject) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve({ code: child.exitCode, signal: child.signalCode });
      return;
    }
    child.once('error', reject);
    child.once('exit', (code, signal) => resolve({ code, signal }));
  });

const runSpawnedCommand = async (
  specification: CalibrationCommandSpecification
): Promise<CommandResult> => {
  const child = spawn(specification.executable, specification.args, {
    cwd: specification.cwd,
    env: specification.environment,
    shell: false,
    stdio: 'inherit'
  });
  let forceTimer: NodeJS.Timeout | undefined;
  const terminate = () => {
    child.kill('SIGTERM');
    forceTimer = setTimeout(() => child.kill('SIGKILL'), 5_000);
    forceTimer.unref();
  };
  const timeout = setTimeout(terminate, specification.timeoutMs);
  timeout.unref();
  specification.signal?.addEventListener('abort', terminate, { once: true });
  try {
    return await waitForChild(child);
  } finally {
    clearTimeout(timeout);
    if (forceTimer) clearTimeout(forceTimer);
    specification.signal?.removeEventListener('abort', terminate);
  }
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
    { cwd, env: environment, shell: false, stdio: 'inherit' }
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
  copyCorpus: copyCalibrationCorpus,
  createGeneration: createCalibrationGeneration,
  inventoryCorpus: inventoryCalibrationCorpus,
  now: () => new Date(),
  probeHealth: probeCalibrationHealth,
  probeHydratedRoute: probeCalibrationHydration,
  readBuildMetadata: readProductionBuildMetadata,
  runCommand: runSpawnedCommand,
  spawnServer: spawnNextServer,
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

const terminateServer = async (
  child: SpawnedChild,
  exit: Promise<CommandResult>
): Promise<void> => {
  if (child.exitCode !== null || child.signalCode !== null) return;
  child.kill('SIGTERM');
  let timer: NodeJS.Timeout | undefined;
  const bounded = new Promise<'timeout'>((resolve) => {
    timer = setTimeout(() => resolve('timeout'), 5_000);
    timer.unref();
  });
  if ((await Promise.race([exit, bounded])) === 'timeout') {
    child.kill('SIGKILL');
  }
  if (timer) clearTimeout(timer);
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

  let sourceInventory: CalibrationInventory;
  let stagingInventory: CalibrationInventory;
  try {
    sourceInventory = await dependencies.inventoryCorpus(
      configuration.approvedBaselineDir
    );
    stagingInventory = await dependencies.inventoryCorpus(
      configuration.approvedStagingDir
    );
    if (!inventoriesEqual(sourceInventory, stagingInventory)) return 1;
  } catch {
    return 1;
  }

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
      sourceInventory,
      stagingInventory
    },
    generation: path.basename(paths.generationDir),
    provenance: {
      approvedCapture: '2026-05-05',
      independentStagingCapture: '2026-05-09',
      relationship: 'byte-identical'
    },
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
  const retain = async () => dependencies.writeRecord(paths.recordFile, record);
  const fail = (stage: string) => {
    record.failure = { code: 'calibration-stage-failed', stage };
    record.status = 'failed';
  };

  try {
    await retain();
    currentStage = 'copy';
    await dependencies.copyCorpus(
      configuration.approvedBaselineDir,
      paths.baselineDir,
      sourceInventory
    );
    record.evidence.copiedInventory = await dependencies.inventoryCorpus(
      paths.baselineDir
    );
    if (!inventoriesEqual(record.evidence.copiedInventory, sourceInventory)) {
      throw new Error('copied evidence mismatch');
    }
    record.status = 'prepared';
    await retain();

    currentStage = 'port-preflight';
    await dependencies.assertPortAvailable();

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

    currentStage = 'server-start';
    server = dependencies.spawnServer(cwd, configuration.childEnvironment);
    serverExit = dependencies.waitForServerExit(server);

    currentStage = 'readiness';
    await dependencies.probeHealth(options.signal);
    record.readiness.health = true;
    await dependencies.probeHydratedRoute(options.signal);
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
    const semanticResult = await dependencies.runCommand(semantic).catch(
      (): CommandResult => ({ code: null, signal: null })
    );
    record.commands.semantic = recordedCommand(semantic, semanticResult);
    record.status = 'semantic-complete';
    await retain();

    currentStage = 'visual-health';
    await dependencies.probeHealth(options.signal);

    currentStage = 'visual';
    const visual = commandSpecification(
      'visual',
      cwd,
      configuration.childEnvironment,
      paths,
      options.signal
    );
    const visualResult = await dependencies.runCommand(visual);
    record.commands.visual = recordedCommand(visual, visualResult);
    record.status = 'visual-complete';
    await retain();

    currentStage = 'post-run-integrity';
    const postSource = await dependencies.inventoryCorpus(
      configuration.approvedBaselineDir
    );
    const postStaging = await dependencies.inventoryCorpus(
      configuration.approvedStagingDir
    );
    const postCopy = await dependencies.inventoryCorpus(paths.baselineDir);
    if (
      !inventoriesEqual(postSource, sourceInventory) ||
      !inventoriesEqual(postStaging, stagingInventory) ||
      !inventoriesEqual(postCopy, record.evidence.copiedInventory)
    ) {
      throw new Error('post-run evidence mismatch');
    }

    const stagesPassed =
      semanticResult.code === 0 &&
      semanticResult.signal === null &&
      visualResult.code === 0 &&
      visualResult.signal === null;
    record.status = stagesPassed ? 'passed' : 'failed';
    if (!stagesPassed) fail('gates');
    resultCode = stagesPassed ? 0 : 1;
    await retain();
  } catch {
    fail(currentStage);
    resultCode = signalExitCode(options.signal) ?? 1;
  } finally {
    if (server && serverExit) {
      await terminateServer(server, serverExit).catch(() => undefined);
    }
    record.completedAt = dependencies.now().toISOString();
    await retain().catch(() => undefined);
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
