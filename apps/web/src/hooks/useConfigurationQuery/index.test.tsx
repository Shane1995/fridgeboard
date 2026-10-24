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
});
