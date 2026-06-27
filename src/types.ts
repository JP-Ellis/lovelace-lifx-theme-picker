// Minimal Home Assistant frontend types — enough for a custom card.

export interface HassEntityState {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown> & {
    friendly_name?: string;
  };
}

export interface HomeAssistant {
  states: Record<string, HassEntityState>;
  callService: (
    domain: string,
    service: string,
    data?: Record<string, unknown>,
    target?: { entity_id?: string | string[]; area_id?: string | string[] },
  ) => Promise<unknown>;
}

export interface LifxThemePickerConfig {
  type: string;
  entity?: string;
  area_id?: string;
  transition?: number;
  power_on?: boolean;
  default_theme?: string;
  name?: string;
}

export const DEFAULTS = {
  transition: 2,
  power_on: true,
} as const;
