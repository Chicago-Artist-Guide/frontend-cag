import { mkdir, rename, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import type { BaselinePolicy, VisualCase, VisualSelection } from './manifest';
import type { RequestDiagnostic, StabilityResult } from './stability';

export type CaptureCommand = 'baseline' | 'capture';

export interface CaptureOneResult {
  artifact: string;
  blockedRequests: RequestDiagnostic[];
  finalUrl: string;
  stability: StabilityResult | null;
}

interface CaptureCaseFailureDetails {
  blockedRequests: RequestDiagnostic[];
  finalUrl?: string;
  stability?: StabilityResult | null;
}

export class CaptureCaseFailure extends Error {
  readonly details: CaptureCaseFailureDetails;

  constructor(cause: unknown, details: CaptureCaseFailureDetails) {
    const source = cause instanceof Error ? cause : new Error(String(cause));
    super(source.message, { cause: source });
    this.name = source.name || 'Error';
    this.details = details;
  }
}

export interface CaptureErrorV1 {
  message: string;
  name: string;
}

export interface CaptureCaseSummaryV1 {
  artifact?: string;
  auth: VisualCase['entry']['auth'];
  baselinePolicy: BaselinePolicy;
  blockedRequests: RequestDiagnostic[];
  durationMs: number;
  error?: CaptureErrorV1;
  finalUrl?: string;
  id: string;
  path: string;
  stability?: StabilityResult | null;
  status: 'failed' | 'passed';
  viewport: VisualCase['viewport'];
}

export interface CaptureSummaryV1 {
  baseUrl: string;
  cases: CaptureCaseSummaryV1[];
  command: CaptureCommand;
  finishedAt: string;
  outputBucket: 'baseline' | 'current';
  runtime: {
    browser?: string;
    node: string;
    os: string;
  };
  runErrors: Array<CaptureErrorV1 & { phase: 'cleanup' | 'prepare' }>;
  schemaVersion: 1;
  selection: VisualSelection;
  startedAt: string;
  status: 'failed' | 'passed';
  totals: { failed: number; passed: number; selected: number };
}

export interface RunCaptureOptions {
  artifactDir: string;
  baseUrl: string;
  browserVersion?: () => string | undefined;
  captureOne: (visualCase: VisualCase) => Promise<CaptureOneResult>;
  cases: readonly VisualCase[];
  cleanup?: () => Promise<void>;
  command: CaptureCommand;
  prepare?: () => Promise<void>;
  selection: VisualSelection;
  summaryPath: string;
}

export interface CaptureRunResult {
  ok: boolean;
  summary: CaptureSummaryV1;
}

const sanitizeUrl = (raw: string): string => {
  try {
    const url = new URL(raw);
    url.username = '';
    url.password = '';
    url.search = '';
    url.hash = '';
    return url.toString();
  } catch {
    return '<invalid-url>';
  }
};

const sanitizeMessage = (message: string): string =>
  message.replace(/https?:\/\/[^\s]+/gu, (url) => sanitizeUrl(url));

const sanitizeError = (error: unknown): CaptureErrorV1 => {
  if (error instanceof Error) {
    return {
      message: sanitizeMessage(error.message),
      name: error.name || 'Error'
    };
  }
  return { message: sanitizeMessage(String(error)), name: 'Error' };
};

const portableArtifact = (
  artifact: string,
  visualCase: VisualCase,
  outputBucket: CaptureSummaryV1['outputBucket']
): string => {
  if (
    artifact.trim().length === 0 ||
    artifact === '.' ||
    artifact.includes('\\') ||
    path.isAbsolute(artifact)
  ) {
    throw new Error('capture artifact path must be a portable relative path');
  }
  const normalized = path.posix.normalize(artifact);
  if (
    normalized === '.' ||
    normalized === '..' ||
    normalized.startsWith('../')
  ) {
    throw new Error('capture artifact path must not escape its output bucket');
  }
  const expected = `${outputBucket}/${visualCase.entry.id}/${visualCase.viewport}.png`;
  if (normalized !== expected) {
    throw new Error(`capture artifact must be exactly ${expected}`);
  }
  return normalized;
};

const writeSummaryAtomically = async (
  summaryPath: string,
  summary: CaptureSummaryV1
): Promise<void> => {
  const directory = path.dirname(summaryPath);
  await mkdir(directory, { recursive: true });
  const partial = path.join(
    directory,
    `.${path.basename(summaryPath)}.${process.pid}.${Date.now()}.partial`
  );
  await writeFile(partial, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  await rename(partial, summaryPath);
};

export async function writeCapturePngAtomically(
  finalPath: string,
  outputRoot: string,
  writePartial: (partialPath: string) => Promise<void>
): Promise<void> {
  const resolvedRoot = path.resolve(outputRoot);
  const resolvedFinal = path.resolve(finalPath);
  const relative = path.relative(resolvedRoot, resolvedFinal);
  const segments = relative.split(path.sep);
  const safeSegments = segments.every((segment, index) =>
    index === segments.length - 1
      ? /^[a-z0-9]+(?:-[a-z0-9]+)*\.png$/u.test(segment)
      : /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(segment)
  );
  if (
    finalPath.includes('\\') ||
    relative === '' ||
    relative === '..' ||
    relative.startsWith(`..${path.sep}`) ||
    path.isAbsolute(relative) ||
    !safeSegments
  ) {
    throw new Error(
      'capture artifact must remain within the capture output root'
    );
  }
  const directory = path.dirname(resolvedFinal);
  await mkdir(directory, { recursive: true });
  const partialPath = path.join(
    directory,
    `.${path.basename(resolvedFinal, '.png')}.${process.pid}.${Date.now()}.partial.png`
  );
  await rm(partialPath, { force: true });
  try {
    await writePartial(partialPath);
    await rename(partialPath, resolvedFinal);
  } catch (error) {
    await rm(partialPath, { force: true });
    throw error;
  }
}

export interface ReachabilityOptions {
  attempts?: number;
  attemptTimeoutMs?: number;
  fetchImpl?: typeof fetch;
  retryDelayMs?: number;
}

export async function ensureBaseUrlReachable(
  baseUrl: string,
  options: ReachabilityOptions = {}
): Promise<void> {
  const attempts = options.attempts ?? 20;
  const attemptTimeoutMs = options.attemptTimeoutMs ?? 1_000;
  const fetchImpl = options.fetchImpl ?? fetch;
  const retryDelayMs = options.retryDelayMs ?? 500;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), attemptTimeoutMs);
    try {
      const response = await fetchImpl(baseUrl, {
        redirect: 'manual',
        signal: controller.signal
      });
      if (response.status < 500) return;
    } catch {
      // Bounded retries handle a compatibility host that is still starting.
    } finally {
      clearTimeout(timer);
    }
    if (attempt + 1 < attempts && retryDelayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }
  throw new Error(`visual capture host is not reachable at ${baseUrl}`);
}

