import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { MANIFEST } from './manifest';
import {
  parseVisualArgs,
  resolveVisualPaths,
  resolveVisualSelection
} from './config';

describe('parseVisualArgs', () => {
  it('parses every supported selection flag', () => {
    expect(
      parseVisualArgs(
        [
          '--cluster=public-static,account-auth',
          '--only=home,faq',
          '--target=src/components/Home',
          '--viewport=desktop,mobile',
          '--threshold=0.001'
        ],
        'verify'
      )
    ).toEqual({
      clusters: ['public-static', 'account-auth'],
      command: 'verify',
      ids: ['home', 'faq'],
      target: 'src/components/Home',
      threshold: 0.001,
      viewports: ['desktop', 'mobile']
    });
  });

  it.each([
    ['baseline', 'baseline'],
    ['capture', 'current']
  ] as const)('assigns the safe %s output bucket', (command, outputBucket) => {
    expect(parseVisualArgs([], command).outputBucket).toBe(outputBucket);
  });

  it.each(['diff', 'report', 'verify'] as const)(
    'does not assign an output bucket to %s',
    (command) => {
      expect(parseVisualArgs([], command).outputBucket).toBeUndefined();
    }
  );

  it('keeps the legacy explicit buckets constrained to their entrypoints', () => {
    expect(
      parseVisualArgs(['--bucket=baseline'], 'baseline').outputBucket
    ).toBe('baseline');
    expect(parseVisualArgs(['--bucket=current'], 'capture').outputBucket).toBe(
      'current'
    );
  });

  it.each(['capture', 'diff', 'report', 'verify'] as const)(
    'rejects baseline output smuggling through %s',
    (command) => {
      expect(() => parseVisualArgs(['--bucket=baseline'], command)).toThrow(
        'only the baseline command may write the baseline bucket'
      );
    }
  );

  it.each([
    {
      argv: ['--bucket=current'],
      command: 'baseline',
      problem: 'baseline command'
    },
    { argv: ['--bucket=other'], command: 'capture', problem: 'unknown bucket' },
    {
      argv: ['--bucket=current'],
      command: 'diff',
      problem: 'does not accept --bucket'
    },
    { argv: ['--wat=yes'], command: 'verify', problem: 'unknown visual flag' },
    {
      argv: ['target=src/Home'],
      command: 'verify',
      problem: 'malformed visual argument'
    },
    {
      argv: ['--target'],
      command: 'verify',
      problem: 'malformed visual argument'
    },
    { argv: ['--target='], command: 'verify', problem: 'must not be empty' },
    {
      argv: ['--only=home,,faq'],
      command: 'verify',
      problem: 'must not contain empty values'
    },
    {
      argv: ['--only=home,home'],
      command: 'verify',
      problem: 'duplicate --only value'
    },
    {
      argv: ['--cluster=public-static,public-static'],
      command: 'verify',
      problem: 'duplicate --cluster value'
    },
    {
      argv: ['--viewport=desktop,desktop'],
      command: 'verify',
      problem: 'duplicate --viewport value'
    },
    {
      argv: ['--target=a', '--target=b'],
      command: 'verify',
      problem: 'duplicate visual flag'
    },
    {
      argv: ['--cluster=unknown'],
      command: 'verify',
      problem: 'unknown route cluster'
    },
    {
      argv: ['--viewport=tablet'],
      command: 'verify',
      problem: 'unknown viewport'
    },
    { argv: ['--threshold=NaN'], command: 'verify', problem: 'finite number' },
    {
      argv: ['--threshold=Infinity'],
      command: 'verify',
      problem: 'finite number'
    },
    {
      argv: ['--threshold=-0.01'],
      command: 'verify',
      problem: 'greater than or equal to 0'
    },
    {
      argv: ['--threshold=1'],
      command: 'verify',
      problem: 'less than 1'
    },
    {
      argv: ['--threshold=1.01'],
      command: 'verify',
      problem: 'less than 1'
    }
  ] as const)(
    'rejects unsafe or malformed CLI input: $argv',
    ({ argv, command, problem }) => {
      expect(() => parseVisualArgs([...argv], command)).toThrow(problem);
    }
  );

  it.each(['0', '0.999999'])(
    'accepts threshold value %s in the lower-inclusive, upper-exclusive range',
    (threshold) => {
      expect(
        parseVisualArgs([`--threshold=${threshold}`], 'diff').threshold
      ).toBe(Number(threshold));
    }
  );
});

