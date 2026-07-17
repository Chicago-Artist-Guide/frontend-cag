import React from 'react';
import { render } from '@testing-library/react';

test('renders app with home content', async () => {
  window.history.replaceState({}, '', '/home');
  const { default: App } = await import('../routes/App');

  const { getAllByRole } = render(<App />);
  const headings = getAllByRole('heading', {
    name: /Discover your next dream gig/i
  });

  expect(headings.length).toBeGreaterThan(0);
  expect(headings[0]).toBeInTheDocument();
});
