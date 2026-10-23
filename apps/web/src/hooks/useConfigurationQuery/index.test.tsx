import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { getConfiguration } from '../../services/configuration';
import { useConfigurationQuery } from './index';

vi.mock('../../services/configuration', () => ({ getConfiguration: vi.fn() }));

const wrapperFor =
  (client: QueryClient) =>
  ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );

describe('useConfigurationQuery', () => {
  it('loads the configuration through getConfiguration', async () => {
    vi.mocked(getConfiguration).mockResolvedValue(TEST_WEB_CONFIGURATION);
    const { result } = renderHook(() => useConfigurationQuery(), {
      wrapper: wrapperFor(new QueryClient()),
    });

    await waitFor(() => expect(result.current.data).toEqual(TEST_WEB_CONFIGURATION));
  });

  it('applies the served query settings to the query client', async () => {
    vi.mocked(getConfiguration).mockResolvedValue({
      ...TEST_WEB_CONFIGURATION,
      queries: { ...TEST_WEB_CONFIGURATION.queries, me: { staleTimeMs: 7_000 } },
    });
    const client = new QueryClient();
    const { result } = renderHook(() => useConfigurationQuery(), { wrapper: wrapperFor(client) });

    await waitFor(() => expect(result.current.data).toBeDefined());

    expect(client.getQueryDefaults(['me']).staleTime).toBe(7_000);
  });
});
