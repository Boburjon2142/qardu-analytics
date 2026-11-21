import { test, expect } from "@playwright/test";
import path from "path";

test.describe("QarshiDU statistika paneli: E2E va vizual baza", () => {
  test("Desktop 1440px - capture baseline screenshot and verify core elements", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify Title & KPI Cards
    await expect(page.locator("h1")).toContainText("Universitet statistikasi");
    await expect(page.getByText("24 500").first()).toBeVisible();
    await expect(page.getByText("1 250").first()).toBeVisible();

    // Take Desktop Baseline Screenshot
    const draftPath = path.resolve(
      process.cwd(),
      "design-baseline/draft/desktop-1440.png"
    );
    await page.screenshot({ path: draftPath, fullPage: true });
  });

  test("Tablet 768px - capture baseline screenshot and verify responsive layout", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify KPI Cards visible
    await expect(page.getByText("24 500").first()).toBeVisible();

    // Take Tablet Baseline Screenshot
    const draftPath = path.resolve(
      process.cwd(),
      "design-baseline/draft/tablet-768.png"
    );
    await page.screenshot({ path: draftPath, fullPage: true });
  });

  test("Mobile 390px - capture baseline screenshot and test mobile drawer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Verify KPI Card visible on mobile
    await expect(page.getByText("24 500").first()).toBeVisible();

    // Test mobile menu open
    const menuBtn = page.getByLabel("Menyuni ochish");
    await expect(menuBtn).toBeVisible();
    await menuBtn.click();

    // Verify drawer is opened
    await expect(page.getByText("Ochiq ma'lumotlar")).toBeVisible();

    // Close drawer via close button
    const closeBtn = page.getByLabel("Menyuni yopish");
    await closeBtn.click();

    // Take Mobile Baseline Screenshot
    const draftPath = path.resolve(
      process.cwd(),
      "design-baseline/draft/mobile-390.png"
    );
    await page.screenshot({ path: draftPath, fullPage: true });
  });

  test("Reporting period selector triggers data update", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Select 2023-2024 academic year
    const select = page.getByLabel("Hisobot davrini tanlash");
    await select.selectOption("2023-2024");

    // Check KPI changes to 22 800
    await expect(page.getByText("22 800").first()).toBeVisible();
  });
});
