// <lifx-theme-list>
//
// Scrollable vertical list of LIFX themes. Each row shows the theme name plus
// a small mesh-gradient swatch. Tapping a row fires `theme-selected` with the
// theme name in `detail`.

import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { PaletteMap } from "./palettes.js";
import "./mesh-preview.js";

@customElement("lifx-theme-list")
export class LifxThemeList extends LitElement {
  @property({ attribute: false }) palettes: PaletteMap = {};
  @property({ attribute: false }) themes: readonly string[] = [];
  @property({ attribute: false }) selected?: string;

  static styles = css`
    :host {
      display: block;
      height: 100%;
      min-height: 0;
      overflow: hidden;
    }
    .list {
      height: 100%;
      max-height: inherit;
      overflow-y: auto;
      scrollbar-width: thin;
      padding: 4px 0;
      box-sizing: border-box;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 8px 12px;
      min-height: 50px;
      box-sizing: border-box;
      cursor: pointer;
      border-radius: 8px;
      margin: 2px 6px;
      transition: background 120ms ease;
      outline: none;
    }
    .row:hover,
    .row:focus-visible {
      background: var(--secondary-background-color, rgba(255, 255, 255, 0.05));
    }
    .row.selected {
      background: var(
        --primary-color,
        rgba(33, 150, 243, 0.2)
      );
      color: var(--text-primary-color, inherit);
    }
    .swatch {
      flex: 0 0 40px;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--divider-color, rgba(255, 255, 255, 0.1));
    }
    .name {
      flex: 1 1 auto;
      font-size: 0.95em;
      font-variant-numeric: tabular-nums;
      text-transform: capitalize;
      letter-spacing: 0.01em;
      word-break: break-word;
    }
  `;

  protected render() {
    return html`
      <div class="list" role="listbox" aria-label="LIFX themes">
        ${this.themes.map((name) => this._renderRow(name))}
      </div>
    `;
  }

  private _renderRow(name: string) {
    const palette = this.palettes[name] ?? [];
    const isSelected = name === this.selected;
    const label = name.replace(/_/g, " ");
    return html`
      <div
        class="row ${isSelected ? "selected" : ""}"
        role="option"
        aria-selected=${isSelected}
        tabindex="0"
        @click=${() => this._select(name)}
        @keydown=${(e: KeyboardEvent) => this._onKey(e, name)}
      >
        <div class="swatch">
          <lifx-mesh-preview .colors=${palette}></lifx-mesh-preview>
        </div>
        <div class="name">${label}</div>
      </div>
    `;
  }

  private _onKey(e: KeyboardEvent, name: string): void {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      this._select(name);
      return;
    }
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      const dir = e.key === "ArrowDown" ? 1 : -1;
      const idx = this.themes.indexOf(name);
      const next = this.themes[idx + dir];
      if (next) {
        const rows = this.renderRoot.querySelectorAll<HTMLElement>(".row");
        rows[idx + dir]?.focus();
      }
    }
  }

  private _select(name: string): void {
    this.dispatchEvent(
      new CustomEvent("theme-selected", {
        detail: { theme: name },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lifx-theme-list": LifxThemeList;
  }
}
