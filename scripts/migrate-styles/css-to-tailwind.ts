/**
 * Maps a single CSS declaration (property + value) to one or more Tailwind
 * class names. Returns null when the declaration cannot be confidently mapped;
 * the codemod surfaces those as TODO comments instead of guessing.
 *
 * The mapper is config-aware: it loads tailwind.config.js once and uses the
 * project's custom colors so `color: #82B29A` maps to `text-primary`/`text-mint`.
 *
 * Scope: this is a *first pass*. It covers the high-frequency properties seen
 * in the codebase. Unknown properties fall through to null so the codemod
 * marks them and a human reviews. Add new mappings as patterns emerge.
 */

import path from 'node:path';
import { pathToFileURL } from 'node:url';

type TailwindConfig = {
  theme?: {
    extend?: {
      colors?: Record<string, string>;
      fontSize?: Record<string, string | [string, string | object]>;
    };
  };
};

let CONFIG: TailwindConfig | null = null;
let COLOR_LOOKUP: Map<string, string> | null = null;

async function loadConfig(): Promise<void> {
  if (CONFIG) return;
  const configPath = path.resolve(process.cwd(), 'tailwind.config.js');
  const mod = await import(pathToFileURL(configPath).href);
  CONFIG = (mod.default ?? mod) as TailwindConfig;
  COLOR_LOOKUP = new Map();
  const colors = CONFIG.theme?.extend?.colors ?? {};
  for (const [name, value] of Object.entries(colors)) {
    COLOR_LOOKUP.set(normalizeColor(value), name);
  }
}

function normalizeColor(v: string): string {
  return v.toLowerCase().replace(/\s+/g, '');
}

function tailwindColor(value: string): string | null {
  const norm = normalizeColor(value);
  // Direct hit on a named color in config.
  const hit = COLOR_LOOKUP?.get(norm);
  if (hit) return hit;
  // Hex passthrough as arbitrary value.
  if (/^#[0-9a-f]{3,8}$/i.test(value.trim())) {
    return `[${value.trim()}]`;
  }
  // rgb/rgba arbitrary value (Tailwind requires underscores instead of spaces).
  if (/^rgba?\(/i.test(value.trim())) {
    return `[${value.trim().replace(/\s+/g, '_')}]`;
  }
  // Common bare keywords
  if (['white', 'black', 'transparent', 'currentcolor'].includes(norm)) {
    return norm === 'currentcolor' ? 'current' : norm;
  }
  return null;
}

const SPACING_REM: Record<string, string> = {
  '0': '0',
  '0.125rem': '0.5',
  '0.25rem': '1',
  '0.375rem': '1.5',
  '0.5rem': '2',
  '0.625rem': '2.5',
  '0.75rem': '3',
  '0.875rem': '3.5',
  '1rem': '4',
  '1.25rem': '5',
  '1.5rem': '6',
  '1.75rem': '7',
  '2rem': '8',
  '2.25rem': '9',
  '2.5rem': '10',
  '2.75rem': '11',
  '3rem': '12',
  '3.5rem': '14',
  '4rem': '16',
  '5rem': '20',
  '6rem': '24',
  '8rem': '32'
};
const SPACING_PX: Record<string, string> = {
  '0': '0',
  '1px': 'px',
  '2px': '0.5',
  '4px': '1',
  '6px': '1.5',
  '8px': '2',
  '10px': '2.5',
  '12px': '3',
  '14px': '3.5',
  '16px': '4',
  '20px': '5',
  '24px': '6',
  '28px': '7',
  '32px': '8',
  '36px': '9',
  '40px': '10',
  '44px': '11',
  '48px': '12',
  '56px': '14',
  '64px': '16',
  '80px': '20',
  '96px': '24',
  '128px': '32'
};

function spacingScale(value: string): string | null {
  const v = value.trim().toLowerCase();
  if (SPACING_REM[v]) return SPACING_REM[v];
  if (SPACING_PX[v]) return SPACING_PX[v];
  // Allow arbitrary `[13px]` style for unmapped values.
  if (/^-?\d+(?:\.\d+)?(px|rem|em|%|vw|vh)$/.test(v)) return `[${v}]`;
  return null;
}

const FONT_WEIGHT: Record<string, string> = {
  '100': 'thin',
  '200': 'extralight',
  '300': 'light',
  '400': 'normal',
  '500': 'medium',
  '600': 'semibold',
  '700': 'bold',
  '800': 'extrabold',
  '900': 'black',
  normal: 'normal',
  bold: 'bold'
};

const TEXT_ALIGN: Record<string, string> = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
  justify: 'text-justify'
};

const DISPLAY: Record<string, string> = {
  block: 'block',
  'inline-block': 'inline-block',
  inline: 'inline',
  flex: 'flex',
  'inline-flex': 'inline-flex',
  grid: 'grid',
  'inline-grid': 'inline-grid',
  none: 'hidden',
  contents: 'contents',
  table: 'table'
};