const commonFor = (visualCase: VisualCase) => ({
  auth: visualCase.entry.auth,
  baselinePolicy: visualCase.entry.baselinePolicy,
  blockedRequests: [] as RequestDiagnostic[],
  id: visualCase.entry.id,
  path: visualCase.entry.path,
  viewport: visualCase.viewport
});

export async function runCapture(
  options: RunCaptureOptions
): Promise<CaptureRunResult> {
  const startedAt = new Date();
  const cases: CaptureCaseSummaryV1[] = [];
  const runErrors: CaptureSummaryV1['runErrors'] = [];
  const outputBucket = options.command === 'baseline' ? 'baseline' : 'current';

  try {
    await mkdir(options.artifactDir, { recursive: true });
    const caseKeys = options.cases.map(
      ({ entry, viewport }) => `${entry.id}\0${viewport}`
    );
    if (new Set(caseKeys).size !== caseKeys.length) {
      throw new Error(
        'selected visual cases must have unique id/viewport pairs'
      );
    }
    await options.prepare?.();
  } catch (error) {
    const sanitized = sanitizeError(error);
    runErrors.push({ ...sanitized, phase: 'prepare' });
    for (const visualCase of options.cases) {
      cases.push({
        ...commonFor(visualCase),
        durationMs: 0,
        error: sanitized,
        status: 'failed'
      });
    }
  }

  if (runErrors.length === 0) {
    for (const visualCase of options.cases) {
      const caseStartedAt = Date.now();
      const common = commonFor(visualCase);
      try {
        const result = await options.captureOne(visualCase);
        cases.push({
          ...common,
          artifact: portableArtifact(result.artifact, visualCase, outputBucket),
          blockedRequests: result.blockedRequests.map((request) => ({
            ...request,
            url: sanitizeUrl(request.url)
          })),
          durationMs: Date.now() - caseStartedAt,
          finalUrl: sanitizeUrl(result.finalUrl),
          stability: result.stability,
          status: 'passed'
        });
      } catch (error) {
        const details =
          error instanceof CaptureCaseFailure ? error.details : undefined;
        cases.push({
          ...common,
          blockedRequests: (details?.blockedRequests ?? []).map((request) => ({
            ...request,
            url: sanitizeUrl(request.url)
          })),
          durationMs: Date.now() - caseStartedAt,
          error: sanitizeError(error),
          ...(details?.finalUrl
            ? { finalUrl: sanitizeUrl(details.finalUrl) }
            : {}),
          ...(details?.stability !== undefined
            ? { stability: details.stability }
            : {}),
          status: 'failed'
        });
      }
    }
  }

  try {
    await options.cleanup?.();
  } catch (error) {
    runErrors.push({ ...sanitizeError(error), phase: 'cleanup' });
  }

  const passed = cases.filter(({ status }) => status === 'passed').length;
  const failed = cases.filter(({ status }) => status === 'failed').length;
  const status = failed > 0 || runErrors.length > 0 ? 'failed' : 'passed';
  let browserVersion: string | undefined;
  try {
    browserVersion = options.browserVersion?.();
  } catch {
    browserVersion = undefined;
  }
  const summary: CaptureSummaryV1 = {
    baseUrl: sanitizeUrl(options.baseUrl),
    cases,
    command: options.command,
    finishedAt: new Date().toISOString(),
    outputBucket,
    runtime: {
      browser: browserVersion,
      node: process.version,
      os: `${os.platform()} ${os.release()} ${os.arch()}`
    },
    runErrors,
    schemaVersion: 1,
    selection: options.selection,
    startedAt: startedAt.toISOString(),
    status,
    totals: { failed, passed, selected: options.cases.length }
  };
  await writeSummaryAtomically(options.summaryPath, summary);
  return { ok: status === 'passed', summary };
}
