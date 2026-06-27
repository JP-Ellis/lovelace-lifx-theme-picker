# v0.1.0 Summary

## Shipped

- `lifx-theme-picker` Lovelace custom card (HACS-distributable).
- All 42 LIFX themes bundled verbatim in `src/palettes.ts` (sourced from
  `Djelibeybi/aiolifx-themes`).
- Two-pane layout: scrollable list of themes with 40x40 mesh-gradient
  swatches, large preview pane on the right. Collapses to a single column
  below 520 px.
- Tap-to-apply UX: selection both updates the preview and calls
  `lifx.paint_theme` immediately. No separate Apply button.
- OkLCh mesh-gradient renderer (`<lifx-mesh-preview>`) with per-N stop
  layouts (1=solid, 2=linear, 3=triangle, 4=corners, N>=5=perimeter ring).
  Pure-black stops filtered to avoid sink-holes.
- Visual `ha-form` editor with dropdown for `default_theme`, light-domain
  entity selector, area selector, transition number, power-on toggle.
- Config validation in `setConfig` (entity-or-area required, light domain,
  non-negative transition, warn-on-unknown default_theme).
- Keyboard a11y on the list: `role="listbox"`/`role="option"`, focus +
  Arrow keys, Enter/Space to apply.
- In-card status strip for service-call errors; "applying..." indicator
  in the header while in flight.
- Built artifact at `dist/lifx-theme-picker.js` (single minified bundle,
  Lit + culori inlined).
- GitHub release workflow at `.github/workflows/release.yml`.
- Docs: `README.md`, `info.md` (HACS), `CHANGELOG.md`, `LICENSE` (MIT),
  `SPEC.md`, `PLAN.md`, `DECISIONS.md`.

## Deferred to v0.2.0

- Live preview animation (mesh stays static).
- Per-theme custom palette editor.
- Reading the currently-applied theme back from HA (no state attribute
  exists on LIFX entities at present).
- Gamut warnings for very saturated palettes.
- Persisting selection to an HA helper so it survives reloads.
- Swap `BUILTIN_PALETTES` for runtime `lifx.list_themes` once HA Core
  ships it (see `DECISIONS.md` / sibling repo HANDOFF note).
- Automated tests (no unit/integration tests in v0.1.0).
- i18n of theme names.

## Known limitations

- `radial-gradient(... in oklch, ...)` requires Chromium 111+ / Safari
  16.4+. Older engines silently fall back to sRGB interpolation -- the
  card still renders, just with slightly less perceptually-even
  transitions. No feature detection is performed.
- Palettes are bundled, so any LIFX theme additions upstream require a
  card update.
- No tests; manual smoke test only.
