// Visual editor for <lifx-theme-picker>.

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { THEME_NAMES } from './palettes.js';
import {
  DEFAULTS,
  type HomeAssistant,
  type LifxThemePickerConfig,
} from './types.js';

const SCHEMA = [
  { name: 'entity', selector: { entity: { domain: 'light' } } },
  { name: 'area_id', selector: { area: {} } },
  { name: 'name', selector: { text: {} } },
  {
    name: 'default_theme',
    selector: {
      select: {
        mode: 'dropdown',
        options: THEME_NAMES.map((n) => ({
          value: n,
          label: n.replace(/_/g, ' '),
        })),
      },
    },
  },
  {
    name: 'transition',
    selector: { number: { min: 0, max: 60, step: 0.5, mode: 'box' } },
  },
  { name: 'power_on', selector: { boolean: {} } },
];

@customElement('lifx-theme-picker-editor')
export class LifxThemePickerEditor extends LitElement {
  @property({ attribute: false }) hass?: HomeAssistant;
  @state() private _config?: LifxThemePickerConfig;

  static styles = css`
    :host {
      display: block;
    }
    .hint {
      font-size: 0.8em;
      opacity: 0.7;
      padding: 4px 0 12px;
    }
  `;

  setConfig(config: LifxThemePickerConfig): void {
    this._config = config;
  }

  private _valueChanged(ev: CustomEvent): void {
    const value = ev.detail.value as LifxThemePickerConfig;
    this.dispatchEvent(
      new CustomEvent('config-changed', {
        detail: { config: value },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private _computeLabel = (s: { name: string }): string => {
    switch (s.name) {
      case 'entity':
        return 'Light entity (optional if area is set)';
      case 'area_id':
        return 'Area (optional if entity is set)';
      case 'name':
        return 'Card title';
      case 'default_theme':
        return 'Default theme';
      case 'transition':
        return 'Transition (seconds)';
      case 'power_on':
        return 'Power on if off';
      default:
        return s.name;
    }
  };

  protected render() {
    if (!this.hass || !this._config) return html``;
    const data = { ...DEFAULTS, ...this._config };
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${data}
        .schema=${SCHEMA}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._valueChanged}
      ></ha-form>
      <div class="hint">
        Set at least one of <code>entity</code> or <code>area_id</code>.
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'lifx-theme-picker-editor': LifxThemePickerEditor;
  }
}
