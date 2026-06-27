// OkLCh helpers used by the mesh-gradient renderer and the list swatches.
//
// We keep these thin — culori does the heavy lifting — but we centralise the
// hex→oklch parsing so callers don't repeat themselves and so we can swap
// implementations later (gamut mapping etc.) in one place.

import { converter, parse, type Color } from 'culori';

const toOklch = converter('oklch');

export interface OklchTriple {
  l: number;
  c: number;
  h: number;
}

/** Parse a "#rrggbb" or named CSS color into OkLCh coordinates. */
export function hexToOklch(hex: string): OklchTriple | undefined {
  const parsed: Color | undefined = parse(hex);
  if (!parsed) return undefined;
  const lch = toOklch(parsed);
  if (!lch) return undefined;
  return {
    l: typeof lch.l === 'number' ? lch.l : 0,
    c: typeof lch.c === 'number' ? lch.c : 0,
    h: typeof lch.h === 'number' ? lch.h : 0,
  };
}

/** Render a hex color as a CSS `oklch(...)` string. */
export function hexToOklchCss(hex: string): string {
  const lch = hexToOklch(hex);
  if (!lch) return hex; // graceful fallback
  // Use percent for lightness because some browsers prefer it; numeric forms
  // are equivalent per spec.
  const l = (lch.l * 100).toFixed(2);
  const c = lch.c.toFixed(4);
  const h = lch.h.toFixed(2);
  return `oklch(${l}% ${c} ${h})`;
}

/** Is this color "essentially black"? Useful for filtering sink-holes. */
export function isNearBlack(hex: string, threshold = 0.04): boolean {
  const lch = hexToOklch(hex);
  if (!lch) return false;
  return lch.l <= threshold;
}
