import { expect, test } from "@playwright/test";

// The fixture exposes a small harness on `globalThis.__lifx` for mounting the
// card with a mock Home Assistant object and recording service calls.
interface ServiceCall {
  domain: string;
  service: string;
  data: Record<string, unknown>;
  target: { entity_id?: string; area_id?: string };
}

declare global {
  interface Window {
    __lifx: {
      serviceCalls: ServiceCall[];
      mount: (
        config?: Record<string, unknown>,
        hassOverrides?: Record<string, unknown>,
      ) => Promise<boolean>;
    };
  }
}

const FIXTURE = "/e2e/fixture/index.html";
const THEME_COUNT = 42;

async function mount(
  page: import("@playwright/test").Page,
  config?: Record<string, unknown>,
  hassOverrides?: Record<string, unknown>,
): Promise<void> {
  await page.goto(FIXTURE);
  await page.evaluate(([c, h]) => window.__lifx.mount(c, h), [
    config,
    hassOverrides,
  ] as const);
  await expect(page.locator("lifx-theme-picker")).toBeVisible();
}

test.describe("lifx-theme-picker — rendering", () => {
  test("renders an ha-card", async ({ page }) => {
    await mount(page);
    await expect(page.locator("ha-card")).toBeVisible();
  });

  test("header shows the entity's friendly name", async ({ page }) => {
    await mount(page);
    await expect(page.locator(".header span").first()).toHaveText(
      "Living Room Lamp",
    );
  });

  test("falls back to the area id when no entity is given", async ({
    page,
  }) => {
    await mount(page, { type: "lifx-theme-picker", area_id: "living_room" });
    await expect(page.locator(".header span").first()).toHaveText(
      "living_room",
    );
  });

  test("lists every built-in theme", async ({ page }) => {
    await mount(page);
    await expect(page.locator(".row")).toHaveCount(THEME_COUNT);
  });

  test("each theme row renders a gradient swatch", async ({ page }) => {
    await mount(page);
    // Every row's swatch is a mesh-preview surface; all must paint something.
    const surfaces = page.locator(".row .swatch .surface");
    await expect(surfaces).toHaveCount(THEME_COUNT);
  });
});

test.describe("lifx-theme-picker — selecting a theme", () => {
  test("applies the theme via the lifx.paint_theme service", async ({
    page,
  }) => {
    await mount(page);
    // Rows are sorted alphabetically, so the first row is `autumn`.
    await page.locator(".row").first().click();

    const calls = await page.evaluate(() => window.__lifx.serviceCalls);
    expect(calls).toHaveLength(1);
    expect(calls[0]).toMatchObject({
      domain: "lifx",
      service: "paint_theme",
      data: { theme: "autumn", transition: 2, power_on: true },
      target: { entity_id: "light.example" },
    });
  });

  test("honours configured transition and power_on", async ({ page }) => {
    await mount(page, {
      type: "lifx-theme-picker",
      entity: "light.example",
      transition: 5,
      power_on: false,
    });
    await page.locator(".row").first().click();

    const calls = await page.evaluate(() => window.__lifx.serviceCalls);
    expect(calls[0]?.data).toMatchObject({
      transition: 5,
      power_on: false,
    });
  });

  test("marks the chosen row selected and updates the preview title", async ({
    page,
  }) => {
    await mount(page);
    const firstRow = page.locator(".row").first();
    await firstRow.click();

    await expect(firstRow).toHaveClass(/selected/);
    await expect(firstRow).toHaveAttribute("aria-selected", "true");
    await expect(page.locator(".preview-title")).toHaveText("autumn");
  });

  test("paints the preview pane with a gradient once a theme is chosen", async ({
    page,
  }) => {
    await mount(page);
    await page.locator(".row").first().click();

    const surface = page.locator(".preview-pane .surface");
    const bg = await surface.evaluate((el) => {
      const cs = getComputedStyle(el);
      return cs.backgroundImage + cs.backgroundColor;
    });
    // `autumn` has four colors → a multi-radial mesh gradient.
    expect(bg).toContain("radial-gradient");
  });
});

test.describe("lifx-theme-picker — layout", () => {
  test("uses a two-column body on a wide viewport", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await mount(page);
    const cols = await page
      .locator(".body")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    // Two tracks → two space-separated pixel values.
    expect(cols.trim().split(/\s+/u)).toHaveLength(2);
  });

  test("collapses to a single column on a narrow viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 380, height: 800 });
    await mount(page);
    const cols = await page
      .locator(".body")
      .evaluate((el) => getComputedStyle(el).gridTemplateColumns);
    expect(cols.trim().split(/\s+/u)).toHaveLength(1);
  });

  test("has no horizontal overflow at a narrow viewport", async ({ page }) => {
    await page.setViewportSize({ width: 380, height: 800 });
    await mount(page);
    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    expect(overflows).toBe(false);
  });
});
