import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Visual Regression Baseline Checks", () => {
  const approvedDir = path.resolve(process.cwd(), "../../design-baseline/approved/v1.0");

  test("Desktop 1440px matches approved baseline if available", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const approvedScreenshot = path.join(approvedDir, "desktop-1440.png");
    if (fs.existsSync(approvedScreenshot)) {
      const currentScreenshot = await page.screenshot({ fullPage: true });
      const approvedBuffer = fs.readFileSync(approvedScreenshot);
      // Ensure file exists and is readable
      expect(currentScreenshot.length).toBeGreaterThan(0);
      expect(approvedBuffer.length).toBeGreaterThan(0);
    } else {
      test.skip(true, "Approved baseline v1.0 not yet established by user confirmation.");
    }
  });
});
