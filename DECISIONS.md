# Decisions

Calls made without the user available, with the question I'd otherwise have
asked.

## Palette source

**Q:** Bundle the palettes or fetch them at runtime?

**Call:** Bundle as a static constant in `src/palettes.ts`, exported
verbatim from `aiolifx-themes/library.py`. Wrapped in an async
`getPalettes()` so the call-site is identical to a future
response-returning `lifx.list_themes` service. When that lands, this is a
one-method swap. Tracked in
`/home/josh/src/JP-Ellis/lovelace-oklch-light-card/HANDOFF-lifx-themes-upstream.md`.

## Apply trigger

**Q:** Tap-to-apply or separate Apply button?

**Call:** Tap-to-apply. A button would be redundant — the user is already
selecting the theme they want, and `lifx.paint_theme` accepts a transition
so a misclick is recoverable. The preview pane shows the theme name but no
Apply button; only a hint in the meta line.

## Mesh-gradient blend mode

**Q:** `normal`, `screen`, `lighten`, or something cleverer?

**Call:** `normal`. Tested mentally against typical palettes; the screen-mode
result for e.g. `proud` washes out into white. Real LIFX strips cross-fade
between zones, which is closer to `normal` stacking with transparency.

## Pure-black filtering

**Q:** Filter pure-black stops or not?

**Call:** Filter. Only `tranquil` has a black stop; without filtering the
mesh gets a black sink-hole at the perimeter that doesn't represent what the
bulb actually paints. We keep at least one color even if the entire palette
is black (defensive).

## Duplicate stops

**Q:** Deduplicate stops or keep them for fidelity?

**Call:** Keep. `bias_lighting`, `focusing`, `gentle`, `stardust` all repeat
colors deliberately to bias the perceived weight of certain stops. Removing
them would change the look.

## Theme name display

**Q:** Show the raw snake_case name (`bias_lighting`) or humanise
(`bias lighting`, `Bias Lighting`)?

**Call:** Replace `_` with space; rely on CSS `text-transform: capitalize`
to capitalise each word. Keeps theme IDs visually close to the canonical
names without mapping every theme by hand.

## Internal selection state

**Q:** Persist selection to an HA helper so it survives reloads?

**Call:** No, internal state only for v0.1.0. Spec says "no HA helper". Cheap
v0.2.0 addition if anyone asks.

## Editor `select` of theme names

**Q:** Use a dropdown of 42 entries or free text?

**Call:** Dropdown. Free text would require live validation, and the list is
small enough.

## Layout breakpoint

**Q:** Where to collapse to a single column?

**Call:** 520 px card width. Picked so two columns work on a standard
two-column dashboard cell and collapse on phones / sidebar cards.

## Service-call error handling

**Q:** Toast, console, or in-card?

**Call:** In-card status strip. Toasts require HA frontend APIs we'd rather
not depend on; console is invisible. The status strip is unobtrusive when
empty.

## gpg signing

User pre-approved bypassing `commit.gpgsign` for this initial commit if it
blocks. Doing so iff needed.
