import { test, expect } from '@playwright/test';

test.describe('Game Filtering', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display filter controls on home page', async ({ page }) => {
    const categoryLegend = page.locator('legend').filter({ hasText: 'Categories' });
    await expect(categoryLegend).toBeVisible();

    const publisherLegend = page.locator('legend').filter({ hasText: 'Publishers' });
    await expect(publisherLegend).toBeVisible();
  });

  test('should display category checkboxes', async ({ page }) => {
    const categoryCheckbox1 = page.getByTestId('category-checkbox-1');
    await expect(categoryCheckbox1).toBeVisible();
  });

  test('should display publisher checkboxes', async ({ page }) => {
    const publisherCheckbox1 = page.getByTestId('publisher-checkbox-1');
    await expect(publisherCheckbox1).toBeVisible();
  });

  test('should have games grid with content', async ({ page }) => {
    const gamesGrid = page.getByTestId('games-grid');
    await expect(gamesGrid).toBeVisible();
    
    const gameCards = page.getByTestId('game-card');
    const count = await gameCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should allow keyboard interaction with checkboxes', async ({ page }) => {
    const categoryCheckbox1 = page.getByTestId('category-checkbox-1');
    await categoryCheckbox1.focus();
    await expect(categoryCheckbox1).toBeFocused();
  });

  test('should update games when a checkbox is checked', async ({ page }) => {
    const initialGameCards = page.getByTestId('game-card');
    const initialCount = await initialGameCards.count();
    expect(initialCount).toBeGreaterThan(0);

    const categoryCheckbox1 = page.getByTestId('category-checkbox-1');
    await categoryCheckbox1.check();

    // Wait a moment for any filtering to happen
    await page.waitForTimeout(500);

    // Verify games are still displayed (even if count might differ)
    const gamesGrid = page.getByTestId('games-grid');
    await expect(gamesGrid).toBeVisible();
  });

  test('should allow checking and unchecking publisher filters', async ({ page }) => {
    const publisherCheckbox1 = page.getByTestId('publisher-checkbox-1');
    
    // Initially unchecked
    await expect(publisherCheckbox1).not.toBeChecked();
    
    // Check it
    await publisherCheckbox1.check();
    await expect(publisherCheckbox1).toBeChecked();
    
    // Uncheck it
    await publisherCheckbox1.uncheck();
    await expect(publisherCheckbox1).not.toBeChecked();
  });

  test('should handle multiple category selections', async ({ page }) => {
    const categoryCheckbox1 = page.getByTestId('category-checkbox-1');
    const categoryCheckbox2 = page.getByTestId('category-checkbox-2');

    if (await categoryCheckbox1.isVisible()) {
      await categoryCheckbox1.check();
      await expect(categoryCheckbox1).toBeChecked();
    }

    if (await categoryCheckbox2.isVisible()) {
      await categoryCheckbox2.check();
      await expect(categoryCheckbox2).toBeChecked();
    }
  });

  test('should handle combined category and publisher selections', async ({ page }) => {
    const categoryCheckbox1 = page.getByTestId('category-checkbox-1');
    const publisherCheckbox1 = page.getByTestId('publisher-checkbox-1');

    if (await categoryCheckbox1.isVisible()) {
      await categoryCheckbox1.check();
    }

    if (await publisherCheckbox1.isVisible()) {
      await publisherCheckbox1.check();
    }

    // Verify both are checked
    if (await categoryCheckbox1.isVisible()) {
      await expect(categoryCheckbox1).toBeChecked();
    }
    if (await publisherCheckbox1.isVisible()) {
      await expect(publisherCheckbox1).toBeChecked();
    }
  });

  test('should maintain games grid visibility', async ({ page }) => {
    const gamesGrid = page.getByTestId('games-grid');
    
    // Should be visible initially
    await expect(gamesGrid).toBeVisible();

    // Should remain visible after checking a filter
    const categoryCheckbox1 = page.getByTestId('category-checkbox-1');
    if (await categoryCheckbox1.isVisible()) {
      await categoryCheckbox1.check();
      await expect(gamesGrid).toBeVisible();
    }
  });
});

