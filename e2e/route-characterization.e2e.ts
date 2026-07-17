import { expect, test } from '@playwright/test';

import { applicationRoutes } from '../scripts/route-contract';

for (const route of applicationRoutes) {
  test(`${route.path} preserves its logged-out route behavior`, async ({
    page
  }) => {
    const response = await page.goto(route.path);

    expect(response).not.toBeNull();
    expect(response?.status()).toBe(200);

    if (route.routeClass === 'admin') {
      await expect(
        page.getByRole('heading', { name: 'Access Restricted' })
      ).toBeVisible();
    } else {
      await expect(page.locator('#cag-frontend-app')).toBeVisible();
    }
  });
}

test('/ redirects to /home', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveURL(/\/home$/);
});

test('/analytics redirects to /admin/analytics', async ({ page }) => {
  await page.goto('/analytics');

  await expect(page).toHaveURL(/\/admin\/analytics$/);
});

test('an unknown route renders the not-found page', async ({ page }) => {
  const response = await page.goto('/__cag_missing_route__');

  expect(response).not.toBeNull();
  expect(response?.status()).toBe(200);
  await expect(
    page.getByRole('heading', { name: 'THIS PAGE IS NOT AVAILABLE' })
  ).toBeVisible();
});