const FLEX_DIRECTION: Record<string, string> = {
  row: 'flex-row',
  'row-reverse': 'flex-row-reverse',
  column: 'flex-col',
  'column-reverse': 'flex-col-reverse'
};

const JUSTIFY_CONTENT: Record<string, string> = {
  'flex-start': 'justify-start',
  'flex-end': 'justify-end',
  center: 'justify-center',
  'space-between': 'justify-between',
  'space-around': 'justify-around',
  'space-evenly': 'justify-evenly',
  start: 'justify-start',
  end: 'justify-end'
};

const ALIGN_ITEMS: Record<string, string> = {
  'flex-start': 'items-start',
  'flex-end': 'items-end',
  center: 'items-center',
  baseline: 'items-baseline',
  stretch: 'items-stretch',
  start: 'items-start',
  end: 'items-end'
};

const POSITION = new Set(['static', 'relative', 'absolute', 'fixed', 'sticky']);

const BORDER_STYLE: Record<string, string> = {
  solid: 'border-solid',
  dashed: 'border-dashed',
  dotted: 'border-dotted',
  double: 'border-double',
  none: 'border-none'
};

export type MapResult = {
  classes: string[];
  unmapped?: Array<{ prop: string; value: string }>;
};

/**
 * Map a CSS property/value to one or more Tailwind classes.
 * Returns null if it cannot be mapped (caller should mark TODO).
 */
