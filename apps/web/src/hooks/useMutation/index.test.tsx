import type { WebConfiguration } from '../../hooks/useRemoteConfigContext/types';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { RemoteConfigContext } from '../../Context/RemoteConfig/context';
import { TEST_WEB_CONFIGURATION } from '../../testUtils/webConfiguration';
import { useMutation } from './index';

const configured = (mutations: WebConfiguration['mutations']): WebConfiguration => ({
  ...TEST_WEB_CONFIGURATION,
  mutations,
});

const setup = (configuration = TEST_WEB_CONFIGURATION) => {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <RemoteConfigContext.Provider value={configuration}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </RemoteConfigContext.Provider>
  );
  return { client, wrapper };
};

describe('useMutation', () => {
  it('passes variables to the mutation function and returns its result', async () => {
    const mutationFn = vi.fn(async (value: number) => value * 2);
    const { wrapper } = setup();
    const { result } = renderHook(() => useMutation({ mutationFn, mutationKey: ['double'] }), {
      wrapper,
    });

    await act(async () => {
      await expect(result.current.mutateAsync(21)).resolves.toBe(42);
    });
    expect(mutationFn).toHaveBeenCalledWith(21, expect.anything());
  });

  it('registers the mutation under its key', async () => {
    const { client, wrapper } = setup();
    const { result } = renderHook(
      () => useMutation({ mutationFn: async () => 1, mutationKey: ['named'] }),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.mutationKey).toEqual(['named']);
  });

  it('never retries a mutation that is not marked retryable, whatever the configuration says', async () => {
    const { client, wrapper } = setup(
      configured({ default: { retry: 2, timeoutMs: 10_000 }, signOut: { retry: 1 } }),
    );
    const { result } = renderHook(
      () => useMutation({ mutationFn: async () => 1, mutationKey: ['signOut'] }),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.retry).toBe(0);
  });

  it('uses the named configuration entry for a retryable mutation', async () => {
    const { client, wrapper } = setup(
      configured({ default: { retry: 2, timeoutMs: 10_000 }, signOut: { retry: 1 } }),
    );
    const { result } = renderHook(
      () => useMutation({ mutationFn: async () => 1, mutationKey: ['signOut'], retryable: true }),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.retry).toBe(1);
  });

  it('falls back to the configuration default entry for an unnamed retryable mutation', async () => {
    const { client, wrapper } = setup(configured({ default: { retry: 2, timeoutMs: 10_000 } }));
    const { result } = renderHook(
      () => useMutation({ mutationFn: async () => 1, mutationKey: ['other'], retryable: true }),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.retry).toBe(2);
  });
});
