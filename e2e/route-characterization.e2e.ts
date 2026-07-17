import { expect, Page, test } from '@playwright/test';

import {
  applicationRoutes,
  BrowserMarker,
  LoggedOutBrowserExpectation,
  redirectRoutes
} from '../scripts/route-contract';

const ERROR_SETTLE_TIME_MS = 750;

const markerLocator = (page: Page, marker: BrowserMarker) =>
  marker.kind === 'heading'
    ? page.getByRole('heading', { exact: true, name: marker.value }).first()
    : page.getByText(marker.value, { exact: true }).first();

const assertLoggedOutExpectation = async (
  page: Page,
  expectation: LoggedOutBrowserExpectation,
  pageErrors: string[]
) => {
  await expect(page).toHaveURL(
    (url) => url.pathname === expectation.destination
  );
  await expect(markerLocator(page, expectation.marker)).toBeVisible();
  await page.waitForTimeout(ERROR_SETTLE_TIME_MS);
  expect(pageErrors).toEqual(expectation.pageErrors ?? []);
};

test.describe('logged-out application route contract', () => {
  for (const route of applicationRoutes) {
    test(`${route.path} settles on its characterized page`, async ({
      page
    }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      const response = await page.goto(route.path);

      expect(response?.status()).toBe(200);
      await assertLoggedOutExpectation(page, route.loggedOut, pageErrors);
    });
  }
});

test.describe('compatibility redirect contract', () => {
  for (const redirect of redirectRoutes) {
    const destinationRoute = applicationRoutes.find(
      ({ path }) => path === redirect.destination
    );

    if (!destinationRoute) {
      throw new Error(
        `Missing application route contract for ${redirect.destination}`
      );
    }

    test(`${redirect.path} redirects to ${redirect.destination}`, async ({
      page
    }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (error) => pageErrors.push(error.message));

      const response = await page.goto(redirect.path);

      expect(response?.status()).toBe(200);
      await assertLoggedOutExpectation(
        page,
        destinationRoute.loggedOut,
        pageErrors
      );
    });
  }
});

test('unknown route preserves the current not-found shell', async ({
  page
}) => {
  const pageErrors: string[] = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  const response = await page.goto('/__cag_missing_route__');

  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(
    (url) => url.pathname === '/__cag_missing_route__'
  );
  await expect(
    page.getByRole('heading', {
      exact: true,
      name: 'THIS PAGE IS NOT AVAILABLE'
    })
  ).toBeVisible();
  await page.waitForTimeout(ERROR_SETTLE_TIME_MS);
  expect(pageErrors).toEqual([]);
});
