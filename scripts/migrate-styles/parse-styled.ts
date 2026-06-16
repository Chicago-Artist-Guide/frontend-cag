/**
 * Parses the body of a styled-components tagged template literal into a
 * sequence of CSS declarations and pseudo/descendant blocks.
 *
 * We deliberately use a small, hand-rolled parser instead of postcss because:
 *   1. styled-component bodies often have ${...} interpolations that aren't
 *      valid CSS, and we need to detect them so the codemod can mark TODO.
 *   2. We don't need to preserve formatting or comments.
 *
 * Limitations:
 *   - Nested rules deeper than one level are flagged as DYNAMIC.
 *   - @media queries beyond simple min/max-width breakpoints are flagged.
 */

export type ParsedRule =
  | {
      kind: 'declaration';
      prop: string;
      value: string;
      hasInterpolation: boolean;
    }
  | {
      kind: 'pseudo';
      selector: string; // e.g. &:hover, &::before
      declarations: Array<{
        prop: string;
        value: string;
        hasInterpolation: boolean;
      }>;
    }
  | { kind: 'descendant'; selector: string; raw: string }
  | { kind: 'media'; query: string; raw: string }
  | { kind: 'unknown'; raw: string };

export type ParseResult = {
  rules: ParsedRule[];
  topLevelInterpolations: number; // ${...} not inside any property value
};

// Distinctive sentinel that can't appear in real CSS, so the parser can tell
// "this declaration value contains an interpolation" apart from values that
// happen to contain digits (e.g. margin: 0).
const SENTINEL_PREFIX = '__VR_INTERP_';
const SENTINEL_SUFFIX = '__';
const SENTINEL_RE = new RegExp(
  `${SENTINEL_PREFIX}(\\d+)${SENTINEL_SUFFIX}`,
  'g'
);
const SENTINEL_TEST = new RegExp(`${SENTINEL_PREFIX}\\d+${SENTINEL_SUFFIX}`);

function maskInterpolations(raw: string): {
  masked: string;
  interps: string[];
} {
  const interps: string[] = [];
  // Match ${...} including nested braces one level deep.
  const masked = raw.replace(/\$\{([^{}]|\{[^{}]*\})*\}/g, (m) => {
    interps.push(m);
    return `${SENTINEL_PREFIX}${interps.length - 1}${SENTINEL_SUFFIX}`;
  });
  return { masked, interps };
}

function restoreInterpolations(s: string, interps: string[]): string {
  return s.replace(SENTINEL_RE, (_m, n) => interps[Number(n)] ?? '');
}

function hasInterp(s: string): boolean {
  return SENTINEL_TEST.test(s);
}

export function parseStyledBody(raw: string): ParseResult {
  const { masked, interps } = maskInterpolations(raw);

  const rules: ParsedRule[] = [];
  let topLevelInterpolations = 0;

  let i = 0;
  while (i < masked.length) {
    while (i < masked.length && /\s/.test(masked[i])) i++;
    if (i >= masked.length) break;

    const semi = masked.indexOf(';', i);
    const brace = masked.indexOf('{', i);

    if (brace !== -1 && (semi === -1 || brace < semi)) {
      const selector = masked.slice(i, brace).trim();
      const close = matchClose(masked, brace);
      if (close === -1) {
        rules.push({
          kind: 'unknown',
          raw: restoreInterpolations(masked.slice(i), interps)
        });
        break;
      }
      const body = masked.slice(brace + 1, close);
      const restoredSelector = restoreInterpolations(selector, interps);

      if (/^&:{1,2}[a-zA-Z-]+/.test(selector)) {
        const inner = parseStyledBody(restoreInterpolations(body, interps));
        const decls = inner.rules
          .filter(
            (r): r is Extract<ParsedRule, { kind: 'declaration' }> =>
              r.kind === 'declaration'
          )
          .map(({ prop, value, hasInterpolation }) => ({
            prop,
            value,
            hasInterpolation
          }));
        rules.push({
          kind: 'pseudo',
          selector: restoredSelector,
          declarations: decls
        });
      } else if (/^@media/.test(selector)) {
        rules.push({
          kind: 'media',
          query: restoredSelector,
          raw: restoreInterpolations(body, interps)
        });
      } else {
        rules.push({
          kind: 'descendant',
          selector: restoredSelector,
          raw: restoreInterpolations(body, interps)
        });
      }
      i = close + 1;
      continue;
    }

    if (semi !== -1) {
      const declRaw = masked.slice(i, semi);
      const result = parseDeclaration(declRaw, interps);
      if (result) {
        rules.push(result);
      } else if (hasInterp(declRaw.trim())) {
        topLevelInterpolations++;
      }
      i = semi + 1;
      continue;
    }

    const tail = masked.slice(i).trim();
    if (tail) {
      if (hasInterp(tail) && !tail.includes(':')) {
        topLevelInterpolations++;
      } else {
        rules.push({
          kind: 'unknown',
          raw: restoreInterpolations(tail, interps)
        });
      }
    }
    break;
  }

  return { rules, topLevelInterpolations };
}

function matchClose(s: string, openIdx: number): number {
  let depth = 1;
  for (let j = openIdx + 1; j < s.length; j++) {
    if (s[j] === '{') depth++;
    else if (s[j] === '}') {
      depth--;
      if (depth === 0) return j;
    }
  }
  return -1;
}

function parseDeclaration(
  raw: string,
  interps: string[]
): Extract<ParsedRule, { kind: 'declaration' }> | null {
  const colon = raw.indexOf(':');
  if (colon === -1) return null;
  const prop = raw.slice(0, colon).trim();
  const value = raw.slice(colon + 1).trim();
  if (!prop || !value) return null;
  const hasInterpolation = hasInterp(value);
  return {
    kind: 'declaration',
    prop,
    value: hasInterpolation ? restoreInterpolations(value, interps) : value,
    hasInterpolation
  };
}