describe('resolveVisualPaths', () => {
  const cwd = path.resolve('/work/cag');

  it('uses isolated defaults under the visual regression directory', () => {
    expect(resolveVisualPaths({}, cwd)).toEqual({
      artifactDir: path.join(cwd, 'scripts/visual-regression/artifacts'),
      authDir: path.join(cwd, 'scripts/visual-regression/.auth'),
      baseUrl: 'http://127.0.0.1:3000',
      baselineDir: path.join(
        cwd,
        'scripts/visual-regression/snapshots/baseline'
      ),
      captureSummary: path.join(
        cwd,
        'scripts/visual-regression/artifacts/capture-summary.json'
      ),
      currentDir: path.join(cwd, 'scripts/visual-regression/artifacts/current'),
      diffDir: path.join(cwd, 'scripts/visual-regression/artifacts/diff'),
      reportFile: path.join(
        cwd,
        'scripts/visual-regression/artifacts/diff/report.html'
      ),
      summaryFile: path.join(
        cwd,
        'scripts/visual-regression/artifacts/diff/summary.json'
      )
    });
  });

  it('covers every environment override and resolves relative directories', () => {
    expect(
      resolveVisualPaths(
        {
          VR_ARTIFACT_DIR: ' ./runs/one ',
          VR_AUTH_DIR: ' ../shared/auth ',
          VR_BASELINE_DIR: ' /approved/cag/baseline ',
          VR_BASE_URL: 'http://localhost:4321/'
        },
        cwd
      )
    ).toMatchObject({
      artifactDir: path.join(cwd, 'runs/one'),
      authDir: path.resolve(cwd, '../shared/auth'),
      baseUrl: 'http://localhost:4321',
      baselineDir: '/approved/cag/baseline'
    });
  });

  it.each([
    {
      environment: {
        VR_ARTIFACT_DIR: '/evidence',
        VR_BASELINE_DIR: '/evidence'
      }
    },
    {
      environment: {
        VR_ARTIFACT_DIR: '/evidence/run',
        VR_BASELINE_DIR: '/evidence'
      }
    },
    {
      environment: {
        VR_ARTIFACT_DIR: '/evidence',
        VR_BASELINE_DIR: '/evidence/baseline'
      }
    }
  ])(
    'rejects baseline/artifact overlap in either direction',
    ({ environment }) => {
      expect(() => resolveVisualPaths(environment, cwd)).toThrow(
        'baseline and artifact directories must not overlap'
      );
    }
  );

  it.each([
    {
      environment: {
        VR_AUTH_DIR: '/evidence',
        VR_BASELINE_DIR: '/evidence'
      },
      pair: 'baseline and auth'
    },
    {
      environment: {
        VR_AUTH_DIR: '/evidence/auth',
        VR_BASELINE_DIR: '/evidence'
      },
      pair: 'baseline and auth'
    },
    {
      environment: {
        VR_AUTH_DIR: '/evidence',
        VR_BASELINE_DIR: '/evidence/baseline'
      },
      pair: 'baseline and auth'
    },
    {
      environment: {
        VR_ARTIFACT_DIR: '/evidence',
        VR_AUTH_DIR: '/evidence'
      },
      pair: 'artifact and auth'
    },
    {
      environment: {
        VR_ARTIFACT_DIR: '/evidence',
        VR_AUTH_DIR: '/evidence/auth'
      },
      pair: 'artifact and auth'
    },
    {
      environment: {
        VR_ARTIFACT_DIR: '/evidence/run',
        VR_AUTH_DIR: '/evidence'
      },
      pair: 'artifact and auth'
    }
  ])('rejects $pair overlap in both directions', ({ environment, pair }) => {
    expect(() => resolveVisualPaths(environment, cwd)).toThrow(
      `${pair} directories must not overlap`
    );
  });

  it('detects overlap through a real symlink and nonexistent descendants', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'cag-vr-config-'));
    try {
      const approved = path.join(root, 'approved');
      const alias = path.join(root, 'approved-alias');
      mkdirSync(approved);
      symlinkSync(approved, alias, 'dir');

      expect(() =>
        resolveVisualPaths(
          {
            VR_ARTIFACT_DIR: path.join(alias, 'corpus/run'),
            VR_AUTH_DIR: path.join(root, 'auth'),
            VR_BASELINE_DIR: path.join(approved, 'corpus')
          },
          cwd
        )
      ).toThrow('baseline and artifact directories must not overlap');
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it('detects case aliases when the filesystem is case-insensitive', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'cag-vr-case-'));
    try {
      const canonical = path.join(root, 'Approved');
      const alias = path.join(root, 'approved');
      mkdirSync(canonical);
      if (!existsSync(alias)) return;

      expect(() =>
        resolveVisualPaths(
          {
            VR_ARTIFACT_DIR: path.join(alias, 'corpus/run'),
            VR_AUTH_DIR: path.join(root, 'auth'),
            VR_BASELINE_DIR: path.join(canonical, 'corpus')
          },
          cwd
        )
      ).toThrow('baseline and artifact directories must not overlap');
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it('case-folds nonexistent descendants on a case-insensitive filesystem', () => {
    const root = mkdtempSync(path.join(os.tmpdir(), 'cag-vr-missing-case-'));
    try {
      const caseProbe = path.join(root, 'CASE-PROBE');
      mkdirSync(caseProbe);
      if (!existsSync(path.join(root, 'case-probe'))) return;

      expect(() =>
        resolveVisualPaths(
          {
            VR_ARTIFACT_DIR: path.join(root, 'future-corpus/run'),
            VR_AUTH_DIR: path.join(root, 'auth'),
            VR_BASELINE_DIR: path.join(root, 'FUTURE-CORPUS')
          },
          cwd
        )
      ).toThrow('baseline and artifact directories must not overlap');
    } finally {
      rmSync(root, { force: true, recursive: true });
    }
  });

  it('normalizes repeated root slashes to an origin-only base URL', () => {
    expect(
      resolveVisualPaths({ VR_BASE_URL: 'https://example.com:8443////' }, cwd)
        .baseUrl
    ).toBe('https://example.com:8443');
  });

  it.each([
    { VR_BASE_URL: '' },
    { VR_BASE_URL: 'not-a-url' },
    { VR_BASE_URL: 'file:///tmp/site' },
    { VR_BASE_URL: 'https://user:secret@example.com' },
    { VR_BASE_URL: 'https://example.com?mode=visual' },
    { VR_BASE_URL: 'https://example.com#visual' },
    { VR_BASE_URL: 'https://example.com/app' },
    { VR_ARTIFACT_DIR: ' ' },
    { VR_AUTH_DIR: '' },
    { VR_BASELINE_DIR: ' ' }
  ])('rejects invalid environment configuration: %o', (environment) => {
    expect(() => resolveVisualPaths(environment, cwd)).toThrow();
  });
});

