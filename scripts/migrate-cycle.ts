/**
 * Orchestrates one migration cycle for a target directory:
 *
 *   1. capture baseline (only if --no-baseline isn't set)
 *   2. run codemod with --write
 *   3. capture current
 *   4. diff baseline vs current (only the routes touched by target)
 *   5. render HTML report
 *
 * Usage:
 *   npx tsx scripts/migrate-cycle.ts --target=src/components/Home [--baseline-only] [--verify-only]
 *
 * Assumptions:
 *   - dev server already running (npm run start)
 *   - auth-setup.ts already run if target has auth-walled routes
 */

import { spawn } from 'node:child_process';
import path from 'node:path';

type Args = {
  target: string;
  baselineOnly: boolean;
  verifyOnly: boolean;
};

function parseArgs(): Args {
  const args: Partial<Args> = { baselineOnly: false, verifyOnly: false };
  for (const arg of process.argv.slice(2)) {
    const [k, v] = arg.replace(/^--/, '').split('=');
    if (k === 'target') args.target = v;
    else if (k === 'baseline-only') args.baselineOnly = true;
    else if (k === 'verify-only') args.verifyOnly = true;
  }
  if (!args.target) throw new Error('--target=<path> is required');
  return args as Args;
}

function run(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`\n$ ${cmd} ${args.join(' ')}`);
    const child = spawn(cmd, args, { stdio: 'inherit', shell: false });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited ${code}`));
    });
  });
}

async function main() {
  const args = parseArgs();
  const tsx = path.resolve(process.cwd(), 'node_modules/.bin/tsx');

  if (!args.verifyOnly) {
    await run(tsx, [
      'scripts/visual-regression/capture.ts',
      '--bucket=baseline',
      `--target=${args.target}`
    ]);
    if (args.baselineOnly) {
      console.log(
        '\n[cycle] baseline captured. Re-run without --baseline-only after running the codemod.'
      );
      return;
    }

    await run(tsx, [
      'scripts/migrate-styles/codemod.ts',
      `--target=${args.target}`,
      '--write'
    ]);
  }

  await run(tsx, [
    'scripts/visual-regression/capture.ts',
    '--bucket=current',
    `--target=${args.target}`
  ]);

  // Diff exits 1 on regression — that's fine, we still want the report.
  let diffFailed = false;
  await run(tsx, [
    'scripts/visual-regression/diff.ts',
    `--target=${args.target}`
  ]).catch(() => {
    diffFailed = true;
  });

  await run(tsx, ['scripts/visual-regression/report.ts']);

  console.log(
    '\n[cycle] open scripts/visual-regression/snapshots/diff/report.html'
  );
  if (diffFailed) {
    console.error('\n[cycle] regressions detected — review report and fix.');
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
