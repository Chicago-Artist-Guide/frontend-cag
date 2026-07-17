import {
  lstat,
  mkdir,
  open,
  readFile,
  realpath,
  rename,
  rm,
  writeFile
} from 'node:fs/promises';
import { constants } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import type {
  CaptureCaseSummaryV1,
  CaptureErrorV1,
  CaptureSummaryV1
} from './capture-core';
import {
  MANIFEST,
  selectVisualCases,
  type BaselinePolicy,
  type RouteEntry,
  type VisualCase
} from './manifest';

export type EvidenceState = 'invalid' | 'missing' | 'read-error' | 'valid';
export type ComparisonState = 'changed' | 'identical' | 'not-run';
export type GateVerdict = 'fail' | 'not-enforced' | 'pass';

export type PngEvidenceInput =
  | { bytes: Buffer; kind: 'bytes' }
  | { kind: 'missing' }
  | { kind: 'read-error'; message: string };

export interface DiffIssue {
  code: string;
  message: string;
  scope: 'baseline' | 'capture' | 'comparison' | 'current' | 'policy' | 'run';
}

export interface ImageDimensions {
  height: number;
  width: number;
}

export interface DiffResult {
  auth: CaptureCaseSummaryV1['auth'];
  baselineAsset?: string;
  baselineDimensions: ImageDimensions | null;
  baselineEvidence: EvidenceState;
  baselinePolicy: BaselinePolicy;
  comparison: ComparisonState;
  currentAsset?: string;
  currentDimensions: ImageDimensions | null;
  currentEvidence: EvidenceState;
  diffAsset?: string;
  diffPixels: number;
  dimensionsMatch: boolean | null;
  gateVerdict: GateVerdict;
  id: string;
  issues: DiffIssue[];
  path: string;
  ratio: number | null;
  totalPixels: number;
  verdict: 'fail' | 'pass';
  viewport: CaptureCaseSummaryV1['viewport'];
}

export interface ComparePngCaseOptions {
  baselineBytes: PngEvidenceInput;
  captureResult: CaptureCaseSummaryV1;
  currentBytes: PngEvidenceInput;
  maxDiffRatio: number;
  pixelSensitivity: number;
  visualCase: VisualCase;
}

export interface ComparePngCaseResult {
  diffPng?: Buffer;
  result: DiffResult;
}

interface DecodedEvidence {
  dimensions: ImageDimensions | null;
  image?: PNG;
  issue?: DiffIssue;
  state: EvidenceState;
}

const evidenceIssue = (
  code: string,
  message: string,
  scope: DiffIssue['scope']
): DiffIssue => ({ code, message, scope });

const decodeEvidence = (
  input: PngEvidenceInput,
  side: 'baseline' | 'current'
): DecodedEvidence => {
  if (input.kind === 'missing') {
    return {
      dimensions: null,
      issue: evidenceIssue(`missing-${side}`, `${side} PNG is missing`, side),
      state: 'missing'
    };
  }
  if (input.kind === 'read-error') {
    return {
      dimensions: null,
      issue: evidenceIssue(
        `${side}-read-error`,
        `${side} PNG could not be read: ${input.message}`,
        side
      ),
      state: 'read-error'
    };
  }
  try {
    const image = PNG.sync.read(input.bytes);
    if (image.width <= 0 || image.height <= 0) {
      throw new Error('PNG dimensions must be positive');
    }
    return {
      dimensions: { height: image.height, width: image.width },
      image,
      state: 'valid'
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      dimensions: null,
      issue: evidenceIssue(
        `invalid-${side}`,
        `${side} PNG is invalid: ${message}`,
        side
      ),
      state: 'invalid'
    };
  }
};

const padTo = (source: PNG, width: number, height: number): PNG => {
  if (source.width === width && source.height === height) return source;
  const output = new PNG({ height, width });
  output.data.fill(0);
  for (let row = 0; row < source.height; row += 1) {
    const sourceStart = row * source.width * 4;
    source.data.copy(
      output.data,
      row * width * 4,
      sourceStart,
      sourceStart + source.width * 4
    );
  }
  return output;
};

const policyGateVerdict = (
  policy: BaselinePolicy,
  evidenceFault: boolean,
  factualFailure: boolean
): GateVerdict => {
  if (policy.kind === 'missing' || evidenceFault) return 'fail';
  if (!factualFailure) return 'pass';
  return policy.kind === 'reference-only' ? 'not-enforced' : 'fail';
};

