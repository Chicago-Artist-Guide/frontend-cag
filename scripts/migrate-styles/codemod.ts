/**
 * AST codemod that migrates a single styled-components file (or a directory
 * of them) to Tailwind utility classes.
 *
 * Strategy — conservative on purpose:
 *   - Only transforms `styled.<htmlTag>` declarations whose template body has
 *     ZERO interpolations and ZERO descendant blocks. Pseudo blocks
 *     (&:hover/&:focus etc.) are mapped to Tailwind variants.
 *   - For every JSX usage of a transformed component, rewrites
 *     <Foo>...</Foo>  →  <htmlTag className="...">...</htmlTag>
 *     preserving any existing props.
 *   - Components that don't qualify get a `// TODO: migrate-styles: <reason>`
 *     comment above them and are left intact for manual review.
 *   - Removes `styled` from the import only when no styled.* remains.
 *
 * Usage:
 *   npx tsx scripts/migrate-styles/codemod.ts \
 *     --target=src/components/Home \
 *     [--dry-run] \
 *     [--write]   # actually save changes (default is dry-run)
 *
 * Outputs a per-run report to scripts/migrate-styles/last-run.json
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import {
  Project,
  Node,
  SyntaxKind,
  type SourceFile,
  type VariableDeclaration,
  type TaggedTemplateExpression,
  type Identifier,
  type JsxOpeningElement,
  type JsxSelfClosingElement
} from 'ts-morph';
import { ensureConfigLoaded, mapDeclaration } from './css-to-tailwind';
import { parseStyledBody, type ParsedRule } from './parse-styled';

type Args = {
  target: string;
  write: boolean;
  dryRun: boolean;
};

type ComponentRecord = {
  file: string;
  name: string;
  status: 'migrated' | 'skipped';
  reason?: string;
  htmlTag?: string;
  classes?: string[];
};

function parseArgs(): Args {
  const args: Partial<Args> = { dryRun: true, write: false };
  for (const arg of process.argv.slice(2)) {
    const [k, v] = arg.replace(/^--/, '').split('=');
    if (k === 'target') args.target = v;
    else if (k === 'write') args.write = true;
    else if (k === 'dry-run') args.dryRun = true;
  }
  if (!args.target) throw new Error('--target=<path> is required');
  args.dryRun = !args.write;
  return args as Args;
}

const VARIANT_MAP: Record<string, string> = {
  '&:hover': 'hover',
  '&:focus': 'focus',
  '&:active': 'active',
  '&:disabled': 'disabled',
  '&:focus-visible': 'focus-visible',
  '&:focus-within': 'focus-within',
  '&:first-child': 'first',
  '&:last-child': 'last',
  '&::before': 'before',
  '&::after': 'after'
};

function pseudoToVariant(selector: string): string | null {
  const cleaned = selector.replace(/\s+/g, '');
  return VARIANT_MAP[cleaned] ?? null;
}

async function gatherFiles(target: string): Promise<string[]> {
  const stat = await fs.stat(target);
  if (stat.isFile()) return [path.resolve(target)];
  const out: string[] = [];
  async function walk(dir: string) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const e of entries) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) await walk(full);
      else if (/\.(tsx|ts)$/.test(e.name)) out.push(full);
    }
  }
  await walk(path.resolve(target));
  return out;
}

/**
 * Try to map every rule of a styled-components body to Tailwind classes.
 * Returns either a flat class list or a reason for skipping.
 */
function ruleSetToClasses(
  rules: ParsedRule[]
): { ok: true; classes: string[] } | { ok: false; reason: string } {
  const classes: string[] = [];
  for (const rule of rules) {
    if (rule.kind === 'declaration') {
      if (rule.hasInterpolation) {
        return { ok: false, reason: `dynamic value on ${rule.prop}` };
      }
      const mapped = mapDeclaration(rule.prop, rule.value);
      if (!mapped)
        return { ok: false, reason: `unmapped: ${rule.prop}: ${rule.value}` };
      classes.push(...mapped);
      continue;
    }
    if (rule.kind === 'pseudo') {
      const variant = pseudoToVariant(rule.selector);
      if (!variant)
        return {
          ok: false,
          reason: `pseudo "${rule.selector}" not yet mapped`
        };
      for (const decl of rule.declarations) {
        if (decl.hasInterpolation) {
          return { ok: false, reason: `dynamic value in ${rule.selector}` };
        }
        const mapped = mapDeclaration(decl.prop, decl.value);
        if (!mapped) {
          return {
            ok: false,
            reason: `unmapped in ${rule.selector}: ${decl.prop}: ${decl.value}`
          };
        }
        classes.push(...mapped.map((c) => `${variant}:${c}`));
      }
      continue;
    }
    if (rule.kind === 'descendant') {
      return { ok: false, reason: `descendant selector "${rule.selector}"` };
    }
    if (rule.kind === 'media') {
      return { ok: false, reason: '@media query' };
    }
    return { ok: false, reason: 'unknown rule kind' };
  }
  return { ok: true, classes };
}

