import { test, expect } from '@playwright/test';

const SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
];

test('konami code unlocks arcade mode', async ({ page }) => {
  await page.goto('/fr');
  for (const key of SEQUENCE) await page.keyboard.press(key);
  await expect(page.getByRole('button', { name: /mode/i })).toContainText('arcade');
  await page.goto('/fr/arcade');
  await expect(page.getByText('Welcome, summoner.')).toBeVisible();
});
