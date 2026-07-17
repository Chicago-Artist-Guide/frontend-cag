import { expect, Page, test } from '@playwright/test';

const expectOneShell = async (page: Page) => {
  await expect(page.locator('#cag-frontend-app')).toHaveCount(1);
  await expect(page.getByRole('img', { name: 'CAG Logo' })).toHaveCount(1);
  await expect(
    page.getByText('© Chicago Artist Guide 2024', { exact: true })
  ).toHaveCount(1);
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
  await expectOneShell(page);
  await expect(
    page.getByRole('heading', { name: /Discover your next\s+dream gig/i })
  ).toBeVisible();

  await page.getByRole('link', { exact: true, name: 'LOGIN' }).click();
  await expect(page).toHaveURL((url) => url.pathname === '/login');
  await expectOneShell(page);
  await expect(
    page.getByRole('heading', { exact: true, name: 'WELCOME BACK' })
  ).toBeVisible();

  await page.getByRole('link', { exact: true, name: 'HOME' }).first().click();
  await expect(page).toHaveURL((url) => url.pathname === '/home');
  await expectOneShell(page);
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
  await expectOneShell(page);
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
  await expectOneShell(page);
  await expect(
    page.getByRole('heading', {
      exact: true,
      name: 'THIS PAGE IS NOT AVAILABLE'
    })
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test('same-page signup resets with a hard document reload', async ({
  page
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  await page.goto('/sign-up');
  await expectOneShell(page);
  await expect(
    page.getByRole('heading', { exact: true, name: 'BUILD CONNECTIONS TODAY' })
  ).toBeVisible();
  await page.evaluate(() => {
    (
      window as Window & { __cagBeforeSignupReload?: boolean }
    ).__cagBeforeSignupReload = true;
  });

  const documentNavigation = page.waitForEvent(
    'framenavigated',
    (frame) => frame === page.mainFrame()
  );
  await page.getByRole('link', { exact: true, name: 'SIGN UP' }).click();
  await documentNavigation;

  await expect(page).toHaveURL((url) => url.pathname === '/sign-up');
  await expectOneShell(page);
  expect(
    await page.evaluate(
      () =>
        (window as Window & { __cagBeforeSignupReload?: boolean })
          .__cagBeforeSignupReload
    )
  ).toBeUndefined();
  expect(pageErrors).toEqual([]);
});