describe('resolveVisualSelection', () => {
  const cwd = path.resolve('/work/cag');

  it('returns a validated manifest selection without mutating the manifest', () => {
    const snapshot = JSON.stringify(MANIFEST);
    const args = parseVisualArgs(
      [
        '--cluster=public-static',
        '--only=home,faq',
        '--target=src/components/Home',
        '--viewport=desktop'
      ],
      'verify'
    );

    expect(resolveVisualSelection(args, MANIFEST, cwd)).toEqual({
      clusters: ['public-static'],
      ids: ['home', 'faq'],
      target: 'src/components/Home',
      viewports: ['desktop']
    });
    expect(JSON.stringify(MANIFEST)).toBe(snapshot);
  });

  it('rejects unknown route IDs against the selected manifest', () => {
    const args = parseVisualArgs(['--only=not-a-route'], 'verify');
    expect(() => resolveVisualSelection(args, MANIFEST, cwd)).toThrow(
      'unknown visual route id'
    );
  });

  it('rejects a valid set of filters whose intersection is empty', () => {
    const args = parseVisualArgs(
      ['--cluster=account-auth', '--only=home'],
      'verify'
    );
    expect(() => resolveVisualSelection(args, MANIFEST, cwd)).toThrow(
      'selection selected no visual cases'
    );
  });

  it('normalizes repository-relative target dot segments before selection', () => {
    const args = parseVisualArgs(
      ['--only=home', '--target=./src/components/FAQ/../Home'],
      'verify'
    );

    expect(resolveVisualSelection(args, MANIFEST, cwd)).toMatchObject({
      ids: ['home'],
      target: 'src/components/Home'
    });
  });

  it.each(['../outside', 'src/../../../outside', '/absolute/outside'])(
    'rejects target escape %s',
    (target) => {
      const args = parseVisualArgs([`--target=${target}`], 'verify');
      expect(() => resolveVisualSelection(args, MANIFEST, cwd)).toThrow(
        '--target must be repository-relative and remain within the repository'
      );
    }
  );
});
