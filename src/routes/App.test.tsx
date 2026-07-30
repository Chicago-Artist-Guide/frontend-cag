import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const routerMocks = vi.hoisted(() => ({
  createBrowserRouter: vi.fn(),
  providerTrees: 0,
  routers: [] as unknown[],
  stableRouteObjects: [{ path: '*' }]
}));

vi.mock('react-router-dom', () => ({
  createBrowserRouter: routerMocks.createBrowserRouter,
  RouterProvider: ({ router }: { router: unknown }) => {
    routerMocks.routers.push(router);
    return <div data-testid="router-provider" />;
  }
}));
vi.mock('../../app/providers', () => ({
  default: ({ children }: React.PropsWithChildren) => {
    routerMocks.providerTrees += 1;
    return <section data-testid="app-providers">{children}</section>;
  }
}));
vi.mock('./app-routes', () => ({
  appRouteObjects: routerMocks.stableRouteObjects,
  default: () => <div />
}));

import App from './App';

describe('legacy App router ownership', () => {
  beforeEach(() => {
    routerMocks.createBrowserRouter.mockReset();
    routerMocks.providerTrees = 0;
    routerMocks.routers = [];
    routerMocks.createBrowserRouter
      .mockReturnValueOnce({ id: 'first-router' })
      .mockReturnValueOnce({ id: 'second-router' });
  });

  it('creates a distinct browser router for each App mount', () => {
    expect(routerMocks.createBrowserRouter).not.toHaveBeenCalled();

    const first = render(<App />);
    const second = render(<App />);

    expect(routerMocks.createBrowserRouter).toHaveBeenCalledTimes(2);
    expect(routerMocks.createBrowserRouter).toHaveBeenNthCalledWith(
      1,
      routerMocks.stableRouteObjects
    );
    expect(routerMocks.createBrowserRouter).toHaveBeenNthCalledWith(
      2,
      routerMocks.stableRouteObjects
    );
    expect(routerMocks.routers).toEqual([
      { id: 'first-router' },
      { id: 'second-router' }
    ]);
    expect(screen.getAllByTestId('app-providers')).toHaveLength(2);
    expect(screen.getAllByTestId('router-provider')).toHaveLength(2);
    expect(routerMocks.providerTrees).toBe(2);

    first.unmount();
    second.unmount();
  });
});