export function comparePngCase(
  options: ComparePngCaseOptions
): ComparePngCaseResult {
  const baseline = decodeEvidence(options.baselineBytes, 'baseline');
  const captureFailed = options.captureResult.status === 'failed';
  const current = captureFailed
    ? { dimensions: null, state: 'missing' as const }
    : decodeEvidence(options.currentBytes, 'current');
  const issues: DiffIssue[] = [];
  if (baseline.issue) issues.push(baseline.issue);
  if (!captureFailed && current.issue) issues.push(current.issue);
  if (captureFailed) {
    issues.push(
      evidenceIssue(
        'capture-failed',
        options.captureResult.error?.message ?? 'capture failed',
        'capture'
      )
    );
  }

  if (options.visualCase.entry.baselinePolicy.kind === 'missing') {
    if (baseline.state === 'missing') {
      issues.push(
        evidenceIssue(
          'missing-baseline-policy',
          options.visualCase.entry.baselinePolicy.reason,
          'policy'
        )
      );
    } else {
      issues.push(
        evidenceIssue(
          'unexpected-baseline',
          'baseline exists but its policy has not been promoted',
          'policy'
        )
      );
    }
  }

  let comparison: ComparisonState = 'not-run';
  let diffPixels = 0;
  let dimensionsMatch: boolean | null = null;
  let ratio: number | null = null;
  let totalPixels = 0;
  let diffPng: Buffer | undefined;
  if (baseline.image && current.image && !captureFailed) {
    const width = Math.max(baseline.image.width, current.image.width);
    const height = Math.max(baseline.image.height, current.image.height);
    totalPixels = width * height;
    dimensionsMatch =
      baseline.image.width === current.image.width &&
      baseline.image.height === current.image.height;
    const output = new PNG({ height, width });
    diffPixels = pixelmatch(
      padTo(baseline.image, width, height).data,
      padTo(current.image, width, height).data,
      output.data,
      width,
      height,
      {
        includeAA: false,
        threshold: options.pixelSensitivity
      }
    );
    ratio = diffPixels / totalPixels;
    comparison = diffPixels === 0 && dimensionsMatch ? 'identical' : 'changed';
    if (!dimensionsMatch) {
      issues.push(
        evidenceIssue(
          'dimension-mismatch',
          'baseline and current dimensions differ',
          'comparison'
        )
      );
    }
    if (diffPixels > 0) {
      issues.push(
        evidenceIssue(
          'pixel-change',
          `${diffPixels} of ${totalPixels} pixels differ`,
          'comparison'
        )
      );
    }
    if (comparison === 'changed') diffPng = PNG.sync.write(output);
  }

  const comparisonFailure =
    dimensionsMatch === false ||
    (ratio !== null && ratio > options.maxDiffRatio);
  const evidenceFault =
    captureFailed || baseline.state !== 'valid' || current.state !== 'valid';
  const policyFailure =
    options.visualCase.entry.baselinePolicy.kind === 'missing';
  const factualFailure = evidenceFault || policyFailure || comparisonFailure;
  const gateVerdict = policyGateVerdict(
    options.visualCase.entry.baselinePolicy,
    evidenceFault,
    factualFailure
  );

  return {
    ...(diffPng ? { diffPng } : {}),
    result: {
      auth: options.visualCase.entry.auth,
      baselineDimensions: baseline.dimensions,
      baselineEvidence: baseline.state,
      baselinePolicy: options.visualCase.entry.baselinePolicy,
      comparison,
      currentDimensions: current.dimensions,
      currentEvidence: current.state,
      diffPixels,
      dimensionsMatch,
      gateVerdict,
      id: options.visualCase.entry.id,
      issues,
      path: options.visualCase.entry.path,
      ratio,
      totalPixels,
      verdict: factualFailure ? 'fail' : 'pass',
      viewport: options.visualCase.viewport
    }
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNonNegative = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0;

const requireString = (value: unknown, label: string): string => {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`);
  }
  return value;
};

const assertExactKeys = (
  value: Record<string, unknown>,
  allowed: readonly string[],
  label: string
): void => {
  const allowedKeys = new Set(allowed);
  const unknown = Object.keys(value).find((key) => !allowedKeys.has(key));
  if (unknown) throw new Error(`unknown ${label} field: ${unknown}`);
};

const sanitizeDiagnosticMessage = (value: string): string =>
  value
    .replace(/\b[A-Za-z]:\\[^\s,;]+/gu, '<path>')
    .replace(/\/(?:Users|private|tmp|var|etc|home)\/[^\s,;]+/gu, '<path>');

const validateSanitizedUrl = (
  value: unknown,
  label: string,
  options: {
    baseOrigin?: string;
    expectedPath?: string;
    originOnly?: boolean;
  } = {}
): string => {
  const raw = requireString(value, label);
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${label} must be a sanitized HTTP(S) URL`);
  }
  if (
    (url.protocol !== 'http:' && url.protocol !== 'https:') ||
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.search.length > 0 ||
    url.hash.length > 0 ||
    (options.originOnly && url.pathname !== '/') ||
    (options.baseOrigin !== undefined && url.origin !== options.baseOrigin) ||
    (options.expectedPath !== undefined &&
      url.pathname !== options.expectedPath)
  ) {
    throw new Error(`${label} must be a sanitized HTTP(S) URL`);
  }
  return raw;
};

const validateSanitizedFrameUrl = (value: unknown, label: string): string => {
  const raw = requireString(value, label);
  if (raw === '<invalid-url>') return raw;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new Error(`${label} must be a sanitized URL`);
  }
  if (
    !['about:', 'http:', 'https:'].includes(url.protocol) ||
    url.username.length > 0 ||
    url.password.length > 0 ||
    url.search.length > 0 ||
    url.hash.length > 0
  ) {
    throw new Error(`${label} must be a sanitized URL`);
  }
  return raw;
};

const validatePolicy = (
  value: unknown,
  expected: BaselinePolicy,
  label: string
): BaselinePolicy => {
  if (!isRecord(value)) throw new Error(`${label} must be an object`);
  if (expected.kind === 'blocking-candidate') {
    assertExactKeys(value, ['kind'], label);
    if (value.kind !== expected.kind) throw new Error(`${label} drift`);
    return { kind: 'blocking-candidate' };
  }
  assertExactKeys(value, ['kind', 'reason'], label);
  if (value.kind !== expected.kind || value.reason !== expected.reason) {
    throw new Error(`${label} drift`);
  }
  return { kind: expected.kind, reason: expected.reason };
};

const validateSelection = (value: unknown): CaptureSummaryV1['selection'] => {
  if (!isRecord(value)) throw new Error('capture selection must be an object');
  const allowed = new Set(['clusters', 'ids', 'target', 'viewports']);
  for (const key of Object.keys(value)) {
    if (!allowed.has(key))
      throw new Error(`unknown capture selection field: ${key}`);
  }
  for (const key of ['clusters', 'ids', 'viewports'] as const) {
    const list = value[key];
    if (list === undefined) continue;
    if (
      !Array.isArray(list) ||
      list.length === 0 ||
      list.some((item) => typeof item !== 'string' || item.length === 0) ||
      new Set(list).size !== list.length
    ) {
      throw new Error(
        `capture selection ${key} must contain unique non-empty strings`
      );
    }
  }
  if (
    value.target !== undefined &&
    (typeof value.target !== 'string' || value.target.trim().length === 0)
  ) {
    throw new Error('capture selection target must be a non-empty string');
  }
  const selection: CaptureSummaryV1['selection'] = {};
  if (value.clusters !== undefined) {
    selection.clusters = [
      ...(value.clusters as string[])
    ] as CaptureSummaryV1['selection']['clusters'];
  }
  if (value.ids !== undefined) {
    selection.ids = [...(value.ids as string[])];
  }
  if (value.target !== undefined) selection.target = value.target as string;
  if (value.viewports !== undefined) {
    selection.viewports = [
      ...(value.viewports as string[])
    ] as CaptureSummaryV1['selection']['viewports'];
  }
  return selection;
};

const validateCaptureError = (
  value: unknown,
  label: string
): CaptureErrorV1 => {
  if (!isRecord(value)) throw new Error(`${label} must be an object`);
  assertExactKeys(value, ['message', 'name'], label);
  return {
    message: sanitizeDiagnosticMessage(
      requireString(value.message, `${label}.message`)
    ),
    name: requireString(value.name, `${label}.name`)
  };
};

const requireBoolean = (value: unknown, label: string): boolean => {
  if (typeof value !== 'boolean') throw new Error(`${label} must be a boolean`);
  return value;
};

