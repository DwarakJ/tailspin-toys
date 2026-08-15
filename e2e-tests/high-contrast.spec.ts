import { test, expect } from '@playwright/test';

test.describe('High contrast mode', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('toggle exists and toggles class on html', async ({ page }) => {
    const toggle = page.getByTestId('high-contrast-toggle');
    await expect(toggle).toBeVisible();

    // Initially off
    const hasClassBefore = await page.evaluate(() => document.documentElement.classList.contains('high-contrast'));
    expect(hasClassBefore).toBeFalsy();

    await toggle.click();
    await page.waitForTimeout(200);

    const hasClassAfter = await page.evaluate(() => document.documentElement.classList.contains('high-contrast'));
    expect(hasClassAfter).toBeTruthy();

    // Reload page and ensure preference persisted
    await page.reload();
    const hasClassOnReload = await page.evaluate(() => document.documentElement.classList.contains('high-contrast'));
    expect(hasClassOnReload).toBeTruthy();

    // Turn it off and ensure it clears
    await toggle.click();
    await page.reload();
    const cleared = await page.evaluate(() => document.documentElement.classList.contains('high-contrast'));
    expect(cleared).toBeFalsy();
  });
});
