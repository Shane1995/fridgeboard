import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { useQuery } from './index';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('useQuery', () => {
  it('resolves data from the query function', async () => {
    const queryFn = vi.fn(async () => ({ name: 'Fridge' }));
    const { result } = renderHook(() => useQuery({ queryKey: ['thing'], queryFn }), { wrapper });

    await waitFor(() => expect(result.current.data).toEqual({ name: 'Fridge' }));
    expect(queryFn).toHaveBeenCalledTimes(1);
  });

  it('exposes errors from the query function', async () => {
    const queryFn = vi.fn(async () => {
      throw new Error('boom');
    });
    const { result } = renderHook(() => useQuery({ queryKey: ['thing'], queryFn }), { wrapper });

    await waitFor(() => expect(result.current.error?.message).toBe('boom'));
  });
});
