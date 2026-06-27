# Plan

## File structure

```
lovelace-lifx-theme-picker/
├── .github/workflows/release.yml
├── CHANGELOG.md
├── DECISIONS.md
├── LICENSE
├── PLAN.md
├── README.md
├── SPEC.md
├── SUMMARY.md
├── hacs.json
├── info.md
├── package.json
├── rollup.config.mjs
├── tsconfig.json
└── src/
    ├── card.ts            # <lifx-theme-picker> Lit element + config
    ├── color.ts           # culori helpers (hex → oklch CSS, near-black)
    ├── culori.d.ts        # culori ambient types
    ├── editor.ts          # <lifx-theme-picker-editor> ha-form editor
    ├── index.ts           # entry: register customCard + version banner
    ├── mesh-preview.ts    # <lifx-mesh-preview> renderer
    ├── palettes.ts        # bundled palettes + getPalettes()
    ├── theme-list.ts      # <lifx-theme-list> scrollable list
    └── types.ts           # HA + config interfaces, DEFAULTS
```

## Phases

1. **Spec + decisions** — done in `SPEC.md`, `DECISIONS.md`.
2. **Scaffold** — `package.json`, `tsconfig.json`, `rollup.config.mjs`,
   `hacs.json`, `info.md`, `LICENSE`, `README.md`, `CHANGELOG.md`. `npm
   install`.
3. **Core components** — `palettes.ts`, `color.ts`, `mesh-preview.ts`,
   `theme-list.ts`, `card.ts`, `editor.ts`, `index.ts`.
4. **Build** — `npm run build`, fix anything TS complains about, produce
   `dist/lifx-theme-picker.js`.
5. **Ship** — `git init`, single commit, tag `v0.1.0`. Do not push.
