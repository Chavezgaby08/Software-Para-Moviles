import React from 'react';
import { render } from '@testing-library/react';
import App from './App';

test('renders without crashing', async () => {
  const { findByText } = render(<App />);
  const text = await findByText('Ready to create an app?');
  expect(text).toBeDefined();
});
