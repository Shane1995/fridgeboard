import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig/context';
import type { WebConfiguration } from '../useRemoteConfigContext/types';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { useQuery } from './index';

const setup = (configuration: WebConfiguration = TEST_WEB_CONFIGURATION) => {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <RemoteConfigContext.Provider value={configuration}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </RemoteConfigContext.Provider>
  );
  return { client, wrapper };
};

describe('useQuery', () => {
  it('resolves data from the query function', async () => {
    const queryFn = vi.fn(async () => ({ name: 'Fridge' }));
    const { wrapper } = setup();
    const { result } = renderHook(() => useQuery({ queryKey: ['thing'], queryFn }), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual({ name: 'Fridge' }));
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('exposes errors from the query function', async () => {
    const { wrapper } = setup({
      ...TEST_WEB_CONFIGURATION,
      queries: { default: { ...TEST_WEB_CONFIGURATION.queries.default, retry: 0 } },
    });
    const queryFn = vi.fn(async () => {
      throw new Error('boom');
    });
    const { result } = renderHook(() => useQuery({ queryKey: ['thing'], queryFn }), { wrapper });

    await waitFor(() => expect(result.current.error?.message).toBe('boom'));
  });

  it('applies the default configuration entry', async () => {
    const { client, wrapper } = setup();
    renderHook(() => useQuery({ queryKey: ['thing'], queryFn: async () => 1 }), { wrapper });

    await waitFor(() =>
      expect(
        client.getQueryCache().find({ queryKey: ['thing'] })?.observers[0]?.options.staleTime,
      ).toBe(30_000),
    );
  });

  it('lets the entry named after the first key element override the default', async () => {
    const { client, wrapper } = setup({
      ...TEST_WEB_CONFIGURATION,
      queries: { ...TEST_WEB_CONFIGURATION.queries, me: { staleTimeMs: 5_000 } },
    });
    renderHook(() => useQuery({ queryKey: ['me'], queryFn: async () => 1 }), { wrapper });

    await waitFor(() =>
      expect(
        client.getQueryCache().find({ queryKey: ['me'] })?.observers[0]?.options.staleTime,
      ).toBe(5_000),
    );
  });

  it('throws without a configuration provider', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
    );
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() =>
      renderHook(() => useQuery({ queryKey: ['thing'], queryFn: async () => 1 }), { wrapper }),
    ).toThrow();
  });
});
