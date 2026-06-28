// Built-in LIFX theme palettes.
//
// Source of truth: Djelibeybi/aiolifx-themes, src/aiolifx_themes/library.py.
// Copied verbatim — duplicates and pure-black stops are preserved for
// fidelity with the upstream library that HA's LIFX integration uses
// internally.
//
// Forward-looking: if/when HA Core ships a response-returning
// `lifx.list_themes` service, swap `BUILTIN_PALETTES` for a runtime fetch in
// `getPalettes()` below — that is the only call-site the rest of the card
// depends on.

export type Palette = readonly string[];
export type PaletteMap = Readonly<Record<string, Palette>>;

export const BUILTIN_PALETTES: PaletteMap = {
  autumn: ["#804200", "#4f8000", "#806800", "#807b00"],
  bias_lighting: ["#e6e6e6"],
  blissful: [
    "#d1abcf",
    "#495187",
    "#7c6fb0",
    "#9893cf",
    "#2e1d2d",
    "#ffee00",
    "#c779ac",
  ],
  calaveras: ["#e600e6", "#7300e6", "#0000e6"],
  cheerful: ["#ff00d4", "#3d1078", "#140099", "#ab9100", "#7d11ab"],
  christmas: ["#00ff00", "#ff0000", "#ff4000", "#40ff40"],
  dream: [
    "#0e2b3b",
    "#144f52",
    "#7b939e",
    "#b5c3e8",
    "#5e6c85",
    "#358c79",
    "#0e2b3b",
  ],
  energizing: [
    "#ffffff",
    "#87cdff",
    "#1cd5ff",
    "#04006b",
    "#094545",
    "#4c4c4c",
  ],
  epic: ["#0039f5", "#000f7d", "#3a8c91", "#b7acf2", "#431894", "#781d82"],
  evening: ["#e69b3a", "#e6962e", "#e6aa3a"],
  exciting: [
    "#ff0000",
    "#ffaa00",
    "#ffff00",
    "#00ff08",
    "#0004ff",
    "#8400ff",
    "#e600ff",
  ],
  fantasy: ["#070035", "#3f3ae6", "#02e6a9", "#c800c8"],
  focusing: ["#ff9ec2", "#ffe3a3", "#fff8c9", "#ffffff", "#ffffff"],
  gentle: ["#e68faf", "#e6e6e6", "#e6e0b6", "#e6e6e6", "#e6cd93"],
  halloween: ["#ff8400", "#995200", "#ff8800", "#995400", "#ff8c00", "#b26500"],
  hanukkah: ["#e6e6e6", "#adade6", "#0000e6", "#7373e6", "#3a3ae6"],
  holly: ["#0dff00", "#29ff19", "#ff0400", "#048000", "#e60000"],
  hygge: ["#e6aa39", "#e69b39"],
  independence: ["#ffffff", "#ff0000", "#0000ff"],
  intense: ["#4640ff", "#de00de", "#03ffbc", "#08003b"],
  kwanzaa: ["#00ff00", "#ff0000"],
  love: ["#d474bc", "#cf193a", "#e63763", "#e1c0d5", "#e6c1e2"],
  mellow: ["#966869", "#d19fc5", "#020066", "#5e5280", "#646661"],
  party: ["#e600e6", "#6000e6", "#0000e6", "#3a3ae6", "#2377e6"],
  peaceful: ["#0f181c", "#d97875", "#d9d18b", "#8f3b35", "#5e7c8f"],
  powerful: ["#a81d02", "#faf74b", "#691401", "#fbfc8d", "#fa4e05", "#f7da1e"],
  proud: [
    "#e67b00",
    "#7700e6",
    "#cf193a",
    "#2272e1",
    "#67cf67",
    "#e6b8e4",
    "#e6e600",
  ],
  pumpkin: ["#da9100", "#701300", "#7c4400", "#daa700", "#e6bc67"],
  relaxing: ["#35ff0d", "#d0ff00", "#0d5410", "#0d1a0d"],
  romance: ["#d474bc", "#cf193a", "#e63763", "#e1c0d5", "#e6c1e2"],
  santa: ["#ff0000", "#fff2f4", "#940500", "#858585"],
  serene: [
    "#d1e8e8",
    "#257efa",
    "#354d5e",
    "#294018",
    "#596b4f",
    "#79e08e",
    "#439af7",
  ],
  shamrock: ["#00e613", "#1aac32", "#45cf00", "#397348", "#21c300", "#00e600"],
  soothing: ["#ab8c98", "#ab5579", "#ffffff", "#ff4ff9", "#945173"],
  spacey: ["#0c170c", "#bce600", "#30e60c", "#0b4c0f"],
  sports: ["#f5f12f", "#00f500", "#42ff42"],
  spring: ["#007780", "#7d0080", "#806800", "#005980"],
  stardust: ["#e6e6e6", "#73aee6", "#e6e6e6", "#b8a1e6"],
  thanksgiving: ["#c6ab26", "#c68326", "#e67300", "#966116", "#966454"],
  tranquil: ["#000000", "#40a9f5", "#0f9df5", "#0703ff", "#fcb43f", "#876717"],
  warming: ["#c20d00", "#f5da9d", "#db2a38", "#a6925d", "#968317", "#4c4c4c"],
  zombie: ["#00e68a", "#6e00db", "#006e31", "#4b006e", "#00a434"],
};

/**
 * Return all known palettes. Single async chokepoint so a future swap to a
 * response-returning `lifx.list_themes` HA service is a one-line change here.
 */
// biome-ignore lint/suspicious/useAwait: async by design — the single chokepoint for a future `lifx.list_themes` call
export async function getPalettes(): Promise<PaletteMap> {
  return BUILTIN_PALETTES;
}

/** Sorted list of theme names. */
export const THEME_NAMES: readonly string[] = Object.freeze(
  Object.keys(BUILTIN_PALETTES).sort(),
);
