# Changelog

All notable changes follow [Keep a Changelog](https://keepachangelog.com/) and
this project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.1] — 2026-06-28

### 🚜 Refactor

- Satisfy biome preset-all lints

### 📚 Documentation

- Refresh planning docs and readme

### 🧪 Testing

- Add playwright end-to-end suite

### 🛠️ Miscellaneous Tasks

- Adopt mise, aube, and node 26 toolchain
- Configure biome, prek, and linters
- Add ci test workflow
- Add pr-based release process
- Exclude aube lockfile from yamlfix hook

## [0.1.0] — 2026-06-27

### Added

- Initial release.
- Scrollable list of the 42 built-in LIFX themes with gradient swatches.
- Live OkLCh mesh-gradient preview of the selected theme.
- Single-tap apply via `lifx.paint_theme` targeting `entity` and/or
  `area_id`, with configurable `transition` and `power_on`.
- Visual editor via `ha-form`.
- HACS Lovelace plugin packaging.