const requireCount = (value: unknown, label: string): number => {
  if (!Number.isInteger(value) || (value as number) < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
  return value as number;
};

const validateBlockedRequests = (
  value: unknown,
  label: string
): CaptureCaseSummaryV1['blockedRequests'] => {
  if (!Array.isArray(value)) throw new Error(`${label} must be an array`);
  return value.map((request, index) => {
    const requestLabel = `${label}[${index}]`;
    if (!isRecord(request))
      throw new Error(`${requestLabel} must be an object`);
    assertExactKeys(request, ['disposition', 'method', 'url'], requestLabel);
    if (
      request.disposition !== 'mutation-block' &&
      request.disposition !== 'silent-block'
    ) {
      throw new Error(`${requestLabel}.disposition is invalid`);
    }
    return {
      disposition: request.disposition,
      method: requireString(request.method, `${requestLabel}.method`),
      url: validateSanitizedUrl(request.url, `${requestLabel}.url`)
    };
  });
};

const validateStability = (
  value: unknown,
  label: string
): CaptureCaseSummaryV1['stability'] => {
  if (value === null) return null;
  if (!isRecord(value)) throw new Error(`${label} must be an object or null`);
  assertExactKeys(
    value,
    ['durationMs', 'fonts', 'frames', 'images', 'intervalsCleared', 'masks'],
    label
  );
  if (!isFiniteNonNegative(value.durationMs)) {
    throw new Error(`${label}.durationMs is invalid`);
  }
  if (!Array.isArray(value.fonts))
    throw new Error(`${label}.fonts must be an array`);
  const fonts = value.fonts.map((font, index) => {
    const itemLabel = `${label}.fonts[${index}]`;
    if (!isRecord(font)) throw new Error(`${itemLabel} must be an object`);
    assertExactKeys(font, ['family', 'status', 'style', 'weight'], itemLabel);
    if (
      !['unloaded', 'loading', 'loaded', 'error'].includes(String(font.status))
    ) {
      throw new Error(`${itemLabel}.status is invalid`);
    }
    return {
      family: requireString(font.family, `${itemLabel}.family`),
      status: font.status as FontFaceLoadStatus,
      style: requireString(font.style, `${itemLabel}.style`),
      weight: requireString(font.weight, `${itemLabel}.weight`)
    };
  });
  if (!Array.isArray(value.frames))
    throw new Error(`${label}.frames must be an array`);
  const frames = value.frames.map((frame, index) => {
    const itemLabel = `${label}.frames[${index}]`;
    if (!isRecord(frame)) throw new Error(`${itemLabel} must be an object`);
    assertExactKeys(
      frame,
      ['crossOrigin', 'declaredSrc', 'src', 'visible'],
      itemLabel
    );
    return {
      crossOrigin: requireBoolean(
        frame.crossOrigin,
        `${itemLabel}.crossOrigin`
      ),
      declaredSrc: validateSanitizedFrameUrl(
        frame.declaredSrc,
        `${itemLabel}.declaredSrc`
      ),
      src: validateSanitizedFrameUrl(frame.src, `${itemLabel}.src`),
      visible: requireBoolean(frame.visible, `${itemLabel}.visible`)
    };
  });
  if (!isRecord(value.images))
    throw new Error(`${label}.images must be an object`);
  assertExactKeys(
    value.images,
    ['checked', 'exemptedBroken'],
    `${label}.images`
  );
  if (!Array.isArray(value.images.exemptedBroken)) {
    throw new Error(`${label}.images.exemptedBroken must be an array`);
  }
  const exemptedBroken = value.images.exemptedBroken.map((image, index) => {
    const itemLabel = `${label}.images.exemptedBroken[${index}]`;
    if (!isRecord(image)) throw new Error(`${itemLabel} must be an object`);
    assertExactKeys(image, ['reason', 'selector', 'url'], itemLabel);
    return {
      reason: requireString(image.reason, `${itemLabel}.reason`),
      selector: requireString(image.selector, `${itemLabel}.selector`),
      url: validateSanitizedUrl(image.url, `${itemLabel}.url`)
    };
  });
  if (!Array.isArray(value.masks))
    throw new Error(`${label}.masks must be an array`);
  const masks = value.masks.map((mask, index) => {
    const itemLabel = `${label}.masks[${index}]`;
    if (!isRecord(mask)) throw new Error(`${itemLabel} must be an object`);
    assertExactKeys(
      mask,
      ['matchCount', 'reason', 'selector', 'visibleCount'],
      itemLabel
    );
    return {
      matchCount: requireCount(mask.matchCount, `${itemLabel}.matchCount`),
      reason: requireString(mask.reason, `${itemLabel}.reason`),
      selector: requireString(mask.selector, `${itemLabel}.selector`),
      visibleCount: requireCount(mask.visibleCount, `${itemLabel}.visibleCount`)
    };
  });
  return {
    durationMs: value.durationMs,
    fonts,
    frames,
    images: {
      checked: requireCount(value.images.checked, `${label}.images.checked`),
      exemptedBroken
    },
    intervalsCleared: requireCount(
      value.intervalsCleared,
      `${label}.intervalsCleared`
    ),
    masks
  };
};

const validateCaptureRow = (
  value: unknown,
  expected: VisualCase,
  index: number,
  baseOrigin: string
): CaptureCaseSummaryV1 => {
  if (!isRecord(value))
    throw new Error(`capture case ${index} must be an object`);
  assertExactKeys(
    value,
    [
      'artifact',
      'auth',
      'baselinePolicy',
      'blockedRequests',
      'durationMs',
      'error',
      'finalUrl',
      'id',
      'path',
      'stability',
      'status',
      'viewport'
    ],
    `capture case ${index}`
  );
  if (value.id !== expected.entry.id || value.viewport !== expected.viewport) {
    throw new Error(
      `capture case ${index} does not match manifest selection order`
    );
  }
  if (value.path !== expected.entry.path)
    throw new Error('capture case path drift');
  if (value.auth !== expected.entry.auth)
    throw new Error('capture case auth drift');
  const baselinePolicy = validatePolicy(
    value.baselinePolicy,
    expected.entry.baselinePolicy,
    'capture case baseline policy'
  );
  if (!isFiniteNonNegative(value.durationMs)) {
    throw new Error('capture case durationMs must be finite and non-negative');
  }
  const blockedRequests = validateBlockedRequests(
    value.blockedRequests,
    `capture case ${index}.blockedRequests`
  );
  const finalUrl =
    value.finalUrl === undefined
      ? undefined
      : validateSanitizedUrl(value.finalUrl, `capture case ${index}.finalUrl`, {
          baseOrigin,
          expectedPath: expected.entry.path
        });
  if (value.status !== 'passed' && value.status !== 'failed') {
    throw new Error('capture case status is invalid');
  }
  const expectedArtifact = `current/${expected.entry.id}/${expected.viewport}.png`;
  let artifact: string | undefined;
  let captureError: CaptureErrorV1 | undefined;
  if (value.status === 'passed') {
    if (value.artifact !== expectedArtifact) {
      throw new Error(
        `passed capture case must name exactly ${expectedArtifact}`
      );
    }
    if (value.error !== undefined) {
      throw new Error('passed capture case must not contain an error');
    }
    artifact = expectedArtifact;
  } else {
    if (value.artifact !== undefined) {
      throw new Error('failed capture case must not name an artifact');
    }
    captureError = validateCaptureError(
      value.error,
      'failed capture case error'
    );
  }
  return {
    ...(artifact ? { artifact } : {}),
    auth: expected.entry.auth,
    baselinePolicy,
    blockedRequests,
    durationMs: value.durationMs,
    ...(captureError ? { error: captureError } : {}),
    ...(finalUrl ? { finalUrl } : {}),
    id: expected.entry.id,
    path: expected.entry.path,
    ...(value.stability !== undefined
      ? {
          stability: validateStability(
            value.stability,
            `capture case ${index}.stability`
          )
        }
      : {}),
    status: value.status,
    viewport: expected.viewport
  };
};

export function validateCaptureSummary(
  value: unknown,
  manifest: readonly RouteEntry[]
): CaptureSummaryV1 {
  if (!isRecord(value)) throw new Error('capture summary must be an object');
  assertExactKeys(
    value,
    [
      'baseUrl',
      'cases',
      'command',
      'finishedAt',
      'outputBucket',
      'runtime',
      'runErrors',
      'schemaVersion',
      'selection',
      'startedAt',
      'status',
      'totals'
    ],
    'capture summary'
  );
  if (value.schemaVersion !== 1)
    throw new Error('capture summary schema version must be 1');
  if (value.command !== 'capture')
    throw new Error('capture summary command must be capture');
  if (value.outputBucket !== 'current')
    throw new Error('capture summary output bucket must be current');
  const baseUrl = validateSanitizedUrl(
    value.baseUrl,
    'capture summary baseUrl',
    { originOnly: true }
  );
  const baseOrigin = new URL(baseUrl).origin;
  const startedAt = requireString(value.startedAt, 'capture summary startedAt');
  const finishedAt = requireString(
    value.finishedAt,
    'capture summary finishedAt'
  );
  if (!isRecord(value.runtime))
    throw new Error('capture summary runtime must be an object');
  assertExactKeys(value.runtime, ['browser', 'node', 'os'], 'capture runtime');
  const node = requireString(value.runtime.node, 'capture runtime node');
  const runtimeOs = requireString(value.runtime.os, 'capture runtime os');
  if (
    value.runtime.browser !== undefined &&
    typeof value.runtime.browser !== 'string'
  ) {
    throw new Error('capture runtime browser must be a string');
  }
  const selection = validateSelection(value.selection);
  const expectedCases = selectVisualCases(manifest, selection);
  if (
    !Array.isArray(value.cases) ||
    value.cases.length !== expectedCases.length
  ) {
    throw new Error(
      'capture summary case count does not match manifest selection'
    );
  }
  const rows = value.cases.map((row, index) =>
    validateCaptureRow(row, expectedCases[index], index, baseOrigin)
  );
  const keys = rows.map(({ id, viewport }) => `${id}\0${viewport}`);
  if (new Set(keys).size !== keys.length)
    throw new Error('duplicate capture case');
  if (!Array.isArray(value.runErrors))
    throw new Error('capture summary runErrors must be an array');
  const runErrors = value.runErrors.map((runError) => {
    if (
      !isRecord(runError) ||
      (runError.phase !== 'prepare' && runError.phase !== 'cleanup')
    ) {
      throw new Error('capture run error phase is invalid');
    }
    assertExactKeys(
      runError,
      ['message', 'name', 'phase'],
      'capture run error'
    );
    const captureError = validateCaptureError(
      { message: runError.message, name: runError.name },
      'capture run error'
    );
    return {
      ...captureError,
      phase: runError.phase as 'cleanup' | 'prepare'
    };
  });
  if (!isRecord(value.totals))
    throw new Error('capture summary totals must be an object');
  const passed = rows.filter(({ status }) => status === 'passed').length;
  const failed = rows.filter(({ status }) => status === 'failed').length;
  if (
    value.totals.selected !== rows.length ||
    value.totals.passed !== passed ||
    value.totals.failed !== failed
  ) {
    throw new Error('capture summary totals drift');
  }
  const status = failed > 0 || runErrors.length > 0 ? 'failed' : 'passed';
  if (value.status !== status) throw new Error('capture summary status drift');
  assertExactKeys(
    value.totals,
    ['failed', 'passed', 'selected'],
    'capture summary totals'
  );
  return {
    baseUrl,
    cases: rows,
    command: 'capture',
    finishedAt,
    outputBucket: 'current',
    runtime: {
      ...(value.runtime.browser !== undefined
        ? {
            browser: requireString(
              value.runtime.browser,
              'capture runtime browser'
            )
          }
        : {}),
      node,
      os: runtimeOs
    },
    runErrors,
    schemaVersion: 1,
    selection,
    startedAt,
    status,
    totals: { failed, passed, selected: rows.length }
  };
}

export interface DiffRunErrorV1 extends CaptureErrorV1 {
  phase:
    | 'asset-tree'
    | 'capture-cleanup'
    | 'capture-prepare'
    | 'capture-summary';
}

export interface DiffSummaryV1 {
  capture: CaptureSummaryV1 | null;
  finishedAt: string;
  gateVerdict: 'fail' | 'pass';
  generationId: string;
  maxDiffRatio: number;
  pixelSensitivity: number;
  results: DiffResult[];
  runErrors: DiffRunErrorV1[];
  schemaVersion: 1;
  startedAt: string;
  totals: {
    failed: number;
    notEnforced: number;
    passed: number;
    selected: number;
  };
}

export interface DiffPaths {
  artifactDir: string;
  baselineDir: string;
  captureSummary: string;
  currentDir: string;
  diffDir: string;
  reportFile: string;
  summaryFile: string;
}

export interface RunDiffOptions {
  afterEvidenceOpen?: (file: string) => Promise<void>;
  fault?: (
    operation: 'acquire-lock' | 'promote' | 'rollback' | 'write-asset'
  ) => void;
  manifest: readonly RouteEntry[];
  maxDiffRatio: number;
  paths: DiffPaths;
  pixelSensitivity: number;
  readBytes?: (file: string) => Promise<Buffer>;
}

export interface DiffRunResult {
  exitCode: 0 | 1;
  summary: DiffSummaryV1;
}

const isPortableReportAsset = (
  value: unknown,
  bucket: 'baseline' | 'current' | 'diff',
  result: Pick<DiffResult, 'id' | 'viewport'>
): boolean =>
  value === undefined ||
  value === `report-assets/${bucket}/${result.id}/${result.viewport}.png`;

const validateDimensions = (
  value: unknown,
  evidence: EvidenceState,
  label: string
): void => {
  if (evidence !== 'valid') {
    if (value !== null) throw new Error(`${label} dimensions must be null`);
    return;
  }
  if (
    !isRecord(value) ||
    !Number.isInteger(value.width) ||
    !Number.isInteger(value.height) ||
    (value.width as number) <= 0 ||
    (value.height as number) <= 0
  ) {
    throw new Error(`${label} dimensions are invalid`);
  }
};

const validateResultPolicy = (value: unknown): BaselinePolicy => {
  if (!isRecord(value)) throw new Error('diff result policy must be an object');
  if (value.kind === 'blocking-candidate') {
    assertExactKeys(value, ['kind'], 'diff result policy');
    return { kind: 'blocking-candidate' };
  }
  if (
    (value.kind === 'reference-only' || value.kind === 'missing') &&
    typeof value.reason === 'string' &&
    value.reason.trim().length > 0
  ) {
    assertExactKeys(value, ['kind', 'reason'], 'diff result policy');
    return { kind: value.kind, reason: value.reason };
  }
  throw new Error('diff result policy is invalid');
};

const validateEmbeddedCapture = (
  value: unknown,
  results: readonly DiffResult[]
): CaptureSummaryV1 => {
  const capture = validateCaptureSummary(value, MANIFEST);
  if (capture.cases.length !== results.length) {
    throw new Error('diff and capture case counts differ');
  }
  capture.cases.forEach((row, index) => {
    const result = results[index];
    if (
      row.id !== result.id ||
      row.viewport !== result.viewport ||
      row.path !== result.path ||
      row.auth !== result.auth ||
      JSON.stringify(row.baselinePolicy) !==
        JSON.stringify(result.baselinePolicy)
    ) {
      throw new Error(`diff result ${index} does not match its capture case`);
    }
  });
  return capture;
};

export function validateDiffSummary(value: unknown): DiffSummaryV1 {
  if (!isRecord(value)) throw new Error('diff summary must be an object');
  assertExactKeys(
    value,
    [
      'capture',
      'finishedAt',
      'gateVerdict',
      'generationId',
      'maxDiffRatio',
      'pixelSensitivity',
      'results',
      'runErrors',
      'schemaVersion',
      'startedAt',
      'totals'
    ],
    'diff summary'
  );
  if (value.schemaVersion !== 1)
    throw new Error('diff summary schema version must be 1');
  if (
    typeof value.maxDiffRatio !== 'number' ||
    !Number.isFinite(value.maxDiffRatio) ||
    value.maxDiffRatio < 0 ||
    value.maxDiffRatio >= 1
  ) {
    throw new Error('diff summary maxDiffRatio is invalid');
  }
  if (
    typeof value.pixelSensitivity !== 'number' ||
    !Number.isFinite(value.pixelSensitivity) ||
    value.pixelSensitivity < 0 ||
    value.pixelSensitivity > 1
  ) {
    throw new Error('diff summary pixelSensitivity is invalid');
  }
  requireString(value.startedAt, 'diff summary startedAt');
  requireString(value.finishedAt, 'diff summary finishedAt');
  requireString(value.generationId, 'diff summary generationId');
  if (value.gateVerdict !== 'pass' && value.gateVerdict !== 'fail') {
    throw new Error('diff summary gate verdict is invalid');
  }
  if (!Array.isArray(value.runErrors))
    throw new Error('diff summary runErrors must be an array');
  const runErrors = value.runErrors.map((error) => {
    if (
      !isRecord(error) ||
      ![
        'asset-tree',
        'capture-cleanup',
        'capture-prepare',
        'capture-summary'
      ].includes(String(error.phase))
    ) {
      throw new Error('diff run error phase is invalid');
    }
    assertExactKeys(error, ['message', 'name', 'phase'], 'diff run error');
    return {
      ...validateCaptureError(
        { message: error.message, name: error.name },
        'diff run error'
      ),
      phase: error.phase as DiffRunErrorV1['phase']
    };
  });
  if (!Array.isArray(value.results))
    throw new Error('diff summary results must be an array');
  const results = value.results as unknown as DiffResult[];
  const keys = new Set<string>();
  for (const result of results) {
    if (!isRecord(result)) throw new Error('diff result must be an object');
    assertExactKeys(
      result,
      [
        'auth',
        'baselineAsset',
        'baselineDimensions',
        'baselineEvidence',
        'baselinePolicy',
        'comparison',
        'currentAsset',
        'currentDimensions',
        'currentEvidence',
        'diffAsset',
        'diffPixels',
        'dimensionsMatch',
        'gateVerdict',
        'id',
        'issues',
        'path',
        'ratio',
        'totalPixels',
        'verdict',
        'viewport'
      ],
      'diff result'
    );
    const id = requireString(result.id, 'diff result id');
    const resultPath = requireString(result.path, 'diff result path');
    const viewport = requireString(result.viewport, 'diff result viewport');
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(id)) {
      throw new Error('diff result id is unsafe');
    }
    if (
      !resultPath.startsWith('/') ||
      resultPath.includes('\\') ||
      resultPath.includes('?') ||
      resultPath.includes('#')
    ) {
      throw new Error('diff result path is invalid');
    }
    if (viewport !== 'desktop' && viewport !== 'mobile') {
      throw new Error('diff result viewport is invalid');
    }
    if (
      !['admin', 'anonymous', 'company', 'individual'].includes(
        String(result.auth)
      )
    ) {
      throw new Error('diff result auth is invalid');
    }
    const key = `${result.id}\0${result.viewport}`;
    if (keys.has(key)) throw new Error('duplicate diff result');
    keys.add(key);
    if (!Array.isArray(result.issues))
      throw new Error('diff result issues must be an array');
    for (const issue of result.issues) {
      if (!isRecord(issue))
        throw new Error('diff result issue must be an object');
      assertExactKeys(issue, ['code', 'message', 'scope'], 'diff result issue');
      requireString(issue.code, 'diff result issue code');
      requireString(issue.message, 'diff result issue message');
      if (
        ![
          'baseline',
          'capture',
          'comparison',
          'current',
          'policy',
          'run'
        ].includes(String(issue.scope))
      ) {
        throw new Error('diff result issue scope is invalid');
      }
    }
    const baselinePolicy = validateResultPolicy(result.baselinePolicy);
    if (
      !['invalid', 'missing', 'read-error', 'valid'].includes(
        String(result.baselineEvidence)
      )
    ) {
      throw new Error('diff result baseline evidence is invalid');
    }
    if (
      !['invalid', 'missing', 'read-error', 'valid'].includes(
        String(result.currentEvidence)
      )
    ) {
      throw new Error('diff result current evidence is invalid');
    }
    const baselineEvidence = result.baselineEvidence as EvidenceState;
    const currentEvidence = result.currentEvidence as EvidenceState;
    validateDimensions(result.baselineDimensions, baselineEvidence, 'baseline');
    validateDimensions(result.currentDimensions, currentEvidence, 'current');
    if (!isPortableReportAsset(result.baselineAsset, 'baseline', result)) {
      throw new Error('diff result baseline asset is not portable');
    }
    if (!isPortableReportAsset(result.currentAsset, 'current', result)) {
      throw new Error('diff result current asset is not portable');
    }
    if (!isPortableReportAsset(result.diffAsset, 'diff', result)) {
      throw new Error('diff result diff asset is not portable');
    }
    if (
      (baselineEvidence === 'valid') !==
      (result.baselineAsset !== undefined)
    ) {
      throw new Error('diff result baseline asset contradicts its evidence');
    }
    if ((currentEvidence === 'valid') !== (result.currentAsset !== undefined)) {
      throw new Error('diff result current asset contradicts its evidence');
    }
    if (!['fail', 'not-enforced', 'pass'].includes(result.gateVerdict)) {
      throw new Error('diff result gate verdict is invalid');
    }
    if (!['changed', 'identical', 'not-run'].includes(result.comparison)) {
      throw new Error('diff result comparison is invalid');
    }
    if (result.ratio !== null && !isFiniteNonNegative(result.ratio)) {
      throw new Error('diff result ratio is invalid');
    }
    if (
      !isFiniteNonNegative(result.diffPixels) ||
      !isFiniteNonNegative(result.totalPixels)
    ) {
      throw new Error('diff result pixel totals are invalid');
    }
    if (
      !Number.isInteger(result.diffPixels) ||
      !Number.isInteger(result.totalPixels)
    ) {
      throw new Error('diff result pixel totals must be integers');
    }
    if (result.verdict !== 'pass' && result.verdict !== 'fail') {
      throw new Error('diff result verdict is invalid');
    }
    if (
      result.dimensionsMatch !== null &&
      typeof result.dimensionsMatch !== 'boolean'
    ) {
      throw new Error('diff result dimensions verdict is invalid');
    }
    if (result.comparison === 'not-run') {
      if (
        result.ratio !== null ||
        result.totalPixels !== 0 ||
        result.diffPixels !== 0 ||
        result.dimensionsMatch !== null ||
        result.diffAsset !== undefined
      ) {
        throw new Error('not-run diff result contains comparison evidence');
      }
    } else {
      if (
        result.ratio === null ||
        result.totalPixels <= 0 ||
        typeof result.dimensionsMatch !== 'boolean' ||
        result.ratio !== result.diffPixels / result.totalPixels
      ) {
        throw new Error('diff result comparison evidence is inconsistent');
      }
      if (
        (result.comparison === 'changed') !==
        (result.diffAsset !== undefined)
      ) {
        throw new Error('diff result diff asset contradicts its comparison');
      }
      if (
        result.comparison === 'identical' &&
        (result.diffPixels !== 0 ||
          result.ratio !== 0 ||
          !result.dimensionsMatch)
      ) {
        throw new Error('identical diff result is inconsistent');
      }
    }
    const evidenceFault =
      baselineEvidence !== 'valid' || currentEvidence !== 'valid';
    const comparisonFailure =
      result.dimensionsMatch === false ||
      (result.ratio !== null && result.ratio > value.maxDiffRatio);
    const factualFailure =
      evidenceFault || baselinePolicy.kind === 'missing' || comparisonFailure;
    const expectedVerdict = factualFailure ? 'fail' : 'pass';
    const expectedResultGate = policyGateVerdict(
      baselinePolicy,
      evidenceFault,
      factualFailure
    );
    if (
      result.verdict !== expectedVerdict ||
      result.gateVerdict !== expectedResultGate
    ) {
      throw new Error('diff result verdict drift');
    }
  }
  const validatedResults = results.map((result) => ({
    ...structuredClone(result),
    baselinePolicy: validateResultPolicy(result.baselinePolicy),
    issues: result.issues.map((issue) => ({
      ...issue,
      message: sanitizeDiagnosticMessage(issue.message)
    }))
  }));
  if (!isRecord(value.totals))
    throw new Error('diff summary totals must be an object');
  assertExactKeys(
    value.totals,
    ['failed', 'notEnforced', 'passed', 'selected'],
    'diff summary totals'
  );
  const totals = resultTotals(validatedResults);
  if (
    value.totals.selected !== totals.selected ||
    value.totals.passed !== totals.passed ||
    value.totals.failed !== totals.failed ||
    value.totals.notEnforced !== totals.notEnforced
  ) {
    throw new Error('diff summary totals drift');
  }
  const capture =
    value.capture === null
      ? null
      : validateEmbeddedCapture(value.capture, validatedResults);
  if (capture) {
    for (const runError of capture.runErrors) {
      const expectedPhase = `capture-${runError.phase}`;
      if (
        !runErrors.some(
          ({ message, name, phase }) =>
            phase === expectedPhase &&
            message === runError.message &&
            name === runError.name
        )
      ) {
        throw new Error('capture run error is missing from diff run errors');
      }
    }
  }
  const captureFailed = capture?.status === 'failed';
  const expectedGate =
    runErrors.length > 0 || captureFailed || totals.failed > 0
      ? 'fail'
      : 'pass';
  if (value.gateVerdict !== expectedGate)
    throw new Error('diff summary gate verdict drift');
  if (capture === null && runErrors.length === 0) {
    throw new Error(
      'diff summary without capture metadata must have a run error'
    );
  }
  return {
    capture,
    finishedAt: value.finishedAt as string,
    gateVerdict: value.gateVerdict,
    generationId: value.generationId as string,
    maxDiffRatio: value.maxDiffRatio,
    pixelSensitivity: value.pixelSensitivity,
    results: validatedResults,
    runErrors,
    schemaVersion: 1,
    startedAt: value.startedAt as string,
    totals
  };
}