/**
 * Find the styled.X tagged template inside a `const X = styled.X\`...\`;`.
 * Returns null for non-matching shapes (e.g. styled(Component), .attrs(...)).
 */
function extractStyledTag(
  decl: VariableDeclaration
): { htmlTag: string; tagged: TaggedTemplateExpression } | null {
  const init = decl.getInitializer();
  if (!init) return null;
  if (!Node.isTaggedTemplateExpression(init)) return null;

  const tag = init.getTag();
  // Want PropertyAccessExpression: `styled.div`
  if (!Node.isPropertyAccessExpression(tag)) return null;
  const left = tag.getExpression();
  if (!Node.isIdentifier(left) || left.getText() !== 'styled') return null;
  const htmlTag = tag.getName();
  return { htmlTag, tagged: init };
}

function rewriteJsxUsages(
  sourceFile: SourceFile,
  componentName: string,
  htmlTag: string,
  classes: string[]
): number {
  let count = 0;
  const classString = dedupeClasses(classes).join(' ');

  sourceFile.forEachDescendant((node) => {
    if (Node.isJsxOpeningElement(node) || Node.isJsxSelfClosingElement(node)) {
      const tagName = node.getTagNameNode();
      if (Node.isIdentifier(tagName) && tagName.getText() === componentName) {
        applyJsxRewrite(node, htmlTag, classString);
        count++;
      }
    } else if (Node.isJsxClosingElement(node)) {
      const tagName = node.getTagNameNode();
      if (Node.isIdentifier(tagName) && tagName.getText() === componentName) {
        tagName.replaceWithText(htmlTag);
      }
    }
  });
  return count;
}

function applyJsxRewrite(
  node: JsxOpeningElement | JsxSelfClosingElement,
  htmlTag: string,
  classString: string
) {
  const tagName = node.getTagNameNode() as Identifier;
  tagName.replaceWithText(htmlTag);

  // Look for an existing className prop and merge
  const existingClassName = node
    .getAttributes()
    .find(
      (a) => Node.isJsxAttribute(a) && a.getNameNode().getText() === 'className'
    );

  if (existingClassName && Node.isJsxAttribute(existingClassName)) {
    const init = existingClassName.getInitializer();
    if (init && Node.isStringLiteral(init)) {
      const merged = `${classString} ${init.getLiteralText()}`.trim();
      init.replaceWithText(`"${merged}"`);
      return;
    }
    // For expression-form className, append our static classes inside a clsx-like join.
    if (init && Node.isJsxExpression(init)) {
      const expr = init.getExpression();
      if (expr) {
        init.replaceWithText(
          `{["${classString}", ${expr.getText()}].filter(Boolean).join(' ')}`
        );
      }
      return;
    }
  }

  // No existing className — insert one.
  node.addAttribute({ name: 'className', initializer: `"${classString}"` });
}

function dedupeClasses(classes: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of classes) {
    if (!seen.has(c)) {
      seen.add(c);
      out.push(c);
    }
  }
  return out;
}

