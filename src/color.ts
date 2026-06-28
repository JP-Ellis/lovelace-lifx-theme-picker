// OkLCh helpers used by the mesh-gradient renderer and the list swatches.
//
// We keep these thin — culori does the heavy lifting — but we centralise the
// hex→oklch parsing so callers don't repeat themselves and so we can swap
// implementations later (gamut mapping etc.) in one place.

import { type Color, converter, parse } from "culori";

const toOklch = converter("oklch");

// CSS `oklch()` formatting: lightness is written as a percentage, and each
// channel is rounded to a fixed number of fractional digits.
const LIGHTNESS_PERCENT = 100;
const LIGHTNESS_DIGITS = 2;
const CHROMA_DIGITS = 4;
const HUE_DIGITS = 2;

export interface OklchTriple {
  l: number;
  c: number;
  h: number;
}

/** Parse a "#rrggbb" or named CSS color into OkLCh coordinates. */
export function hexToOklch(hex: string): OklchTriple | undefined {
  const parsed: Color | undefined = parse(hex);
  if (!parsed) {
    return;
  }
  const lch = toOklch(parsed);
  if (!lch) {
    return;
  }
  return {
    l: typeof lch.l === "number" ? lch.l : 0,
    c: typeof lch.c === "number" ? lch.c : 0,
    h: typeof lch.h === "number" ? lch.h : 0,
  };
}

/** Render a hex color as a CSS `oklch(...)` string. */
export function hexToOklchCss(hex: string): string {
  const lch = hexToOklch(hex);
  if (!lch) {
    return hex; // graceful fallback
  }
  // Use percent for lightness because some browsers prefer it; numeric forms
  // are equivalent per spec.
  const l = (lch.l * LIGHTNESS_PERCENT).toFixed(LIGHTNESS_DIGITS);
  const c = lch.c.toFixed(CHROMA_DIGITS);
  const h = lch.h.toFixed(HUE_DIGITS);
  return `oklch(${l}% ${c} ${h})`;
}

/** Is this color "essentially black"? Useful for filtering sink-holes. */
export function isNearBlack(hex: string, threshold = 0.04): boolean {
  const lch = hexToOklch(hex);
  if (!lch) {
    return false;
  }
  return lch.l <= threshold;
}
