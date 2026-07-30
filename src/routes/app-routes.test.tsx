import React from 'react';
import AdminLayout from '../components/Admin/Layout/AdminLayout';
import LegacyLayout from './LegacyLayout';
import { appRouteObjects } from './app-routes';

describe('legacy route object contract', () => {
  it('keeps one legacy layout tree and the existing route paths in order', () => {
    const [legacyRoutes] = appRouteObjects;

    expect(React.isValidElement(legacyRoutes.element)).toBe(true);
    expect(legacyRoutes.element?.type).toBe(LegacyLayout);
    expect(legacyRoutes.children?.map(({ path }) => path)).toEqual([
      '/',
      '/home',
      '/donate',
      '/faq',
      '/terms-of-service',
      '/privacy-policy',
      '/about-us',
      '/theatre-resources',
      '/roles',
      '/shows',
      '/shows/:productionId',
      '/events',
      '/get-involved',
      '/login',
      '/logout',
      '/forgot-password',
      '/sign-up',
      '/profile',
      '/profile/view/:accountId',
      '/profile/messages/:threadId?',
      '/production/:productionId/manage',
      '/profile/search/roles',
      '/profile/search/talent/:productionId/:roleId?',
      '/analytics',
      '*'
    ]);
  });

  it('preserves the separate admin layout and relative child routes', () => {
    const [, adminRoutes] = appRouteObjects;

    expect(adminRoutes.path).toBe('/admin');
    expect(React.isValidElement(adminRoutes.element)).toBe(true);
    expect(adminRoutes.element?.type).toBe(AdminLayout);
    expect(
      adminRoutes.children?.map(({ index, path }) => (index ? 'index' : path))
    ).toEqual([
      'index',
      'analytics',
      'users',
      'openings',
      'events',
      'companies'
    ]);
  });

  it('exports one stable route object array', async () => {
    const secondImport = await import('./app-routes');

    expect(secondImport.appRouteObjects).toBe(appRouteObjects);
    expect(appRouteObjects).toHaveLength(2);
  });
});