export function mapDeclaration(prop: string, value: string): string[] | null {
  const p = prop.toLowerCase().trim();
  const v = value.trim();

  switch (p) {
    case 'color': {
      const c = tailwindColor(v);
      return c ? [`text-${c}`] : null;
    }
    case 'background-color':
    case 'background': {
      // Only handle plain colors here; gradients/images return null
      if (/url\(|gradient/i.test(v)) return null;
      const c = tailwindColor(v);
      return c ? [`bg-${c}`] : null;
    }
    case 'border-color': {
      const c = tailwindColor(v);
      return c ? [`border-${c}`] : null;
    }

    case 'display': {
      return DISPLAY[v] ? [DISPLAY[v]] : null;
    }
    case 'flex-direction': {
      return FLEX_DIRECTION[v] ? [FLEX_DIRECTION[v]] : null;
    }
    case 'justify-content': {
      return JUSTIFY_CONTENT[v] ? [JUSTIFY_CONTENT[v]] : null;
    }
    case 'align-items': {
      return ALIGN_ITEMS[v] ? [ALIGN_ITEMS[v]] : null;
    }
    case 'flex-wrap': {
      if (v === 'wrap') return ['flex-wrap'];
      if (v === 'nowrap') return ['flex-nowrap'];
      if (v === 'wrap-reverse') return ['flex-wrap-reverse'];
      return null;
    }
    case 'gap': {
      const s = spacingScale(v);
      return s ? [`gap-${s}`] : null;
    }
    case 'row-gap': {
      const s = spacingScale(v);
      return s ? [`gap-y-${s}`] : null;
    }
    case 'column-gap': {
      const s = spacingScale(v);
      return s ? [`gap-x-${s}`] : null;
    }

    case 'position': {
      return POSITION.has(v) ? [v] : null;
    }
    case 'top':
    case 'right':
    case 'bottom':
    case 'left': {
      const s = spacingScale(v);
      return s ? [`${p}-${s}`] : null;
    }
    case 'z-index': {
      if (/^-?\d+$/.test(v)) {
        const n = Number(v);
        if (n < 0) return [`-z-${Math.abs(n)}`];
        return [`z-${n}`];
      }
      return null;
    }

    case 'margin':
      return splitBoxShorthand('m', v);
    case 'margin-top':
      return mapBox('mt', v);
    case 'margin-right':
      return mapBox('mr', v);
    case 'margin-bottom':
      return mapBox('mb', v);
    case 'margin-left':
      return mapBox('ml', v);

    case 'padding':
      return splitBoxShorthand('p', v);
    case 'padding-top':
      return mapBox('pt', v);
    case 'padding-right':
      return mapBox('pr', v);
    case 'padding-bottom':
      return mapBox('pb', v);
    case 'padding-left':
      return mapBox('pl', v);

    case 'width': {
      const s = spacingScale(v);
      if (s) return [`w-${s}`];
      if (v === '100%') return ['w-full'];
      if (v === 'auto') return ['w-auto'];
      if (/^\d+(?:\.\d+)?%$/.test(v)) return [`w-[${v}]`];
      return null;
    }
    case 'height': {
      const s = spacingScale(v);
      if (s) return [`h-${s}`];
      if (v === '100%') return ['h-full'];
      if (v === '100vh') return ['h-screen'];
      if (v === 'auto') return ['h-auto'];
      if (/^\d+(?:\.\d+)?%$/.test(v)) return [`h-[${v}]`];
      return null;
    }
    case 'max-width': {
      if (v === '100%') return ['max-w-full'];
      if (v === 'none') return ['max-w-none'];
      const s = spacingScale(v);
      if (s) return [`max-w-${s}`];
      return null;
    }

    case 'font-size': {
      const s = spacingScale(v);
      return s ? [`text-[${v}]`] : null;
    }
    case 'font-weight': {
      const w = FONT_WEIGHT[v];
      return w ? [`font-${w}`] : null;
    }
    case 'text-align': {
      return TEXT_ALIGN[v] ? [TEXT_ALIGN[v]] : null;
    }
    case 'line-height': {
      if (/^\d+(?:\.\d+)?$/.test(v)) return [`leading-[${v}]`];
      return null;
    }
    case 'text-transform': {
      if (v === 'uppercase') return ['uppercase'];
      if (v === 'lowercase') return ['lowercase'];
      if (v === 'capitalize') return ['capitalize'];
      if (v === 'none') return ['normal-case'];
      return null;
    }
    case 'text-decoration': {
      if (v === 'underline') return ['underline'];
      if (v === 'line-through') return ['line-through'];
      if (v === 'none') return ['no-underline'];
      return null;
    }
    case 'font-style': {
      if (v === 'italic') return ['italic'];
      if (v === 'normal') return ['not-italic'];
      return null;
    }

    case 'border-radius': {
      const s = spacingScale(v);
      if (v === '50%' || v === '9999px') return ['rounded-full'];
      if (v === '0') return ['rounded-none'];
      return s ? [`rounded-${s}`] : null;
    }
    case 'border-style': {
      return BORDER_STYLE[v] ? [BORDER_STYLE[v]] : null;
    }
    case 'border-width': {
      if (v === '0') return ['border-0'];
      if (v === '1px') return ['border'];
      if (v === '2px') return ['border-2'];
      if (v === '4px') return ['border-4'];
      if (v === '8px') return ['border-8'];
      return null;
    }
    case 'border': {
      // Split shorthand: 1px solid #abc
      return splitBorderShorthand(v);
    }

    case 'overflow':
      if (['auto', 'hidden', 'visible', 'scroll'].includes(v))
        return [`overflow-${v}`];
      return null;
    case 'overflow-x':
    case 'overflow-y':
      if (['auto', 'hidden', 'visible', 'scroll'].includes(v))
        return [`${p === 'overflow-x' ? 'overflow-x' : 'overflow-y'}-${v}`];
      return null;

    case 'cursor':
      return [`cursor-${v}`];
    case 'opacity': {
      if (/^\d?\.\d+$/.test(v) || /^\d+$/.test(v)) {
        const n = Number(v);
        const pct = Math.round(n * 100);
        return [`opacity-${pct}`];
      }
      return null;
    }
    case 'visibility':
      if (v === 'visible') return ['visible'];
      if (v === 'hidden') return ['invisible'];
      return null;

    default:
      return null;
  }
}

function mapBox(prefix: string, value: string): string[] | null {
  const s = spacingScale(value);
  return s ? [`${prefix}-${s}`] : null;
}

function splitBoxShorthand(prefix: string, value: string): string[] | null {
  const parts = value.trim().split(/\s+/);
  if (parts.length === 1) {
    return mapBox(prefix, parts[0]);
  }
  if (parts.length === 2) {
    const y = mapBox(`${prefix}y`, parts[0]);
    const x = mapBox(`${prefix}x`, parts[1]);
    if (y && x) return [...y, ...x];
    return null;
  }
  if (parts.length === 4) {
    const t = mapBox(`${prefix}t`, parts[0]);
    const r = mapBox(`${prefix}r`, parts[1]);
    const b = mapBox(`${prefix}b`, parts[2]);
    const l = mapBox(`${prefix}l`, parts[3]);
    if (t && r && b && l) return [...t, ...r, ...b, ...l];
    return null;
  }
  if (parts.length === 3) {
    const t = mapBox(`${prefix}t`, parts[0]);
    const x = mapBox(`${prefix}x`, parts[1]);
    const b = mapBox(`${prefix}b`, parts[2]);
    if (t && x && b) return [...t, ...x, ...b];
    return null;
  }
  return null;
}

function splitBorderShorthand(value: string): string[] | null {
  // Very rough: "1px solid #abc" → border + border-solid + border-[#abc]
  const parts = value.trim().split(/\s+/);
  const out: string[] = [];
  let widthDone = false;
  let styleDone = false;
  let colorDone = false;
  for (const p of parts) {
    if (!widthDone && /^\d+px$/.test(p)) {
      const w = mapDeclaration('border-width', p);
      if (!w) return null;
      out.push(...w);
      widthDone = true;
      continue;
    }
    if (!styleDone && BORDER_STYLE[p]) {
      out.push(BORDER_STYLE[p]);
      styleDone = true;
      continue;
    }
    if (!colorDone) {
      const c = tailwindColor(p);
      if (c) {
        out.push(`border-${c}`);
        colorDone = true;
        continue;
      }
    }
    return null;
  }
  return out.length > 0 ? out : null;
}

export async function ensureConfigLoaded() {
  await loadConfig();
}
