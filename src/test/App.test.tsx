import React from 'react';
import { render } from '@testing-library/react';
import App from '../routes/App';

test('renders app with home content', () => {
  const { getAllByText } = render(<App />);
  const headings = getAllByText(/Discover your next/i);
  expect(headings.length).toBeGreaterThan(0);
  expect(headings[0]).toBeInTheDocument();
});
