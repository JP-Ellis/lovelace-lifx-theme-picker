# LIFX Theme Picker

A Lovelace card that browses the 42 built-in LIFX themes and applies one to a
light or area with a single tap. Each theme is previewed live as a
multi-point **mesh gradient interpolated in OkLCh** color space — perceptually
smoother than naive sRGB stops and a better approximation of what a strip of
LIFX bulbs actually does when it paints a theme across a zone.

![placeholder screenshot](https://via.placeholder.com/640x320?text=LIFX+Theme+Picker)

## Features

- Scrollable list of all 42 built-in LIFX themes (`autumn`, `blissful`,
  `cheerful`, `epic`, …) with a small gradient swatch next to each name.
- Live preview pane showing the selected theme as an OkLCh mesh gradient.
- Single tap = preview **and** apply via `lifx.paint_theme`.
- Target either a single `light.*` entity or an `area_id` (or both).
- Configurable `transition` and `power_on` passed through to the service call.
- Responsive: side-by-side on wide cards, stacked on narrow ones.
- Visual editor via `ha-form`.

## Requirements

- Home Assistant with the [LIFX
  integration](https://www.home-assistant.io/integrations/lifx/) configured.
- The `lifx.paint_theme` service available (it ships with the integration).
- A reasonably modern Chromium/WebKit-based browser. OkLCh-interpolated
  gradients require Chromium 111+ / Safari 16.4+; on older browsers the
  preview falls back to sRGB interpolation (still functional, just less
  perceptually uniform).

## Install (HACS — custom repository)

1. In HACS, go to **Frontend → ⋮ → Custom repositories**.
2. Add `https://github.com/JP-Ellis/lovelace-lifx-theme-picker` as a
   **Lovelace** repository.
3. Install **LIFX Theme Picker** and reload the frontend (HACS will prompt
   you).
4. Add the card to your dashboard via **Add Card → Custom: LIFX Theme
   Picker**.

## Install (manual)

1. Download `lifx-theme-picker.js` from the latest
   [release](https://github.com/JP-Ellis/lovelace-lifx-theme-picker/releases).
2. Copy it to `<config>/www/community/lovelace-lifx-theme-picker/`.
3. Add a Lovelace resource:

   ```yaml
   url: /local/community/lovelace-lifx-theme-picker/lifx-theme-picker.js
   type: module
   ```

## Configuration

```yaml
type: custom:lifx-theme-picker
entity: light.kitchen          # optional — light.* entity to paint
area_id: living_room           # optional — area to paint
transition: 2                  # optional, seconds, default 2
power_on: true                 # optional, default true
default_theme: blissful        # optional — preselect on load
name: Kitchen LIFX             # optional — overrides the card title
```

At least one of `entity` and `area_id` must be set. If both are provided, the
service call sends both; HA's service layer handles the union.

## Notes on the palette

The 42 palettes are bundled as a static constant in `src/palettes.ts`. They
are copied verbatim from the upstream
[`aiolifx-themes`](https://github.com/Djelibeybi/aiolifx-themes) library
(`src/aiolifx_themes/library.py`) which is what the HA LIFX integration uses
internally. If a future HA release exposes a response-returning
`lifx.list_themes` service, the card is structured so swapping data sources is
a single-method change — see `DECISIONS.md`.

## License

MIT © JP-Ellis. LIFX is a trademark of LIFX Pty Ltd; this project is not
affiliated with LIFX.
