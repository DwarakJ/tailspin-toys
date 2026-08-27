import { test, expect } from '@playwright/test';

test.describe('Filtering on Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('category filter restricts visible game cards to the selected category', async ({ page }) => {
    const total = await page.locator('[data-testid="game-card"]').count();
    expect(total).toBeGreaterThan(0);

    const categoryOptions = await page.$$eval('#filter-category option', (opts) => opts.map((o) => (o as HTMLOptionElement).value).filter(Boolean));
    test.skip(categoryOptions.length === 0, 'No categories available to test');

    const selected = categoryOptions[0];
    await page.selectOption('#filter-category', selected);

    // collect visible cards' categories
    const visibleCats = await page.$$eval('[data-testid="game-card"]', (cards) => {
      return cards
        .filter((c) => (c as HTMLElement).offsetParent !== null)
        .map((c) => (c as HTMLElement).getAttribute('data-category'));
    });

    expect(visibleCats.length).toBeGreaterThan(0);
    for (const cat of visibleCats) {
      expect(cat).toBe(selected);
    }
  });

  test('publisher filter restricts visible game cards to the selected publisher', async ({ page }) => {
    const total = await page.locator('[data-testid="game-card"]').count();
    expect(total).toBeGreaterThan(0);

    const publisherOptions = await page.$$eval('#filter-publisher option', (opts) => opts.map((o) => (o as HTMLOptionElement).value).filter(Boolean));
    test.skip(publisherOptions.length === 0, 'No publishers available to test');

    const selected = publisherOptions[0];
    await page.selectOption('#filter-publisher', selected);

    const visiblePubs = await page.$$eval('[data-testid="game-card"]', (cards) => {
      return cards
        .filter((c) => (c as HTMLElement).offsetParent !== null)
        .map((c) => (c as HTMLElement).getAttribute('data-publisher'));
    });

    expect(visiblePubs.length).toBeGreaterThan(0);
    for (const p of visiblePubs) {
      expect(p).toBe(selected);
    }
  });
});
