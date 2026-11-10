import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App, HELLO_QUERY } from './App';

describe('App', () => {
  it('shows the greeting returned by the API', async () => {
    // Given the API answers the hello query
    const mocks = [
      {
        request: { query: HELLO_QUERY },
        result: { data: { hello: 'Hello from the Cadence API' } },
      },
    ];

    // When the app renders
    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>,
    );

    // Then the greeting appears
    expect(await screen.findByText('Hello from the Cadence API')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: 'Cadence' })).toBeInTheDocument();
  });

  it('shows an accessible error when the API is unreachable', async () => {
    // Given the API request fails
    const mocks = [{ request: { query: HELLO_QUERY }, error: new Error('network down') }];

    // When the app renders
    render(
      <MockedProvider mocks={mocks}>
        <App />
      </MockedProvider>,
    );

    // Then an alert explains the problem
    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't reach the API");
  });
});
