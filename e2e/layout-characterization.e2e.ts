import { expect, Page, test } from '@playwright/test';

const expectOneLegacyShell = async (page: Page) => {
  await expect(page.locator('#cag-frontend-app')).toHaveCount(1);
};

test.beforeEach(async ({ page }) => {
  await page.route('https://firestore.googleapis.com/**', (route) =>
    route.abort('blockedbyclient')
  );
});

test('legacy shell survives home to login to home navigation', async ({
  page
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/home');
  await expectOneLegacyShell(page);
  await expect(
    page.getByRole('heading', { name: /Discover your next\s+dream gig/i })
  ).toBeVisible();

  await page.getByRole('link', { exact: true, name: 'LOGIN' }).click();
  await expect(page).toHaveURL((url) => url.pathname === '/login');
  await expectOneLegacyShell(page);
  await expect(
    page.getByRole('heading', { exact: true, name: 'WELCOME BACK' })
  ).toBeVisible();

  await page.getByRole('link', { exact: true, name: 'HOME' }).first().click();
  await expect(page).toHaveURL((url) => url.pathname === '/home');
  await expectOneLegacyShell(page);
  await expect(
    page.getByRole('heading', { name: /Discover your next\s+dream gig/i })
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('legacy router preserves fallback to fallback transitions', async ({
  page
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/__cag_missing_route_one__');
  await expectOneLegacyShell(page);
  await expect(
    page.getByRole('heading', {
      exact: true,
      name: 'THIS PAGE IS NOT AVAILABLE'
    })
  ).toBeVisible();

  await page.evaluate(() => {
    window.history.pushState({}, '', '/__cag_missing_route_two__');
    window.dispatchEvent(new PopStateEvent('popstate'));
  });

  await expect(page).toHaveURL(
    (url) => url.pathname === '/__cag_missing_route_two__'
  );
  await expectOneLegacyShell(page);
  await expect(
    page.getByRole('heading', {
      exact: true,
      name: 'THIS PAGE IS NOT AVAILABLE'
    })
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});
