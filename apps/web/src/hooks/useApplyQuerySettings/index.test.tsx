import { DEFAULT_WEB_CONFIGURATION } from '@fridgeboard/contract/configuration/web/constants';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { BASE_DEFAULT_OPTIONS } from '../../app/queryClient/constants';
import { getConfiguration } from '../../services/configuration';
import { RemoteConfigProvider } from '../../Context/RemoteConfig';
import { useApplyQuerySettings } from './index';

vi.mock('../../services/configuration', () => ({ getConfiguration: vi.fn() }));

const setup = () => {
  const client = new QueryClient({ defaultOptions: BASE_DEFAULT_OPTIONS });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>
      <RemoteConfigProvider>{children}</RemoteConfigProvider>
    </QueryClientProvider>
  );
  renderHook(() => useApplyQuerySettings(client), { wrapper });
  return client;
};

const retriesOf = (retry: unknown): number =>
  typeof retry === 'function'
    ? Array.from({ length: 10 }, (_, attempt) => attempt).filter((attempt) =>
        retry(attempt, new TypeError('offline')),
      ).length
    : Number(retry);

describe('useApplyQuerySettings', () => {
  it('applies the entries once the configuration arrives', async () => {
    vi.mocked(getConfiguration).mockResolvedValue({
      ...DEFAULT_WEB_CONFIGURATION,
      queries: { default: { retry: 4 }, me: { staleTimeMs: 7_000 } },
      mutations: { signOut: { retry: 0 } },
    });
    const client = setup();

    await waitFor(() => expect(client.getQueryDefaults(['me']).staleTime).toBe(7_000));
    expect(retriesOf(client.getDefaultOptions().queries?.retry)).toBe(4);
    expect(client.getMutationDefaults(['signOut'])).toEqual({ retry: 0 });
  });

  it('keeps the built-in defaults while the configuration is pending', () => {
    vi.mocked(getConfiguration).mockReturnValue(new Promise(() => {}));
    const client = setup();

    expect(client.getDefaultOptions().queries).toEqual(BASE_DEFAULT_OPTIONS.queries);
  });

  it('keeps the built-in defaults when the configuration is absent or failed', async () => {
    vi.mocked(getConfiguration).mockResolvedValue(DEFAULT_WEB_CONFIGURATION);
    const client = setup();

    await waitFor(() => expect(getConfiguration).toHaveBeenCalled());
    expect(client.getDefaultOptions().queries).toEqual(BASE_DEFAULT_OPTIONS.queries);
    expect(retriesOf(client.defaultQueryOptions({ queryKey: ['unnamed'] }).retry)).toBe(1);
  });
});
