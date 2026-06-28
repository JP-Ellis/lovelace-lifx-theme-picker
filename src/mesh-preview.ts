// <lifx-mesh-preview>
//
// Renders a list of theme colors as a stack of radial gradients arranged in a
// mesh, interpolated in OkLCh where the browser supports it. Falls back to
// sRGB interpolation on Chromium <111 / Safari <16.4 — visually similar
// enough for a preview.
//
// Algorithm (per the spec):
//   1 color  → solid background
//   2 colors → linear-gradient(135deg in oklch, c1, c2)
//   3 colors → radials at top-centre, bottom-left, bottom-right
//   4 colors → radials at the four corners
//   N ≥ 5   → radials around the perimeter at 360°/N intervals
//
// Each radial fades to transparent at ~60% so the stack blends. Pure-black
// stops are filtered out (the `tranquil` palette has one) to avoid the
// stack getting sucked into a single dark sink-hole; if the *only* color in
// the palette is black we still render it.

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { hexToOklchCss, isNearBlack } from "./color.js";

interface RadialStop {
  position: string; // e.g. "top left", "50% 100%"
  color: string; // CSS oklch(...) string
}

@customElement("lifx-mesh-preview")
export class LifxMeshPreview extends LitElement {
  @property({ attribute: false }) colors: readonly string[] = [];

  static styles = css`
    :host {
      display: block;
      width: 100%;
      height: 100%;
      min-height: 32px;
      border-radius: inherit;
    }
    .surface {
      width: 100%;
      height: 100%;
      border-radius: inherit;
      background-color: var(--card-background-color, #1f1f1f);
      background-blend-mode: normal;
    }
  `;

  protected render() {
    const style = this._backgroundStyle(this.colors);
    return html`<div class="surface" style=${style} part="surface"></div>`;
  }

  private _backgroundStyle(rawColors: readonly string[]): string {
    if (!rawColors || rawColors.length === 0) {
      return "";
    }
    // Filter pure-black stops, but keep at least one color so we render
    // something.
    let colors = rawColors.filter((c) => !isNearBlack(c));
    if (colors.length === 0) {
      colors = [rawColors[0]];
    }

    const oklchColors = colors.map((c) => hexToOklchCss(c));

    if (oklchColors.length === 1) {
      return `background-color:${oklchColors[0]};`;
    }

    if (oklchColors.length === 2) {
      return (
        "background-image:linear-gradient(135deg in oklch, " +
        `${oklchColors[0]}, ${oklchColors[1]});`
      );
    }

    const stops = LifxMeshPreview._stopsFor(oklchColors);
    const layers = stops
      .map(
        (s) =>
          `radial-gradient(circle at ${s.position} in oklch, ` +
          `${s.color} 0%, transparent 60%)`,
      )
      .join(",");
    // Pick a base color from the first stop so the corners aren't blank when
    // the radials fall off. Saturate it a touch by using the first color.
    return `background-color:${oklchColors[0]};background-image:${layers};`;
  }

  private static _stopsFor(colors: readonly string[]): RadialStop[] {
    const n = colors.length;
    if (n === 3) {
      return [
        { position: "50% 0%", color: colors[0] },
        { position: "0% 100%", color: colors[1] },
        { position: "100% 100%", color: colors[2] },
      ];
    }
    if (n === 4) {
      return [
        { position: "0% 0%", color: colors[0] },
        { position: "100% 0%", color: colors[1] },
        { position: "100% 100%", color: colors[2] },
        { position: "0% 100%", color: colors[3] },
      ];
    }
    // N ≥ 5: distribute around the perimeter. Use an ellipse-on-box mapping
    // so each angle lands on the edge of a unit square centred at (50%,50%).
    const out: RadialStop[] = [];
    for (let i = 0; i < n; i += 1) {
      const theta = (2 * Math.PI * i) / n - Math.PI / 2; // start at top
      const cx = Math.cos(theta);
      const cy = Math.sin(theta);
      // Project (cx,cy) onto the unit square edge.
      const m = Math.max(Math.abs(cx), Math.abs(cy)) || 1;
      const px = 50 + (cx / m) * 50;
      const py = 50 + (cy / m) * 50;
      out.push({
        position: `${px.toFixed(2)}% ${py.toFixed(2)}%`,
        color: colors[i],
      });
    }
    return out;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lifx-mesh-preview": LifxMeshPreview;
  }
}
