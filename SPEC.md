# LIFX Theme Picker — v0.1.0 Spec

## Purpose

A Lovelace custom card that lets the user browse the 42 built-in LIFX themes
and apply a chosen theme to a `light.*` entity or an area via the
`lifx.paint_theme` service.

## UX

### Layout

Two-pane on wide cards, stacked on narrow ones.

- **List pane** (left / top, ~36% width or full width below 520 px):
  scrollable vertical list of 42 themes, sorted alphabetically. Each row is
  ~50 px tall and contains a 40×40 px mesh-gradient swatch plus the theme
  name (rendered with underscores → spaces, capitalised in CSS).
- **Preview pane** (right / bottom): large box rendering the selected theme
  as an OkLCh mesh gradient. Overlaid with the theme name (top-left) and a
  small meta line (bottom: "<N> colors" plus a hint).

### Interaction

- **Single tap** on a list row both selects the theme and immediately calls
  `lifx.paint_theme`. There is **no separate Apply button** — selection is
  the action. This is documented in the preview overlay ("tap a theme to
  apply").
- Selected row is highlighted via `--primary-color`.
- While the service call is in flight, a small "applying…" status appears in
  the header.
- Service-call errors surface in a status strip beneath the body.

### Accessibility

- The list is `role="listbox"` and rows are `role="option"` with
  `aria-selected`.
- Rows are keyboard-focusable (`tabindex="0"`). Enter/Space selects;
  ArrowUp/ArrowDown move focus.
- Color is never the only signal — the selected row also has a background
  highlight, and the preview pane shows the name large.

### Responsive

Single breakpoint at **520 px** card width: below this, the layout collapses
to a single column with the list above the preview. List height caps to keep
the preview visible.

## Config schema

```ts
interface LifxThemePickerConfig {
  type: string;              // "custom:lifx-theme-picker"
  entity?: string;           // light.* — optional if area_id is set
  area_id?: string;          // area — optional if entity is set
  transition?: number;       // seconds, default 2
  power_on?: boolean;        // default true
  default_theme?: string;    // preselect on load (silently ignored if unknown)
  name?: string;             // overrides card title
}
```

Validation in `setConfig`:

- Throws if neither `entity` nor `area_id` is set.
- Throws if `entity` is not in the `light.` domain.
- Throws if `transition` is negative.
- Logs (does not throw) if `default_theme` is unknown.

## Service call

```js
hass.callService(
  'lifx',
  'paint_theme',
  { theme, transition, power_on },
  { entity_id: <if set>, area_id: <if set> },
);
```

Both target keys are passed when both are configured; HA's service layer
unions them.

## Mesh-gradient algorithm

Implemented in `src/mesh-preview.ts`. Pure-black stops are filtered out
before stacking (the `tranquil` palette has one) to avoid the radials being
sucked into a dark hole. If the palette is _only_ black, we keep it.

Let `N = colors.length` after filtering:

- `N = 1`: solid `background-color: oklch(...)`.
- `N = 2`: `linear-gradient(135deg in oklch, c0, c1)`.
- `N = 3`: three `radial-gradient(circle at <pos> in oklch, color 0%,
  transparent 60%)`s positioned at `(50%, 0%)`, `(0%, 100%)`, `(100%,
  100%)`. Stacked with `background-image` comma list, on top of
  `background-color = colors[0]`.
- `N = 4`: four radials at the four corners (TL, TR, BR, BL).
- `N ≥ 5`: distribute around the perimeter. For each `i ∈ [0, N)`, take
  `θ = 2π·i/N - π/2` (start at top), compute `(cos θ, sin θ)`, project onto
  the unit-square edge via `max(|cx|, |cy|)`, scale into `0..100%`.

Radials use `circle at <pos> in oklch, color 0%, transparent 60%`. Default
`background-blend-mode: normal`. We considered `screen` / `lighten` but
normal looked closer to what LIFX strips actually do (cross-fade between
zones, not lighten).

### Browser support

`radial-gradient(... in oklch, ...)` requires Chromium 111+ or Safari
16.4+. On older browsers the engine ignores the `in oklch` keyword and
falls back to sRGB interpolation. The card still renders; it just looks
slightly less perceptually even. We don't sniff/feature-detect — graceful
degradation is enough for v0.1.0.

## Editor

`ha-form`-based editor with the schema above:

| Field           | Selector                                |
| --------------- | --------------------------------------- |
| `entity`        | `entity` filtered to `light` domain     |
| `area_id`       | `area`                                  |
| `name`          | `text`                                  |
| `default_theme` | `select` dropdown of the 42 theme names |
| `transition`    | `number` 0..60 step 0.5                 |
| `power_on`      | `boolean`                               |

A helper line beneath reminds the user to set at least one of entity/area.

## Behaviour matrix

| Event                             | Effect                                                           |
| --------------------------------- | ---------------------------------------------------------------- |
| Card mounted with `default_theme` | Theme preselected; service is **not** auto-called                |
| User taps a row                   | Selection updates; `lifx.paint_theme` called immediately         |
| Service call rejects              | Error message shown in status strip                              |
| User reconfigures while in flight | Old call continues; UI reflects new config on next render        |
| Light/area unavailable            | Service call returns an error; surfaced verbatim in status strip |

## Out of scope for v0.1.0

- Live preview animation (mesh stays static).
- Per-theme custom colors / theme editor.
- Reading current applied theme back from HA (no state attribute exists).
- Gamut warnings for very saturated palettes.
- Tests — none added; manual smoke test in `verify` is enough for a first
  release.
- Internationalisation of theme names.