async function migrateFile(
  project: Project,
  filePath: string
): Promise<ComponentRecord[]> {
  const sourceFile = project.addSourceFileAtPath(filePath);
  const records: ComponentRecord[] = [];
  const declsToRemove: VariableDeclaration[] = [];

  // Find every variable declaration whose initializer is a styled.<tag>`...`
  for (const stmt of sourceFile.getVariableStatements()) {
    for (const decl of stmt.getDeclarations()) {
      const styled = extractStyledTag(decl);
      if (!styled) continue;
      const compName = decl.getName();
      const template = styled.tagged.getTemplate();

      // Reject if it's a TemplateExpression with ${...} parts; ts-morph gives
      // a NoSubstitutionTemplateLiteral when there are no substitutions.
      if (Node.isTemplateExpression(template)) {
        records.push({
          file: filePath,
          name: compName,
          status: 'skipped',
          reason: 'has ${} interpolations'
        });
        continue;
      }
      const raw = template.getLiteralText();
      const parsed = parseStyledBody(raw);
      const result = ruleSetToClasses(parsed.rules);
      if (!result.ok) {
        records.push({
          file: filePath,
          name: compName,
          status: 'skipped',
          reason: result.reason
        });
        continue;
      }

      const classes = dedupeClasses(result.classes);
      const usages = rewriteJsxUsages(
        sourceFile,
        compName,
        styled.htmlTag,
        classes
      );

      records.push({
        file: filePath,
        name: compName,
        status: 'migrated',
        htmlTag: styled.htmlTag,
        classes
      });

      // Mark the declaration for removal *after* the loop so we don't disturb
      // iteration order.
      void usages;
      declsToRemove.push(decl);
    }
  }

  for (const decl of declsToRemove) {
    const stmt = decl.getVariableStatement();
    if (stmt && stmt.getDeclarations().length === 1) stmt.remove();
    else decl.remove();
  }

  // If we migrated any, also try to clean up the styled-components import.
  if (records.some((r) => r.status === 'migrated')) {
    cleanupStyledImportIfUnused(sourceFile);
  }

  return records;
}

function cleanupStyledImportIfUnused(sourceFile: SourceFile) {
  const stillUsed =
    sourceFile
      .getDescendantsOfKind(SyntaxKind.PropertyAccessExpression)
      .some(
        (pa) =>
          Node.isIdentifier(pa.getExpression()) &&
          pa.getExpression().getText() === 'styled'
      ) ||
    sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).some((call) => {
      const expr = call.getExpression();
      return Node.isIdentifier(expr) && expr.getText() === 'styled';
    });
  if (stillUsed) return;

  for (const imp of sourceFile.getImportDeclarations()) {
    if (imp.getModuleSpecifierValue() !== 'styled-components') continue;
    const def = imp.getDefaultImport();
    if (def && def.getText() === 'styled') {
      // Has named imports left? Remove default only.
      const named = imp.getNamedImports();
      if (named.length > 0) {
        imp.removeDefaultImport();
      } else {
        imp.remove();
      }
    } else {
      imp.remove();
    }
  }
}

async function main() {
  const args = parseArgs();
  await ensureConfigLoaded();

  const files = await gatherFiles(args.target);
  console.log(`[codemod] target=${args.target} files=${files.length}`);

  const project = new Project({
    tsConfigFilePath: path.resolve(process.cwd(), 'tsconfig.json'),
    skipAddingFilesFromTsConfig: true
  });

  const allRecords: ComponentRecord[] = [];
  for (const file of files) {
    try {
      const records = await migrateFile(project, file);
      allRecords.push(...records);
    } catch (err) {
      console.error(`[codemod] failed on ${file}:`, err);
    }
  }

  if (args.write) {
    await project.save();
    console.log('[codemod] changes written');
  } else {
    console.log('[codemod] DRY RUN — pass --write to apply');
  }

  // Report
  const migrated = allRecords.filter((r) => r.status === 'migrated');
  const skipped = allRecords.filter((r) => r.status === 'skipped');
  console.log(
    `\n[codemod] migrated=${migrated.length} skipped=${skipped.length}`
  );
  if (skipped.length > 0) {
    console.log('\nskipped (need human review):');
    for (const r of skipped) {
      console.log(
        `  - ${path.relative(process.cwd(), r.file)} :: ${r.name} — ${r.reason}`
      );
    }
  }

  const reportFile = path.resolve(
    process.cwd(),
    'scripts/migrate-styles/last-run.json'
  );
  await fs.writeFile(
    reportFile,
    JSON.stringify(
      { target: args.target, write: args.write, records: allRecords },
      null,
      2
    )
  );
  console.log(
    `\n[codemod] report → ${path.relative(process.cwd(), reportFile)}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