const sanitizeError = (error: unknown): CaptureErrorV1 => ({
  message: sanitizeDiagnosticMessage(
    error instanceof Error ? error.message : String(error)
  ),
  name: error instanceof Error ? error.name || 'Error' : 'Error'
});

const isWithin = (root: string, candidate: string): boolean => {
  const relative = path.relative(root, candidate);
  return (
    relative === '' ||
    (relative !== '..' &&
      !relative.startsWith(`..${path.sep}`) &&
      !path.isAbsolute(relative))
  );
};

const hasSymlinkBelowRoot = async (
  file: string,
  root: string
): Promise<boolean> => {
  const resolvedRoot = path.resolve(root);
  let candidate = path.resolve(file);
  while (candidate !== resolvedRoot && isWithin(resolvedRoot, candidate)) {
    try {
      if ((await lstat(candidate)).isSymbolicLink()) return true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    candidate = path.dirname(candidate);
  }
  return false;
};

const readEvidence = async (
  file: string,
  root: string,
  afterOpen?: (file: string) => Promise<void>
): Promise<PngEvidenceInput> => {
  let handle: Awaited<ReturnType<typeof open>> | undefined;
  try {
    if (await hasSymlinkBelowRoot(file, root)) {
      return { kind: 'read-error', message: 'asset must be a regular file' };
    }
    handle = await open(file, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    const fileStatus = await handle.stat();
    if (!fileStatus.isFile()) {
      return { kind: 'read-error', message: 'asset must be a regular file' };
    }
    const [canonicalRoot, canonicalFile] = await Promise.all([
      realpath(root),
      realpath(file)
    ]);
    if (!isWithin(canonicalRoot, canonicalFile)) {
      return {
        kind: 'read-error',
        message: 'asset must remain within its approved source root'
      };
    }
    const pathStatus = await lstat(file);
    if (
      pathStatus.isSymbolicLink() ||
      pathStatus.dev !== fileStatus.dev ||
      pathStatus.ino !== fileStatus.ino
    ) {
      return {
        kind: 'read-error',
        message: 'asset identity changed while opening'
      };
    }
    await afterOpen?.(file);
    return { bytes: await handle.readFile(), kind: 'bytes' };
  } catch (error) {
    if (
      (error as NodeJS.ErrnoException).code === 'ENOENT' &&
      !(await hasSymlinkBelowRoot(file, root))
    ) {
      return { kind: 'missing' };
    }
    const problem = error as NodeJS.ErrnoException;
    return {
      kind: 'read-error',
      message: problem.code ?? (error instanceof Error ? error.name : 'Error')
    };
  } finally {
    await handle?.close();
  }
};

const atomicJson = async (file: string, value: unknown): Promise<void> => {
  await mkdir(path.dirname(file), { recursive: true });
  const partial = path.join(
    path.dirname(file),
    `.${path.basename(file)}.${process.pid}.${Date.now()}.partial`
  );
  await writeFile(partial, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
  await rename(partial, file);
};

interface GenerationLockOwner {
  pid: number;
  startedAt: string;
  token: string;
}

export interface GenerationLock {
  release: () => Promise<void>;
  token: string;
}

const isLivePid = (pid: number): boolean => {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === 'EPERM';
  }
};

const readLockOwner = async (
  lockRoot: string
): Promise<GenerationLockOwner> => {
  const value: unknown = JSON.parse(
    await readFile(path.join(lockRoot, 'owner.json'), 'utf8')
  );
  if (!isRecord(value)) throw new Error('visual diff lock owner is invalid');
  assertExactKeys(
    value,
    ['pid', 'startedAt', 'token'],
    'visual diff lock owner'
  );
  if (!Number.isInteger(value.pid) || (value.pid as number) <= 0) {
    throw new Error('visual diff lock pid is invalid');
  }
  return {
    pid: value.pid as number,
    startedAt: requireString(value.startedAt, 'visual diff lock startedAt'),
    token: requireString(value.token, 'visual diff lock token')
  };
};

export const acquireGenerationLock = async (
  diffDir: string,
  fault?: RunDiffOptions['fault']
): Promise<GenerationLock> => {
  const lockRoot = `${diffDir}.lock`;
  const owner: GenerationLockOwner = {
    pid: process.pid,
    startedAt: new Date().toISOString(),
    token: randomUUID()
  };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      fault?.('acquire-lock');
      await mkdir(lockRoot);
      try {
        await atomicJson(path.join(lockRoot, 'owner.json'), owner);
      } catch (error) {
        await rm(lockRoot, { force: true, recursive: true });
        throw error;
      }
      return {
        token: owner.token,
        release: async () => {
          let current: GenerationLockOwner;
          try {
            current = await readLockOwner(lockRoot);
          } catch (error) {
            if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
            throw error;
          }
          if (current.token !== owner.token) return;
          const releaseRoot = `${lockRoot}.release-${owner.token}`;
          await rename(lockRoot, releaseRoot);
          await rm(releaseRoot, { force: true, recursive: true });
        }
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      const current = await readLockOwner(lockRoot);
      if (isLivePid(current.pid)) {
        throw new Error('another visual diff generation is active');
      }
      const staleRoot = `${lockRoot}.stale-${current.token}-${randomUUID()}`;
      try {
        await rename(lockRoot, staleRoot);
      } catch (renameError) {
        if ((renameError as NodeJS.ErrnoException).code === 'ENOENT') continue;
        throw renameError;
      }
      const moved = await readLockOwner(staleRoot);
      if (moved.token !== current.token) {
        throw new Error('visual diff lock owner changed during stale recovery');
      }
      await rm(staleRoot, { force: true, recursive: true });
    }
  }
  throw new Error('could not acquire visual diff generation lock');
};

const promoteGeneration = async (
  stageRoot: string,
  activeRoot: string,
  backupRoot: string,
  fault?: RunDiffOptions['fault']
): Promise<void> => {
  let previousGeneration = false;
  let promotedGeneration = false;
  try {
    try {
      await lstat(activeRoot);
      await rename(activeRoot, backupRoot);
      previousGeneration = true;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
    fault?.('promote');
    await rename(stageRoot, activeRoot);
    promotedGeneration = true;
    if (previousGeneration) {
      await rm(backupRoot, { force: true, recursive: true });
    }
  } catch (error) {
    if (promotedGeneration) {
      await rm(activeRoot, { force: true, recursive: true });
    }
    if (previousGeneration) {
      fault?.('rollback');
      await rename(backupRoot, activeRoot);
    }
    throw error;
  }
};

const resultTotals = (results: readonly DiffResult[]) => ({
  failed: results.filter(({ gateVerdict }) => gateVerdict === 'fail').length,
  notEnforced: results.filter(
    ({ gateVerdict }) => gateVerdict === 'not-enforced'
  ).length,
  passed: results.filter(({ gateVerdict }) => gateVerdict === 'pass').length,
  selected: results.length
});

export async function runDiff(options: RunDiffOptions): Promise<DiffRunResult> {
  if (
    options.paths.summaryFile !==
      path.join(options.paths.diffDir, 'summary.json') ||
    options.paths.reportFile !== path.join(options.paths.diffDir, 'report.html')
  ) {
    throw new Error(
      'diff summary and report paths must be exact diff directory children'
    );
  }
  if (
    !Number.isFinite(options.maxDiffRatio) ||
    options.maxDiffRatio < 0 ||
    options.maxDiffRatio >= 1
  ) {
    throw new Error('max diff ratio must be in the range [0, 1)');
  }
  if (
    !Number.isFinite(options.pixelSensitivity) ||
    options.pixelSensitivity < 0 ||
    options.pixelSensitivity > 1
  ) {
    throw new Error('pixel sensitivity must be in the range [0, 1]');
  }
  const startedAt = new Date().toISOString();
  const results: DiffResult[] = [];
  const runErrors: DiffRunErrorV1[] = [];
  let capture: CaptureSummaryV1 | null = null;
  const readBytes = options.readBytes ?? readFile;
  await mkdir(path.dirname(options.paths.diffDir), { recursive: true });
  const generationId = `${process.pid}-${randomUUID()}`;
  const stageRoot = `${options.paths.diffDir}.stage-${generationId}`;
  const backupRoot = `${options.paths.diffDir}.backup-${generationId}`;
  const lock = await acquireGenerationLock(
    options.paths.diffDir,
    options.fault
  );
  const prepareStage = async (): Promise<string> => {
    await rm(stageRoot, { force: true, recursive: true });
    const stageAssets = path.join(stageRoot, 'report-assets');
    for (const bucket of ['baseline', 'current', 'diff']) {
      await mkdir(path.join(stageAssets, bucket), { recursive: true });
    }
    return stageAssets;
  };
  const makeSummary = (
    summaryCapture: CaptureSummaryV1 | null,
    summaryResults: DiffResult[],
    summaryErrors: DiffRunErrorV1[]
  ): DiffSummaryV1 => {
    const totals = resultTotals(summaryResults);
    const gateVerdict =
      summaryErrors.length > 0 ||
      summaryCapture?.status === 'failed' ||
      totals.failed > 0
        ? 'fail'
        : 'pass';
    return {
      capture: summaryCapture,
      finishedAt: new Date().toISOString(),
      gateVerdict,
      generationId,
      maxDiffRatio: options.maxDiffRatio,
      pixelSensitivity: options.pixelSensitivity,
      results: summaryResults,
      runErrors: summaryErrors,
      schemaVersion: 1,
      startedAt,
      totals
    };
  };
  const installFailureGeneration = async (
    error: unknown
  ): Promise<DiffRunResult> => {
    const sanitized = sanitizeError(error);
    const failure: DiffRunErrorV1 = {
      message: sanitized.message,
      name: sanitized.name,
      phase: 'asset-tree'
    };
    const summary = makeSummary(null, [], [failure]);
    await prepareStage();
    await atomicJson(path.join(stageRoot, 'summary.json'), summary);
    await promoteGeneration(stageRoot, options.paths.diffDir, backupRoot);
    return { exitCode: 1, summary };
  };
  try {
    const stageAssets = await prepareStage();

    try {
      const raw = await readBytes(options.paths.captureSummary);
      capture = validateCaptureSummary(
        JSON.parse(raw.toString('utf8')),
        options.manifest
      );
    } catch (error) {
      const sanitized = sanitizeError(error);
      runErrors.push({
        message:
          (error as NodeJS.ErrnoException).code === 'ENOENT'
            ? 'capture summary is missing'
            : sanitized.message,
        name: sanitized.name,
        phase: 'capture-summary'
      });
    }

    if (capture) {
      runErrors.push(
        ...capture.runErrors.map(({ message, name, phase }) => ({
          message,
          name,
          phase: `capture-${phase}` as const
        }))
      );
      const selectedCases = selectVisualCases(
        options.manifest,
        capture.selection
      );
      for (let index = 0; index < selectedCases.length; index += 1) {
        const subject = selectedCases[index];
        const captureResult = capture.cases[index];
        const caseRelative = `${subject.entry.id}/${subject.viewport}.png`;
        const baselineSource = path.join(
          options.paths.baselineDir,
          subject.entry.id,
          `${subject.viewport}.png`
        );
        const baselineInput = await readEvidence(
          baselineSource,
          options.paths.baselineDir,
          options.afterEvidenceOpen
        );
        const currentInput =
          captureResult.status === 'failed'
            ? ({ kind: 'missing' } as const)
            : await readEvidence(
                path.join(
                  options.paths.currentDir,
                  subject.entry.id,
                  `${subject.viewport}.png`
                ),
                options.paths.currentDir,
                options.afterEvidenceOpen
              );
        const compared = comparePngCase({
          baselineBytes: baselineInput,
          captureResult,
          currentBytes: currentInput,
          maxDiffRatio: options.maxDiffRatio,
          pixelSensitivity: options.pixelSensitivity,
          visualCase: subject
        });
        if (
          baselineInput.kind === 'bytes' &&
          compared.result.baselineEvidence === 'valid'
        ) {
          compared.result.baselineAsset = `report-assets/baseline/${caseRelative}`;
          const output = path.join(
            stageAssets,
            'baseline',
            subject.entry.id,
            `${subject.viewport}.png`
          );
          options.fault?.('write-asset');
          await mkdir(path.dirname(output), { recursive: true });
          await writeFile(output, baselineInput.bytes);
        }
        if (
          currentInput.kind === 'bytes' &&
          compared.result.currentEvidence === 'valid'
        ) {
          compared.result.currentAsset = `report-assets/current/${caseRelative}`;
          const output = path.join(
            stageAssets,
            'current',
            subject.entry.id,
            `${subject.viewport}.png`
          );
          options.fault?.('write-asset');
          await mkdir(path.dirname(output), { recursive: true });
          await writeFile(output, currentInput.bytes);
        }
        if (compared.diffPng) {
          compared.result.diffAsset = `report-assets/diff/${caseRelative}`;
          const output = path.join(
            stageAssets,
            'diff',
            subject.entry.id,
            `${subject.viewport}.png`
          );
          options.fault?.('write-asset');
          await mkdir(path.dirname(output), { recursive: true });
          await writeFile(output, compared.diffPng);
        }
        results.push(compared.result);
      }
    }

    const summary = makeSummary(capture, results, runErrors);
    await atomicJson(path.join(stageRoot, 'summary.json'), summary);
    await promoteGeneration(
      stageRoot,
      options.paths.diffDir,
      backupRoot,
      options.fault
    );
    return { exitCode: summary.gateVerdict === 'pass' ? 0 : 1, summary };
  } catch (error) {
    return await installFailureGeneration(error);
  } finally {
    await rm(stageRoot, { force: true, recursive: true });
    await lock.release();
  }
}
