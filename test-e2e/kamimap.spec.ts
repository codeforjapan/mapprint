import { test, expect } from '@playwright/test';
import { chromium } from 'playwright';

test('URL Check', async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto('https://kamimap.com/');
    await page.waitForLoadState('load');
    await expect(page.url()).toBe('https://kamimap.com/en/');
  } catch (error) {
    console.error('Error during page navigation:', error);
  }

  await browser.close();
});
