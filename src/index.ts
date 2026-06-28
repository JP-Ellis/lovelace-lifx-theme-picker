import "./card.js";
import "./editor.js";

const VERSION = "0.1.0";

// Register with the Lovelace custom card picker.
globalThis.customCards = globalThis.customCards || [];
if (!globalThis.customCards.some((c) => c.type === "lifx-theme-picker")) {
  globalThis.customCards.push({
    type: "lifx-theme-picker",
    name: "LIFX Theme Picker",
    description:
      "Browse and apply LIFX themes with an OkLCh mesh-gradient preview.",
    preview: true,
    documentationURL: "https://github.com/JP-Ellis/lovelace-lifx-theme-picker",
  });
}

// Friendly version banner.
// biome-ignore lint/suspicious/noConsole: the version banner is a deliberate, conventional Home Assistant custom-card console message
console.info(
  `%c LIFX-Theme-Picker %c v${VERSION} `,
  "color:#fff;background:#0a84ff;padding:2px 4px;border-radius:3px 0 0 3px;",
  "color:#0a84ff;background:#fff;padding:2px 4px;border:1px solid #0a84ff;border-radius:0 3px 3px 0;",
);
