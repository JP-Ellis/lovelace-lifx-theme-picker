// <lifx-theme-picker> — the main card.

import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./mesh-preview.js";
import "./theme-list.js";
import { BUILTIN_PALETTES, type PaletteMap, THEME_NAMES } from "./palettes.js";
import {
  DEFAULTS,
  type HomeAssistant,
  type LifxThemePickerConfig,
} from "./types.js";

// Rough height hint (in ~50px rows) Lovelace uses to lay the card out.
const CARD_SIZE = 6;

@customElement("lifx-theme-picker")
export class LifxThemePickerCard extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config?: LifxThemePickerConfig;
  @state() private _selected?: string;
  @state() private readonly _palettes: PaletteMap = BUILTIN_PALETTES;
  @state() private _busy = false;
  @state() private _error?: string;

  static styles = css`
    :host {
      display: block;
    }
    ha-card {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px 4px;
      font-weight: 500;
    }
    .body {
      display: grid;
      grid-template-columns: minmax(180px, 36%) 1fr;
      gap: 12px;
      padding: 8px 12px 12px;
      min-height: 320px;
    }
    .list-pane {
      min-height: 280px;
      max-height: 420px;
      background: var(
        --code-editor-background-color,
        rgba(0, 0, 0, 0.08)
      );
      border-radius: 10px;
    }
    .preview-pane {
      position: relative;
      min-height: 280px;
      border-radius: 12px;
      overflow: hidden;
      isolation: isolate;
      box-shadow: inset 0 0 0 1px var(--divider-color, rgba(255, 255, 255, 0.08));
    }
    .preview-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 16px;
      pointer-events: none;
      color: #fff;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.4);
    }
    .preview-title {
      font-size: 1.4em;
      font-weight: 600;
      text-transform: capitalize;
      letter-spacing: 0.01em;
    }
    .preview-meta {
      display: flex;
      justify-content: space-between;
      align-items: end;
      font-size: 0.78em;
      opacity: 0.92;
      font-variant-numeric: tabular-nums;
    }
    .status {
      font-size: 0.78em;
      opacity: 0.8;
      padding: 4px 16px 8px;
      min-height: 1em;
    }
    .status.error {
      color: var(--error-color, #ff6b6b);
      opacity: 1;
    }
    @media (max-width: 520px) {
      .body {
        grid-template-columns: 1fr;
      }
      .list-pane {
        max-height: 260px;
      }
    }
  `;

  static getConfigElement() {
    return document.createElement("lifx-theme-picker-editor");
  }

  static getStubConfig(): Partial<LifxThemePickerConfig> {
    return { entity: "light.example" };
  }

  setConfig(config: LifxThemePickerConfig): void {
    if (!config) {
      throw new Error("Configuration is required");
    }
    if (!(config.entity || config.area_id)) {
      throw new Error("At least one of `entity` or `area_id` must be set");
    }
    if (config.entity && !config.entity.startsWith("light.")) {
      throw new Error("`entity` must be a light.* entity");
    }
    if (
      config.transition !== undefined &&
      (typeof config.transition !== "number" || config.transition < 0)
    ) {
      throw new Error("`transition` must be a non-negative number");
    }
    if (config.default_theme && !(config.default_theme in BUILTIN_PALETTES)) {
      // Don't throw — just ignore an unknown default, so we don't blow up
      // configs after a palette rename.
      // biome-ignore lint/suspicious/noConsole: surfacing a misconfigured theme to the browser console is the intended diagnostic
      console.warn(
        `[lifx-theme-picker] unknown default_theme '${config.default_theme}'`,
      );
    }
    this._config = config;
    if (!this._selected) {
      this._selected =
        config.default_theme && config.default_theme in BUILTIN_PALETTES
          ? config.default_theme
          : undefined;
    }
  }

  getCardSize(): number {
    return CARD_SIZE;
  }

  private _onSelect(e: CustomEvent<{ theme: string }>): void {
    const { theme } = e.detail;
    this._selected = theme;
    // Fire-and-forget: _apply handles its own errors (sets `_error`) and never
    // rejects, so there is nothing to await here.
    // biome-ignore lint/complexity/noVoid: marks a deliberately-unawaited promise
    void this._apply(theme);
  }

  private async _apply(theme: string): Promise<void> {
    if (!(this._config && this.hass)) {
      return;
    }
    const cfg = this._config;
    const target: { entity_id?: string; area_id?: string } = {};
    if (cfg.entity) {
      target.entity_id = cfg.entity;
    }
    if (cfg.area_id) {
      target.area_id = cfg.area_id;
    }
    const data: Record<string, unknown> = {
      theme,
      transition: cfg.transition ?? DEFAULTS.transition,
      power_on: cfg.power_on ?? DEFAULTS.power_on,
    };
    this._busy = true;
    this._error = undefined;
    try {
      await this.hass.callService("lifx", "paint_theme", data, target);
    } catch (err) {
      this._error = err instanceof Error ? err.message : String(err);
    } finally {
      this._busy = false;
    }
  }

  // Resolved card title: explicit name, else the entity's friendly name, else
  // the entity/area id, else a generic fallback.
  private get _title(): string {
    const { _config: config, hass } = this;
    if (!(config && hass)) {
      return "LIFX Themes";
    }
    if (config.name !== undefined) {
      return config.name;
    }
    if (config.entity !== undefined) {
      return (
        hass.states[config.entity]?.attributes.friendly_name ?? config.entity
      );
    }
    return config.area_id ?? "LIFX Themes";
  }

  protected render() {
    if (!(this._config && this.hass)) {
      return html``;
    }
    const selected = this._selected;
    const selectedPalette = selected ? (this._palettes[selected] ?? []) : [];

    return html`
      <ha-card>
        <div class="header">
          <span>${this._title}</span>
          <!-- _busy is reactive Lit state reassigned in _apply(); biome's flow
               analysis sees only the initial \`false\` and wrongly reports the
               branch as dead. -->
          ${
            // biome-ignore lint/suspicious/noUnnecessaryConditions: _busy is reassigned at runtime by _apply()
            this._busy ? html`<span class="status">applying…</span>` : ""
          }
        </div>
        <div class="body">
          <div class="list-pane">
            <lifx-theme-list
              .palettes=${this._palettes}
              .themes=${THEME_NAMES}
              .selected=${selected}
              @theme-selected=${this._onSelect}
            ></lifx-theme-list>
          </div>
          <div class="preview-pane">
            <lifx-mesh-preview
              .colors=${selectedPalette}
              style="position:absolute;inset:0;border-radius:inherit;"
            ></lifx-mesh-preview>
            <div class="preview-overlay">
              <div class="preview-title">
                ${selected ? selected.replace(/_/g, " ") : "Pick a theme"}
              </div>
              <div class="preview-meta">
                <span
                  >${
                    selected
                      ? `${selectedPalette.length} color${selectedPalette.length === 1 ? "" : "s"}`
                      : ""
                  }</span
                >
                <span>${selected ? "tap a theme to apply" : ""}</span>
              </div>
            </div>
          </div>
        </div>
        <div class="status ${this._error ? "error" : ""}">
          ${this._error ?? ""}
        </div>
      </ha-card>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lifx-theme-picker": LifxThemePickerCard;
  }
  // The Lovelace custom-card registry, exposed by Home Assistant on the global
  // object. Declared with `var` so it is reachable via `globalThis`; this is
  // the canonical idiom for augmenting the global scope.
  var customCards:
    | Array<{
        type: string;
        name: string;
        description?: string;
        preview?: boolean;
        documentationURL?: string;
      }>
    | undefined;
}
