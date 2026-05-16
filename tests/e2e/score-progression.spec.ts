import { test, expect } from '@playwright/test';

test('score increments as visitor explores', async ({ page }) => {
  await page.goto('/fr');
  await expect(page.getByRole('status').first()).toContainText('SET 1 · 00');
  await page.waitForTimeout(2500);
  await expect(page.getByRole('status').first()).toContainText('SET 1 · 01');
  await page.getByRole('link', { name: /EN/i }).click();
  await page.waitForURL(/\/en/);
  await expect(page.getByRole('status').first()).toContainText(/SET 1 · 0[12]/);
});
