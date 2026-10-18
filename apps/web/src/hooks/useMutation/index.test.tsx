import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useMutation } from './index';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
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
});
