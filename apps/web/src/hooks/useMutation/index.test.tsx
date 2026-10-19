import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useMutation } from './index';

const client = new QueryClient();
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={client}>{children}</QueryClientProvider>
);

describe('useMutation', () => {
  it('passes variables to the mutation function and returns its result', async () => {
    const mutationFn = vi.fn(async (value: number) => value * 2);
    const { result } = renderHook(() => useMutation({ mutationFn }), { wrapper });

    await act(async () => {
      await expect(result.current.mutateAsync(21)).resolves.toBe(42);
    });
    expect(mutationFn).toHaveBeenCalledWith(21, expect.anything());
  });

  it('registers the mutation under its key so defaults can target it', async () => {
    client.setMutationDefaults(['named'], { retry: 7 });
    const { result } = renderHook(
      () => useMutation({ mutationFn: async () => 1, mutationKey: ['named'] }),
      { wrapper },
    );

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(client.getMutationCache().getAll().at(-1)?.options.mutationKey).toEqual(['named']);
    expect(client.getMutationDefaults(['named'])).toEqual({ retry: 7 });
  });

  it('has no mutation key when none is given', async () => {
    client.getMutationCache().clear();
    const { result } = renderHook(() => useMutation({ mutationFn: async () => 1 }), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(client.getMutationCache().getAll()[0]?.options.mutationKey).toBeUndefined();
  });
});
