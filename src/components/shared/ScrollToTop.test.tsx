import { readFileSync } from 'node:fs';
import path from 'node:path';
import React from 'react';
import { render } from '@testing-library/react';
import { vi } from 'vitest';

const navigationMocks = vi.hoisted(() => ({
  pathname: '/home' as string | null
}));

vi.mock('next/navigation', () => ({
  usePathname: () => navigationMocks.pathname
}));

import ScrollToTop from './ScrollToTop';

describe('ScrollToTop', () => {
  it('scrolls on mount and pathname changes, but not unrelated rerenders', () => {
    const scrollTo = vi
      .spyOn(window, 'scrollTo')
      .mockImplementation(() => undefined);
    const { rerender } = render(<ScrollToTop />);

    expect(scrollTo).toHaveBeenCalledTimes(1);
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);

    rerender(<ScrollToTop />);
    expect(scrollTo).toHaveBeenCalledTimes(1);

    navigationMocks.pathname = '/login';
    rerender(<ScrollToTop />);
    expect(scrollTo).toHaveBeenCalledTimes(2);
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);

    navigationMocks.pathname = null;
    rerender(<ScrollToTop />);
    expect(scrollTo).toHaveBeenCalledTimes(3);

    rerender(<ScrollToTop />);
    expect(scrollTo).toHaveBeenCalledTimes(3);
  });

  it('contains no React Router dependency', () => {
    const source = readFileSync(
      path.resolve(process.cwd(), 'src/components/shared/ScrollToTop.tsx'),
      'utf8'
    );

    expect(source).toContain("from 'next/navigation'");
    expect(source).not.toMatch(/react-router-dom|\buseLocation\b/u);
  });
});
